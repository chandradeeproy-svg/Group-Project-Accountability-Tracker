"use strict";

const {
  pool,
  recordEvent,
  NotFoundError,
  ForbiddenError,
} = require("@gpa/shared");
const { v4: uuidv4 } = require("uuid");

async function ensureProjectMembership(projectId, userId) {
  const membership = await pool.query(
    `SELECT role
     FROM project_members
     WHERE projectId = $1 AND userId = $2`,
    [projectId, userId],
  );

  if (membership.rowCount === 0) {
    throw new ForbiddenError("You are not a member of this project");
  }

  return membership.rows[0];
}

async function ensureProjectOwner(projectId, userId) {
  const membership = await ensureProjectMembership(projectId, userId);
  if (membership.role !== "OWNER") {
    throw new ForbiddenError("Only the project owner can perform this action");
  }
}

async function ensureTaskAssigneeIsMember(projectId, assigneeId) {
  await ensureProjectMembership(projectId, assigneeId);
}

async function createTask(data, actorId) {
  await ensureProjectOwner(data.projectId, actorId);
  await ensureTaskAssigneeIsMember(data.projectId, data.ownerId);

  const taskId = uuidv4();

  await pool.query(
    `INSERT INTO tasks (taskId, projectId, ownerId, title, status, deadline)
     VALUES ($1, $2, $3, $4, 'CREATED', $5)`,
    [taskId, data.projectId, data.ownerId, data.title, data.deadline || null],
  );

  await recordEvent({
    project_id: data.projectId,
    user_id: data.ownerId,
    type: "TASK_CREATED",
    source: "task-service",
    metadata: { taskId, title: data.title },
  });
}

async function updateTaskStatus(taskId, userId, status) {
  const result = await pool.query(
    "SELECT ownerId, projectId, status, title FROM tasks WHERE taskId = $1",
    [taskId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Task not found");
  }

  const task = result.rows[0];
  if (task.ownerid !== userId) {
    throw new ForbiddenError("Only the task owner can update the status");
  }

  if (task.status === status) {
    return;
  }

  await pool.query("UPDATE tasks SET status = $1 WHERE taskId = $2", [status, taskId]);

  await recordEvent({
    project_id: task.projectid,
    user_id: userId,
    type: "TASK_STATUS_CHANGED",
    source: "task-service",
    metadata: {
      taskId,
      from: task.status,
      to: status,
      taskTitle: task.title,
    },
  });
}

async function listTask(projectId, userId) {
  await ensureProjectMembership(projectId, userId);

  const result = await pool.query(
    "SELECT * FROM tasks WHERE projectId = $1 ORDER BY createdAt DESC",
    [projectId],
  );
  return result.rows;
}

async function listUserTasks(userId) {
  const result = await pool.query(
    `SELECT t.*, p.name as projectName, p.ownerId as projectOwnerId
     FROM tasks t
     JOIN projects p ON t.projectId = p.projectId
     WHERE t.ownerId = $1
     ORDER BY t.createdAt DESC`,
    [userId],
  );
  return result.rows;
}

async function approveTask(taskId, userId) {
  const result = await pool.query(
    `SELECT t.projectId, t.status, t.title, p.ownerId AS projectOwnerId
     FROM tasks t
     JOIN projects p ON p.projectId = t.projectId
     WHERE t.taskId = $1`,
    [taskId],
  );

  if (result.rowCount === 0) {
    throw new NotFoundError("Task not found");
  }

  const task = result.rows[0];
  if (task.projectownerid !== userId) {
    throw new ForbiddenError("Only the project owner can approve tasks");
  }

  await pool.query("UPDATE tasks SET status = 'APPROVED' WHERE taskId = $1", [taskId]);

  await recordEvent({
    project_id: task.projectid,
    user_id: userId,
    type: "TASK_APPROVED",
    source: "task-service",
    metadata: { taskId, taskTitle: task.title },
  });
}

async function getProjectActivity(projectId, userId) {
  await ensureProjectMembership(projectId, userId);

  const result = await pool.query(
    `SELECT e.*, u.name as userName
     FROM evidence_events e
     LEFT JOIN users u ON e.user_id = u.id
     WHERE e.project_id = $1
     ORDER BY e.timestamp DESC`,
    [projectId],
  );
  return result.rows;
}

async function getAllUserActivity(userId) {
  const result = await pool.query(
    `SELECT e.*, u.name as userName, p.name as projectName
     FROM evidence_events e
     LEFT JOIN users u ON e.user_id = u.id
     JOIN projects p ON e.project_id = p.projectId
     JOIN project_members pm ON p.projectId = pm.projectId
     WHERE pm.userId = $1
     ORDER BY e.timestamp DESC
     LIMIT 50`,
    [userId],
  );
  return result.rows;
}

module.exports = {
  createTask,
  updateTaskStatus,
  listTask,
  listUserTasks,
  approveTask,
  getProjectActivity,
  getAllUserActivity,
  ensureProjectMembership,
  ensureProjectOwner,
};
