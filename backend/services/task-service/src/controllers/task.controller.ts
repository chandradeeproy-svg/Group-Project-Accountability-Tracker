import { Request, Response } from "express";
import * as taskService from "../services/task.service";
import { createTaskSchema, updateStatusScehma } from "../schema";
import { AuthRequest } from "../middlewares/auth.middleware";

export async function createTaskController(req: AuthRequest, res: Response) {
  const body = { ...req.body };
  
  // Default ownerId to the authenticated user if not provided (assignment)
  if (!body.ownerId && req.userId) {
    body.ownerId = req.userId;
  }

  const parsed = createTaskSchema.safeParse(body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }

  try {
    await taskService.createTask(parsed.data as any);
    return res.status(201).json({ message: "Task created successfully" });
  } catch (error: any) {
    console.error("Task creation failed:", error);
    return res.status(500).json({ error: error.message || "Internal Server Error" });
  }
}

export async function updateTaskStatusController(req: AuthRequest, res: Response) {
  const parsed = updateStatusScehma.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error });
  }

  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await taskService.updateTaskStatus(
        req.params.id as string,
        userId,
        parsed.data.status,
      );
    
      res.json({ message: "Task status updated successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getTask(req: Request, res: Response) {
  try {
    const tasks = await taskService.listTask(req.params.projectId as string);
    res.json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMyTasks(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const tasks = await taskService.listUserTasks(userId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
}

export async function approveTaskController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    await taskService.approveTask(req.params.id, userId);
    res.json({ message: "Task approved successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getProjectActivityController(req: AuthRequest, res: Response) {
  try {
    const activity = await taskService.getProjectActivity(req.params.projectId);
    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getAllActivityController(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const activity = await taskService.getAllUserActivity(userId);
    res.json(activity);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
