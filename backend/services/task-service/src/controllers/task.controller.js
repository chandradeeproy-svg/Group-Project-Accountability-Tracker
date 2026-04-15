"use strict";

const taskService = require("../services/task.service");
const { createTaskSchema, updateStatusScehma } = require("../schema");
const { ValidationError, UnauthorizedError } = require("@gpa/shared");

async function createTaskController(req, res) {
  const body = { ...req.body };

  if (!body.ownerId && req.userId) {
    body.ownerId = req.userId;
  }

  const parsed = createTaskSchema.safeParse(body);
  if (!parsed.success) {
    throw new ValidationError("Invalid task payload", parsed.error.flatten());
  }

  await taskService.createTask(parsed.data);
  return res.status(201).json({ message: "Task created successfully" });
}

async function updateTaskStatusController(req, res) {
  const parsed = updateStatusScehma.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError("Invalid status payload", parsed.error.flatten());
  }

  if (!req.userId) {
    throw new UnauthorizedError();
  }

  await taskService.updateTaskStatus(req.params.id, req.userId, parsed.data.status);
  res.json({ message: "Task status updated successfully" });
}

async function getTask(req, res) {
  const tasks = await taskService.listTask(req.params.projectId);
  res.json(tasks);
}

async function getMyTasks(req, res) {
  if (!req.userId) {
    throw new UnauthorizedError();
  }

  const tasks = await taskService.listUserTasks(req.userId);
  res.json(tasks);
}

async function approveTaskController(req, res) {
  if (!req.userId) {
    throw new UnauthorizedError();
  }

  await taskService.approveTask(req.params.id, req.userId);
  res.json({ message: "Task approved successfully" });
}

async function getProjectActivityController(req, res) {
  const activity = await taskService.getProjectActivity(req.params.projectId);
  res.json(activity);
}

async function getAllActivityController(req, res) {
  if (!req.userId) {
    throw new UnauthorizedError();
  }

  const activity = await taskService.getAllUserActivity(req.userId);
  res.json(activity);
}

module.exports = {
  createTaskController,
  updateTaskStatusController,
  getTask,
  getMyTasks,
  approveTaskController,
  getProjectActivityController,
  getAllActivityController,
};
