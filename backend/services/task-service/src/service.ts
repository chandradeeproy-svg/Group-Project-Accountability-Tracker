import { pool, recordEvent } from "@gpa/shared";
import { v4 as uuid } from "uuid";

export async function createTask(data: {
  projectId: string;
  title: string;
  ownerId: string;
  deadline?: string;
}) {
  const taskId = uuid();

  await pool.query(
    `
        INSERT INTO tasks
        
        ("taskid","projectid","ownerid","title","status","deadline")
        VALUES ($1,$2,$3,$4,'CREATED',$5)`,
    [taskId, data.projectId, data.ownerId, data.title, data.deadline ? data.deadline : null],
  );

  await recordEvent({
    project_id: data.projectId,
    user_id: data.ownerId,
    type: "TASK_CREATED",
    source: "task-service",
    metadata: { taskId, title: data.title },
  });
}

export async function updateTaskStatus(
  taskId: string,
  userId: string,
  status: "IN_PROGRESS" | "DONE" | "CANCELLED",
) {
  const res = await pool.query(
    `SELECT "ownerid" AS "ownerId", "projectid" AS "projectId", "status", "title" FROM tasks WHERE "taskid"=$1`,
    [taskId],
  );

  if (res.rowCount === 0) {
    throw new Error("Task not found");
  }

  const task = res.rows[0];

  if (task.ownerId !== userId) {
    throw new Error("Only the task owner can update the status");
  }

  if (task.status === status) {
    return;
  }

  await pool.query(`UPDATE tasks SET status = $1 WHERE "taskid"=$2`, [
    status,
    taskId,
  ]);

  await recordEvent({
    project_id: task.projectId,
    user_id: userId,
    type: "TASK_STATUS_CHANGED",
    source: "task-service",
    metadata: { 
      taskId, 
      from: task.status, 
      to: status,
      taskTitle: task.title 
    },
  });
}

export async function listTask(projectId: string) {
  const res = await pool.query(
    `SELECT 
      "taskid" AS "taskId", 
      "projectid" AS "projectId", 
      "ownerid" AS "ownerId", 
      "title", 
      "status", 
      "deadline", 
      "createdat" AS "createdAt" 
     FROM tasks WHERE "projectid"=$1 ORDER BY "createdat" DESC`,
    [projectId],
  );
  return res.rows;
}

export async function listUserTasks(userId: string) {
  const res = await pool.query(
    `SELECT 
        t."taskid" AS "taskId", 
        t."projectid" AS "projectId", 
        t."ownerid" AS "ownerId", 
        t."title", 
        t."status", 
        t."deadline", 
        t."createdat" AS "createdAt",
        p."name" as "projectName", 
        p."ownerid" as "projectOwnerId"
     FROM tasks t
     JOIN projects p ON t."projectid" = p."projectid"
     WHERE t."ownerid"=$1 
     ORDER BY t."createdat" DESC`,
    [userId],
  );
  return res.rows;
}

export async function approveTask(taskId: string, userId: string) {
  // Join with projects to determine if the user is the project owner
  const res = await pool.query(
    `SELECT 
        t."projectid" AS "projectId", 
        t."status", 
        t."title", 
        p."ownerid" AS "projectOwnerId"
     FROM tasks t
     JOIN projects p ON t."projectid" = p."projectid"
     WHERE t."taskid"=$1`,
    [taskId],
  );

  if (res.rowCount === 0) {
    throw new Error("Task not found");
  }

  const task = res.rows[0];

  // SECURITY FIX: Verify the user is the project owner
  if (task.projectOwnerId !== userId) {
    throw new Error("Unauthorized: Only the project owner can approve tasks");
  }

  // LOGIC FIX: Only allow approving tasks that are 'DONE'
  if (task.status !== 'DONE') {
    throw new Error("Only tasks in 'DONE' status can be approved");
  }

  await pool.query(`UPDATE tasks SET status = 'APPROVED' WHERE "taskid"=$1`, [
    taskId,
  ]);

  await recordEvent({
    project_id: task.projectId,
    user_id: userId, 
    type: "TASK_APPROVED" as any, 
    source: "task-service",
    metadata: { taskId, taskTitle: task.title },
  });
}

export async function getProjectActivity(projectId: string) {
  const res = await pool.query(
    `SELECT e.*, u.name as "userName" 
     FROM evidence_events e
     LEFT JOIN users u ON e.user_id = u.id
     WHERE e.project_id = $1
     ORDER BY e.timestamp DESC`,
    [projectId],
  );
  return res.rows;
}

export async function getAllUserActivity(userId: string) {
  const res = await pool.query(
    `SELECT e.*, u.name as "userName", p.name as "projectName"
     FROM evidence_events e
     LEFT JOIN users u ON e.user_id = u.id
     JOIN projects p ON e.project_id = p.projectId
     JOIN project_members pm ON p.projectId = pm.projectId
     WHERE pm.userId = $1
     ORDER BY e.timestamp DESC
     LIMIT 50`,
    [userId],
  );
  return res.rows;
}
