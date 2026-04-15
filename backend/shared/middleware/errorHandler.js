"use strict";

const { AppError } = require("../errors");

function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function errorHandler(err, req, res, _next) {
  const logger = req.logger || console;

  if (err instanceof AppError) {
    logger.error("Request failed", {
      requestId: req.id,
      path: req.originalUrl,
      method: req.method,
      statusCode: err.statusCode,
      code: err.code,
      details: err.details,
    });

    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        requestId: req.id || null,
        details: err.details,
      },
    });
  }

  logger.error("Unhandled error", {
    requestId: req.id,
    path: req.originalUrl,
    method: req.method,
    err,
  });

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
      requestId: req.id || null,
    },
  });
}

module.exports = { asyncHandler, errorHandler };
