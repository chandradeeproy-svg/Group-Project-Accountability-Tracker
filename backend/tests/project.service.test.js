"use strict";

const assert = require("node:assert/strict");
const shared = require("../shared");
const projectService = require("../services/project-service/src/services/project.service");

async function testAddProjectMemberRejectsNonOwner() {
  const originalQuery = shared.pool.query;
  const calls = [];

  try {
    shared.pool.query = async (sql, params) => {
      calls.push({ sql, params });

      if (sql.includes("FROM project_members")) {
        return { rowCount: 1, rows: [{ role: "MEMBER" }] };
      }

      throw new Error("Unexpected query");
    };

    await assert.rejects(
      () => projectService.addProjectMember("project-1", "user-2", "MEMBER", "user-1"),
      /Only the project owner can perform this action/,
    );

    assert.equal(calls.length, 1);
  } finally {
    shared.pool.query = originalQuery;
  }
}

module.exports = {
  testAddProjectMemberRejectsNonOwner,
};
