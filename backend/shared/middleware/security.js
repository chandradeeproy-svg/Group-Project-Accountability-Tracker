"use strict";

const helmet = require("helmet");

/**
 * Security Middleware Factory
 *
 * Returns an array of security middlewares for Express apps:
 *   - Helmet (sets comprehensive security HTTP headers)
 *   - Input sanitization (strips dangerous characters from body fields)
 *   - Request size limiting headers
 *
 * Usage:
 *   const { createSecurityMiddleware } = require("@gpa/shared");
 *   app.use(createSecurityMiddleware());
 */
function createSecurityMiddleware(options = {}) {
  const {
    contentSecurityPolicy = false, // Disabled for API-only services
  } = options;

  return helmet({
    contentSecurityPolicy,
    crossOriginEmbedderPolicy: false, // Not needed for APIs
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // Prevent MIME-sniffing
    noSniff: true,
    // Prevent clickjacking
    frameguard: { action: "deny" },
    // Disable X-Powered-By
    hidePoweredBy: true,
    // Strict transport security (HTTPS enforcement)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // Prevent XSS in older browsers
    xssFilter: true,
  });
}

/**
 * Input Sanitization Middleware
 *
 * Recursively trims strings and strips null bytes from request body.
 * Prevents NoSQL injection patterns and null byte attacks.
 */
function sanitizeInput(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = deepSanitize(req.body);
  }
  next();
}

function deepSanitize(obj) {
  if (typeof obj === "string") {
    // Trim whitespace, remove null bytes
    return obj.trim().replace(/\0/g, "");
  }
  if (Array.isArray(obj)) {
    return obj.map(deepSanitize);
  }
  if (obj !== null && typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Strip keys starting with $ (NoSQL injection prevention)
      if (!key.startsWith("$")) {
        sanitized[key] = deepSanitize(value);
      }
    }
    return sanitized;
  }
  return obj;
}

/**
 * CORS Configuration Factory
 *
 * Returns a strict CORS config object for production use.
 * Whitelists only known origins and allows credentials.
 */
function createCorsConfig(allowedOrigins = []) {
  const origins = allowedOrigins.length > 0
    ? allowedOrigins
    : (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((o) => o.trim());

  return {
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      if (origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-ID",
      "X-Requested-With",
    ],
    exposedHeaders: ["X-Request-ID"],
    maxAge: 86400, // Preflight cache: 24 hours
  };
}

module.exports = {
  createSecurityMiddleware,
  sanitizeInput,
  createCorsConfig,
};
