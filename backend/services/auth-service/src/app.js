"use strict";

const express = require("express");
const authRoutes = require("./routes/auth.routes").default;
const userRoutes = require("./routes/user.routes").default;
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
app.use(express.json({ limit: "10kb" })); // Limit body size to prevent DoS
app.use(sanitizeInput);

app.use((req, _res, next) => {
  req.logger = req.app.locals.logger;
  next();
});

registerHealthRoutes(app, {
  serviceName: "auth-service",
  readinessCheck: () => app.locals.pool.query("SELECT 1"),
});

app.use("/auth", authRoutes);
app.use(userRoutes);
app.use(errorHandler);

module.exports = { app };
