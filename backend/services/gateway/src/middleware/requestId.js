"use strict";

const { v4: uuidv4 } = require("uuid");

/**
 * Request ID Middleware
 * 
 * Generates a unique X-Request-ID for every incoming request.
 * If the client already provides one, it's preserved (useful for distributed tracing).
 * The ID is set on both the request and response headers.
 */
function requestId(req, res, next) {
  const id = req.headers["x-request-id"] || uuidv4();

  // Attach to request for downstream services and logging
  req.id = id;
  req.headers["x-request-id"] = id;

  // Echo back in response for client-side correlation
  res.setHeader("X-Request-ID", id);

  next();
}

module.exports = { requestId };
