"use strict";

const express = require("express");
const authRoutes = require("./routes/auth.routes").default;
const userRoutes = require("./routes/user.routes").default;
const { requestId, errorHandler } = require("@gpa/shared");

const app = express();

app.use(requestId);
app.use(express.json());
app.use((req, _res, next) => {
  req.logger = req.app.locals.logger;
  next();
});

app.use("/auth", authRoutes);
app.use(userRoutes);
app.use(errorHandler);

module.exports = { app };
