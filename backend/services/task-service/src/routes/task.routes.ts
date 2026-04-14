import { Router } from "express";
import * as controller from "../controllers/task.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/tasks", authenticate as any, controller.createTaskController as any);

router.patch("/tasks/:id/status", authenticate as any, controller.updateTaskStatusController as any);

router.get("/projects/:projectId/tasks", authenticate as any, controller.getTask as any);

router.get("/projects/:projectId/activity", authenticate as any, controller.getProjectActivityController as any);

router.get("/activity", authenticate as any, controller.getAllActivityController as any);

router.get("/tasks/mine", authenticate as any, controller.getMyTasks as any);

router.patch("/tasks/:id/approve", authenticate as any, controller.approveTaskController as any);

export default router;
