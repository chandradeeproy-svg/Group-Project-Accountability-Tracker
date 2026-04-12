import { pool } from "@gpa/shared";
import { v4 as uuid } from "uuid";

export async function createProject(name: string, ownerId: string) {
  const projectId = uuid();
  
  await pool.query(
    `INSERT INTO projects (projectId, name, ownerId, createdAt) 
     VALUES ($1, $2, $3, NOW())`,
    [projectId, name, ownerId]
  );

  // Add owner as a member
  await pool.query(
    `INSERT INTO project_members (projectId, userId, role, joinedAt) 
     VALUES ($1, $2, 'OWNER', NOW())`,
    [projectId, ownerId]
  );

  return { projectId, name, ownerId };
}

export async function getUserProjects(userId: string) {
  const result = await pool.query(
    `SELECT p.projectId, p.name, p.ownerId, p.createdAt, pm.role
     FROM projects p
     INNER JOIN project_members pm ON p.projectId = pm.projectId
     WHERE pm.userId = $1
     ORDER BY p.createdAt DESC`,
    [userId]
  );

  return result.rows;
}

export async function getProjectById(projectId: string) {
  const result = await pool.query(
    `SELECT * FROM projects WHERE projectId = $1`,
    [projectId]
  );

  if (result.rows.length === 0) {
    throw new Error("Project not found");
  }

  return result.rows[0];
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role: string = "MEMBER"
) {
  await pool.query(
    `INSERT INTO project_members (projectId, userId, role, joinedAt) 
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (projectId, userId) DO NOTHING`,
    [projectId, userId, role]
  );
}

export async function getProjectMembers(projectId: string) {
  const result = await pool.query(
    `SELECT pm.userId, pm.role, pm.joinedAt, u.name, u.email
     FROM project_members pm
     INNER JOIN users u ON pm.userId = u.id
     WHERE pm.projectId = $1
     ORDER BY pm.joinedAt ASC`,
    [projectId]
  );

  return result.rows;
}
