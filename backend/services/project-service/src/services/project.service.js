"use strict";

const { pool, NotFoundError } = require("@gpa/shared");
const { v4: uuidv4 } = require("uuid");

async function createProject(name, ownerId) {
  const projectId = uuidv4();

  await pool.query(
    `INSERT INTO projects (projectId, name, ownerId, createdAt)
     VALUES ($1, $2, $3, NOW())`,
    [projectId, name, ownerId],
  );

  await pool.query(
    `INSERT INTO project_members (projectId, userId, role, joinedAt)
     VALUES ($1, $2, 'OWNER', NOW())`,
    [projectId, ownerId],
  );

  return { projectId, name, ownerId };
}

async function getUserProjects(userId) {
  const result = await pool.query(
    `SELECT p.projectId, p.name, p.ownerId, p.createdAt, pm.role
     FROM projects p
     INNER JOIN project_members pm ON p.projectId = pm.projectId
     WHERE pm.userId = $1
     ORDER BY p.createdAt DESC`,
    [userId],
  );

  return result.rows;
}

async function getProjectById(projectId) {
  const result = await pool.query(
    "SELECT * FROM projects WHERE projectId = $1",
    [projectId],
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Project not found");
  }

  return result.rows[0];
}

async function addProjectMember(projectId, userId, role = "MEMBER") {
  await pool.query(
    `INSERT INTO project_members (projectId, userId, role, joinedAt)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (projectId, userId) DO NOTHING`,
    [projectId, userId, role],
  );
}

async function getProjectMembers(projectId) {
  const result = await pool.query(
    `SELECT pm.userId, pm.role, pm.joinedAt, u.name, u.email
     FROM project_members pm
     INNER JOIN users u ON pm.userId = u.id
     WHERE pm.projectId = $1
     ORDER BY pm.joinedAt ASC`,
    [projectId],
  );

  return result.rows;
}

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  addProjectMember,
  getProjectMembers,
};
