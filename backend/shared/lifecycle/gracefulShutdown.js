"use strict";

function setupGracefulShutdown({ server, logger, pool, serviceName }) {
  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info("Shutdown signal received", { signal, serviceName });

    server.close(async () => {
      try {
        if (pool) {
          await pool.end();
        }
        logger.info("Shutdown complete", { serviceName });
        process.exit(0);
      } catch (err) {
        logger.error("Shutdown failed", { serviceName, err });
        process.exit(1);
      }
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout", { serviceName });
      process.exit(1);
    }, 10000).unref();
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

module.exports = { setupGracefulShutdown };
