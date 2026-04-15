"use strict";

const express = require("express");
const projectRoutes = require("./routes/project.routes").default;
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
  serviceName: "project-service",
  readinessCheck: () => app.locals.pool.query("SELECT 1"),
});

app.use(projectRoutes);
app.use(errorHandler);

module.exports = { app };
