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

const config = loadServiceConfig("project-service", { defaultPort: 4002 });
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

  // React to task events — useful for project-level stats, notifications, etc.
  await subscribe(EventTypes.TASK_CREATED, async (event) => {
    logger.info("Received task.created event", {
      projectId: event.payload?.project_id,
      taskTitle: event.payload?.metadata?.title,
    });
  }, subOpts);

  await subscribe(EventTypes.TASK_STATUS_CHANGED, async (event) => {
    logger.info("Received task.status.changed event", {
      projectId: event.payload?.project_id,
      from: event.payload?.metadata?.from,
      to: event.payload?.metadata?.to,
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
