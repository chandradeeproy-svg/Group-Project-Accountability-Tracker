"use strict";

const { services } = require("../config/services");

/**
 * Route Resolver
 * 
 * Determines which downstream service should handle a given request path.
 * Order matters — more specific routes are checked first.
 *
 * Route Map:
 *   /projects/:id/tasks/*     → task-service
 *   /projects/:id/activity/*  → task-service
 *   /projects/*               → project-service
 *   /auth/*                   → auth-service
 *   /users/*                  → auth-service
 *   /tasks/*                  → task-service
 *   /activity/*               → task-service
 */

// Route rules ordered from most specific to least specific
const routeRules = [
  // Task-related routes nested under /projects/ (MUST come before project catch-all)
  {
    pattern: /^\/projects\/[^/]+\/tasks(\/|$|\?)/,
    service: services.TASK,
  },
  {
    pattern: /^\/projects\/[^/]+\/activity(\/|$|\?)/,
    service: services.TASK,
  },
  // Project service (catch-all for /projects/)
  {
    pattern: /^\/projects(\/|$|\?)/,
    service: services.PROJECT,
  },
  // Auth service
  {
    pattern: /^\/auth(\/|$|\?)/,
    service: services.AUTH,
  },
  {
    pattern: /^\/users(\/|$|\?)/,
    service: services.AUTH,
  },
  // Task service
  {
    pattern: /^\/tasks(\/|$|\?)/,
    service: services.TASK,
  },
  {
    pattern: /^\/activity(\/|$|\?)/,
    service: services.TASK,
  },
];

/**
 * Resolves a request path to a target service.
 * @param {string} path - The request path (after /api/v1 prefix is stripped)
 * @returns {{ name: string, url: string } | null} The target service or null if no match
 */
function resolveTarget(path) {
  for (const rule of routeRules) {
    if (rule.pattern.test(path)) {
      return rule.service;
    }
  }
  return null;
}

module.exports = { resolveTarget, routeRules };
