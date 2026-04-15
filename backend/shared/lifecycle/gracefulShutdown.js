"use strict";

/**
 * Graceful Shutdown Handler
 *
 * Handles SIGINT/SIGTERM signals to cleanly shut down:
 *   1. Stop accepting new connections
 *   2. Run custom cleanup (e.g. close event bus)
 *   3. Drain the database pool
 *   4. Exit cleanly
 *
 * Force-exits after 10s timeout to prevent zombie processes.
 */
function setupGracefulShutdown({ server, logger, pool, serviceName, onShutdown }) {
  let shuttingDown = false;

  async function shutdown(signal) {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    logger.info("Shutdown signal received", { signal, serviceName });

    server.close(async () => {
      try {
        // Run custom cleanup (event bus, caches, etc.)
        if (onShutdown) {
          await onShutdown();
        }

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
