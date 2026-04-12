import { pool } from "@gpa/shared";
import { v4 as uuid } from "uuid";

export async function createProject(name: string, ownerId: string) {
  const projectId = uuid();
  
  await pool.query(
    `INSERT INTO projects ("projectid", "name", "ownerid", "createdat") 
     VALUES ($1, $2, $3, NOW())`,
    [projectId, name, ownerId]
  );

  // Add owner as a member
  await pool.query(
    `INSERT INTO project_members ("projectid", "userid", "role", "joinedat") 
     VALUES ($1, $2, 'OWNER', NOW())`,
    [projectId, ownerId]
  );

  return { projectId, name, ownerId };
}

export async function getUserProjects(userId: string) {
  const result = await pool.query(
    `SELECT p."projectid" AS "projectId", p."name", p."ownerid" AS "ownerId", p."createdat" AS "createdAt", pm."role"
     FROM projects p
     INNER JOIN project_members pm ON p."projectid" = pm."projectid"
     WHERE pm."userid" = $1
     ORDER BY p."createdat" DESC`,
    [userId]
  );

  return result.rows;
}

export async function getProjectById(projectId: string) {
  const result = await pool.query(
    `SELECT "projectid" AS "projectId", "name", "ownerid" AS "ownerId", "createdat" AS "createdAt" 
     FROM projects WHERE "projectid" = $1`,
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
    `INSERT INTO project_members ("projectid", "userid", "role", "joinedat") 
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT ("projectid", "userid") DO NOTHING`,
    [projectId, userId, role]
  );
}

export async function getProjectMembers(projectId: string) {
  const result = await pool.query(
    `SELECT pm."userid" AS "userId", pm."role", pm."joinedat" AS "joinedAt", u."name", u."email"
     FROM project_members pm
     INNER JOIN users u ON pm."userid" = u."id"
     WHERE pm."projectid" = $1
     ORDER BY pm."joinedat" ASC`,
    [projectId]
  );

  return result.rows;
}
