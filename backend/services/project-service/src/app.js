"use strict";

const express = require("express");
const projectRoutes = require("./routes/project.routes").default;
const {
  requestId,
  errorHandler,
  registerHealthRoutes,
  createSecurityMiddleware,
  sanitizeInput,
} = require("@gpa/shared");

const app = express();

// --- Security hardening ---
app.use(createSecurityMiddleware());
app.use(requestId);
app.use(express.json({ limit: "10kb" }));
app.use(sanitizeInput);

app.use((req, _res, next) => {
  req.logger = req.app.locals.logger;
  next();
});

registerHealthRoutes(app, {
  serviceName: "project-service",
  readinessCheck: () => app.locals.pool.query("SELECT 1"),
});

app.use(projectRoutes);
app.use(errorHandler);

module.exports = { app };
