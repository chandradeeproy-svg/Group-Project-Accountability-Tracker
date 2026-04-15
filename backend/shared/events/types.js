"use strict";

/**
 * Event Type Constants
 *
 * Centralized event type definitions used across all services.
 * Naming convention: <domain>.<action> (dot-delimited for topic exchange routing)
 */

const EventTypes = {
  // Task domain events
  TASK_CREATED: "task.created",
  TASK_STATUS_CHANGED: "task.status.changed",
  TASK_APPROVED: "task.approved",

  // Project domain events
  PROJECT_CREATED: "project.created",
  MEMBER_ADDED: "member.added",

  // Auth domain events
  USER_REGISTERED: "user.registered",
  USER_LOGGED_IN: "user.logged_in",
};

module.exports = { EventTypes };
