"use strict";

const express = require("express");
const taskRoutes = require("./routes/task.routes").default;
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
  serviceName: "task-service",
  readinessCheck: () => app.locals.pool.query("SELECT 1"),
});

app.use(taskRoutes);
app.use(errorHandler);

module.exports = { app };
