"use strict";

const express = require("express");
const cors = require("cors");
const httpProxy = require("http-proxy");
const { requestId } = require("./middleware/requestId");
const { requestLogger } = require("./middleware/requestLogger");
const { createRateLimiter } = require("./middleware/rateLimit");
const { resolveTarget } = require("./proxy/router");
const { services } = require("./config/services");

const app = express();

const proxy = httpProxy.createProxyServer({
  changeOrigin: true,
  xfwd: process.env.NODE_ENV === "production",
});

// --- CORS lockdown ---
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "X-Requested-With"],
  exposedHeaders: ["X-Request-ID"],
  maxAge: 86400,
}));

app.use(requestId);
app.use(requestLogger);

// --- Rate limiting ---
app.use(createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: Number(process.env.RATE_LIMIT_MAX || 120),
}));

// --- Security headers (gateway-level, lightweight since no helmet dep here) ---
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0"); // Modern browsers don't need this, disable to avoid false positives
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("X-Download-Options", "noopen");
  res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
  res.removeHeader("X-Powered-By");
  next();
});

// --- Health endpoints ---
app.get("/health/live", (_req, res) => {
  res.json({
    status: "ok",
    service: "gateway",
    check: "live",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/ready", async (_req, res) => {
  const checks = await Promise.allSettled([
    fetch(`${services.AUTH.url}/health/ready`),
    fetch(`${services.PROJECT.url}/health/ready`),
    fetch(`${services.TASK.url}/health/ready`),
  ]);

  const ready = checks.every(
    (check) => check.status === "fulfilled" && check.value.ok,
  );

  res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "degraded",
    service: "gateway",
    check: "ready",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "gateway",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
    services: {
      auth: services.AUTH.url,
      project: services.PROJECT.url,
      task: services.TASK.url,
    },
  });
});

// --- API proxy ---
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

// --- 404 catch-all ---
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "This route does not exist. All API routes are under /api/v1/",
      requestId: req.id,
    },
  });
});

// --- Proxy event handlers ---
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
