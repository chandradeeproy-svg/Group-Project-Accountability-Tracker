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
        
        (taskId,projectId,ownerId,title,status,deadline)
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
    `SELECT ownerId, projectId, status, title FROM tasks WHERE taskId=$1`,
    [taskId],
  );

  if (res.rowCount === 0) {
    throw new Error("Task not found");
  }

  const task = res.rows[0];

  if (task.ownerid !== userId) {
    throw new Error("Only the task owner can update the status");
  }

  if (task.status === status) {
    return;
  }

  await pool.query(`UPDATE tasks SET status = $1 WHERE taskId=$2`, [
    status,
    taskId,
  ]);

  await recordEvent({
    project_id: task.projectid,
    user_id: userId,
    type: "TASK_STATUS_CHANGED",
    source: "task-service",
    metadata: { 
      taskId, 
      from: task.status, 
      to: status,
      taskTitle: task.title // Added title for better logs
    },
  });
}

export async function listTask(projectId: string) {
  const res = await pool.query(
    `SELECT * FROM tasks WHERE projectId=$1 ORDER BY createdAt DESC`,
    [projectId],
  );
  return res.rows;
}

export async function listUserTasks(userId: string) {
  const res = await pool.query(
    `SELECT t.*, p.name as projectName, p.ownerId as projectOwnerId
     FROM tasks t
     JOIN projects p ON t.projectId = p.projectId
     WHERE t.ownerId=$1 
     ORDER BY t.createdAt DESC`,
    [userId],
  );
  return res.rows;
}
export async function approveTask(taskId: string, userId: string) {
  const res = await pool.query(
    `SELECT projectId, status, title FROM tasks WHERE taskId=$1`,
    [taskId],
  );

  if (res.rowCount === 0) {
    throw new Error("Task not found");
  }

  const task = res.rows[0];

  await pool.query(`UPDATE tasks SET status = 'APPROVED' WHERE taskId=$1`, [
    taskId,
  ]);

  await recordEvent({
    project_id: task.projectid,
    user_id: userId, 
    type: "TASK_APPROVED" as any, 
    source: "task-service",
    metadata: { taskId, taskTitle: task.title },
  });
}

export async function getProjectActivity(projectId: string) {
  const res = await pool.query(
    `SELECT e.*, u.name as userName 
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
  return res.rows;
}
