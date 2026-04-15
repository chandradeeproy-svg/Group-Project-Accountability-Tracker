"use strict";

const buckets = new Map();

function createRateLimiter({ windowMs = 60_000, maxRequests = 120 } = {}) {
  return function rateLimit(req, res, next) {
    const key = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now > entry.resetAt) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "Too many requests, please try again later.",
          requestId: req.id || null,
        },
      });
    }

    entry.count += 1;
    next();
  };
}

module.exports = { createRateLimiter };
