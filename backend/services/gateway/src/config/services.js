"use strict";

/**
 * Service Registry
 * 
 * Maps service names to their base URLs.
 * In production, these would come from service discovery (Consul, K8s DNS, etc.)
 * For now, they're loaded from environment variables.
 */

const services = {
  AUTH: {
    name: "auth-service",
    url: process.env.AUTH_SERVICE_URL || "http://localhost:4001",
  },
  PROJECT: {
    name: "project-service",
    url: process.env.PROJECT_SERVICE_URL || "http://localhost:4002",
  },
  TASK: {
    name: "task-service",
    url: process.env.TASK_SERVICE_URL || "http://localhost:4003",
  },
};

module.exports = { services };
