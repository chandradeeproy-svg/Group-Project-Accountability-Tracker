"use strict";

const express = require("express");
const authRoutes = require("./routes/auth.routes").default;
const userRoutes = require("./routes/user.routes").default;
const { requestId, errorHandler, registerHealthRoutes } = require("@gpa/shared");

const app = express();

app.use(requestId);
app.use(express.json());
app.use((req, _res, next) => {
  req.logger = req.app.locals.logger;
  next();
});

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
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
