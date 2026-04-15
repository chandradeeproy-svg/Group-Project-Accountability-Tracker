"use strict";

/**
 * Request Logger Middleware
 * 
 * Logs every request with method, path, status code, and response time.
 * Uses the X-Request-ID for correlation.
 * In Phase 2, this will be replaced with structured JSON logging (pino).
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const requestId = req.id || "-";

    // Color-coded status for dev readability
    const statusColor =
      status >= 500 ? "\x1b[31m" :  // red
      status >= 400 ? "\x1b[33m" :  // yellow
      status >= 300 ? "\x1b[36m" :  // cyan
      "\x1b[32m";                   // green
    const reset = "\x1b[0m";

    console.log(
      `[GATEWAY] ${method} ${path} ${statusColor}${status}${reset} ${duration}ms [${requestId}]`
    );
  });

  next();
}

module.exports = { requestLogger };
