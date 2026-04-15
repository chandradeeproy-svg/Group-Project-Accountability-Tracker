"use strict";

require("dotenv/config");

const moduleAlias = require("module-alias");
const path = require("path");

moduleAlias.addAlias("@gpa/shared", path.join(__dirname, "../../../shared"));

const { app } = require("./app");
const { setupGracefulShutdown, createLogger } = require("@gpa/shared");

const PORT = process.env.GATEWAY_PORT || 4000;
const logger = createLogger("gateway");

const server = app.listen(PORT, () => {
  logger.info("Service started", { port: PORT });
  logger.info("Gateway health endpoint available", {
    healthUrl: `http://localhost:${PORT}/health`,
  });
});

setupGracefulShutdown({
  server,
  logger,
  serviceName: "gateway",
});
