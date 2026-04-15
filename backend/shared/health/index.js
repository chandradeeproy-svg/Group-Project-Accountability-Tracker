"use strict";

function registerHealthRoutes(app, options) {
  const { serviceName, readinessCheck } = options;

  app.get("/health/live", (_req, res) => {
    res.status(200).json({
      status: "ok",
      service: serviceName,
      check: "live",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/health/ready", async (_req, res) => {
    try {
      await readinessCheck();
      res.status(200).json({
        status: "ok",
        service: serviceName,
        check: "ready",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: "error",
        service: serviceName,
        check: "ready",
        timestamp: new Date().toISOString(),
      });
    }
  });
}

module.exports = { registerHealthRoutes };
