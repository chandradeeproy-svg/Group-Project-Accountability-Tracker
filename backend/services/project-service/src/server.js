"use strict";

require("dotenv/config");

const moduleAlias = require("module-alias");
const path = require("path");

moduleAlias.addAlias("@gpa/shared", path.join(__dirname, "../../../shared"));

const { app } = require("./app");
const { pool, loadServiceConfig, createLogger } = require("@gpa/shared");

const config = loadServiceConfig("project-service", { defaultPort: 4002 });
const logger = createLogger(config.serviceName);

app.locals.logger = logger;

app.listen(config.PORT, async () => {
  logger.info("Service started", { port: config.PORT });
  try {
    await pool.query("SELECT NOW()");
    logger.info("Database connected");
  } catch (err) {
    logger.error("Database connection failed", { err });
  }
});
