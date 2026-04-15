"use strict";

const express = require("express");
const cors = require("cors");
const httpProxy = require("http-proxy");
const { requestId } = require("./middleware/requestId");
const { requestLogger } = require("./middleware/requestLogger");
const { resolveTarget } = require("./proxy/router");
const { services } = require("./config/services");

const app = express();

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  xfwd: process.env.NODE_ENV === "production",
});

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
}));

app.use(requestId);
app.use(requestLogger);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "gateway",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      auth: services.AUTH.url,
      project: services.PROJECT.url,
      task: services.TASK.url,
    },
  });
});

app.use("/api/v1", (req, res) => {
  const target = resolveTarget(req.url);

  if (!target) {
    return res.status(404).json({
      error: {
        code: "ROUTE_NOT_FOUND",
        message: `No service found for path: /api/v1${req.url}`,
        requestId: req.id,
      },
    });
  }

  proxy.web(req, res, { target: target.url }, (err) => {
    console.error(
      `[GATEWAY] Proxy error -> ${target.name} (${target.url}): ${err.message} [${req.id}]`,
    );

    if (!res.headersSent) {
      res.status(502).json({
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: `${target.name} is unavailable`,
          requestId: req.id,
        },
      });
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "This route does not exist. All API routes are under /api/v1/",
      requestId: req.id,
    },
  });
});

proxy.on("proxyReq", (proxyReq, req) => {
  if (req.id) {
    proxyReq.setHeader("X-Request-ID", req.id);
  }
});

proxy.on("error", (err, req, res) => {
  console.error(`[GATEWAY] Proxy error: ${err.message} [${req.id || "-"}]`);

  if (!res.headersSent && res.writeHead) {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      error: {
        code: "BAD_GATEWAY",
        message: "Downstream service error",
        requestId: req.id || null,
      },
    }));
  }
});

module.exports = { app };
