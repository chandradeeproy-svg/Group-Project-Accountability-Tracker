"use strict";

const assert = require("node:assert/strict");
const shared = require("../shared");
const taskService = require("../services/task-service/src/services/task.service");

async function testCreateTaskRejectsNonOwnerCreators() {
  const originalQuery = shared.pool.query;

  try {
    shared.pool.query = async (sql) => {
      if (sql.includes("FROM project_members")) {
        return { rowCount: 1, rows: [{ role: "MEMBER" }] };
      }

      throw new Error("Unexpected query");
    };

    await assert.rejects(
      () => taskService.createTask({
        projectId: "project-1",
        ownerId: "assignee-1",
        title: "Write docs",
      }, "actor-1"),
      /Only the project owner can perform this action/,
    );
  } finally {
    shared.pool.query = originalQuery;
  }
}

async function testListTaskRejectsNonMembers() {
  const originalQuery = shared.pool.query;

  try {
    shared.pool.query = async (sql) => {
      if (sql.includes("FROM project_members")) {
        return { rowCount: 0, rows: [] };
      }

      throw new Error("Unexpected query");
    };

    await assert.rejects(
      () => taskService.listTask("project-1", "user-1"),
      /You are not a member of this project/,
    );
  } finally {
    shared.pool.query = originalQuery;
  }
}

module.exports = {
  testCreateTaskRejectsNonOwnerCreators,
  testListTaskRejectsNonMembers,
};
