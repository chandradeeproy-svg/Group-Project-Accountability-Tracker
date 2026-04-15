"use strict";

const { z } = require("zod");

function loadServiceConfig(serviceName, options = {}) {
  const {
    defaultPort,
    requireDatabase = true,
  } = options;

  const schema = z.object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(defaultPort),
    DATABASE_URL: requireDatabase
      ? z.string().min(1, "DATABASE_URL is required")
      : z.string().optional(),
    JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
    JWT_EXPIRES_IN: z.string().default("1d"),
    CORS_ORIGIN: z.string().default("http://localhost:5173"),
    RABBIT_URL: z.string().optional(),
    PG_POOL_MAX: z.coerce.number().int().positive().default(10),
    PG_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    PG_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  });

  const parsed = schema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
    throw new Error(`[${serviceName}] Invalid environment configuration: ${issues}`);
  }

  return {
    serviceName,
    ...parsed.data,
  };
}

module.exports = { loadServiceConfig };
