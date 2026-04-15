"use strict";

const express = require("express");
const taskRoutes = require("./routes/task.routes").default;
const { requestId, errorHandler } = require("@gpa/shared");

const app = express();

app.use(requestId);
app.use(express.json());
app.use((req, _res, next) => {
  req.logger = req.app.locals.logger;
  next();
});

app.use(taskRoutes);
app.use(errorHandler);

module.exports = { app };
