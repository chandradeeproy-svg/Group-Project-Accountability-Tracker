"use strict";

require("dotenv/config");

const moduleAlias = require("module-alias");
const path = require("path");

moduleAlias.addAlias("@gpa/shared", path.join(__dirname, "../../../shared"));

const { app } = require("./app");
const {
  pool,
  loadServiceConfig,
  createLogger,
  setupGracefulShutdown,
  subscribe,
  EventTypes,
  closeEventBus,
} = require("@gpa/shared");

const config = loadServiceConfig("task-service", { defaultPort: 4003 });
const logger = createLogger(config.serviceName);

app.locals.logger = logger;
app.locals.pool = pool;

// --- Event Subscriptions ---
async function setupEventSubscriptions() {
  const subOpts = {
    rabbitUrl: config.RABBIT_URL,
    serviceName: config.serviceName,
    logger,
  };

  // React to new project members — could pre-warm caches, send welcome notifications, etc.
  await subscribe(EventTypes.MEMBER_ADDED, async (event) => {
    logger.info("Received member.added event", {
      projectId: event.payload?.project_id,
      userId: event.payload?.user_id,
    });
  }, subOpts);

  // React to project creation
  await subscribe(EventTypes.PROJECT_CREATED, async (event) => {
    logger.info("Received project.created event", {
      projectId: event.payload?.project_id,
    });
  }, subOpts);
}

const server = app.listen(config.PORT, async () => {
  logger.info("Service started", { port: config.PORT });
  try {
    await pool.query("SELECT NOW()");
    logger.info("Database connected");
  } catch (err) {
    logger.error("Database connection failed", { err });
  }

  // Set up event subscriptions after server starts
  await setupEventSubscriptions();
});

setupGracefulShutdown({
  server,
  logger,
  pool,
  serviceName: config.serviceName,
  onShutdown: closeEventBus,
});
