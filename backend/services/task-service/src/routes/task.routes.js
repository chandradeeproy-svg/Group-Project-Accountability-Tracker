"use strict";

const { Router } = require("express");
const controller = require("../controllers/task.controller");
const { authenticate, asyncHandler } = require("@gpa/shared");

const router = Router();

router.post("/tasks", authenticate, asyncHandler(controller.createTaskController));
router.patch("/tasks/:id/status", authenticate, asyncHandler(controller.updateTaskStatusController));
router.get("/projects/:projectId/tasks", authenticate, asyncHandler(controller.getTask));
router.get("/projects/:projectId/activity", authenticate, asyncHandler(controller.getProjectActivityController));
router.get("/activity", authenticate, asyncHandler(controller.getAllActivityController));
router.get("/tasks/mine", authenticate, asyncHandler(controller.getMyTasks));
router.patch("/tasks/:id/approve", authenticate, asyncHandler(controller.approveTaskController));

module.exports = { default: router };
