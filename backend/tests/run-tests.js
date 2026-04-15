"use strict";

const projectTests = require("./project.service.test");
const taskTests = require("./task.service.test");

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    throw error;
  }
}

async function main() {
  await runTest(
    "project-service rejects non-owner member additions",
    projectTests.testAddProjectMemberRejectsNonOwner,
  );

  await runTest(
    "task-service rejects task creation by non-owner",
    taskTests.testCreateTaskRejectsNonOwnerCreators,
  );

  await runTest(
    "task-service rejects task listing for non-members",
    taskTests.testListTaskRejectsNonMembers,
  );
}

main().catch(() => {
  process.exitCode = 1;
});
