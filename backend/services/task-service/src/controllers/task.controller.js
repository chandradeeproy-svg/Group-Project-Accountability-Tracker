"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskController = createTaskController;
exports.updateTaskStatusController = updateTaskStatusController;
exports.getTask = getTask;
exports.getMyTasks = getMyTasks;
exports.approveTaskController = approveTaskController;
exports.getProjectActivityController = getProjectActivityController;
exports.getAllActivityController = getAllActivityController;
const taskService = __importStar(require("../services/task.service"));
const schema_1 = require("../schema");
async function createTaskController(req, res) {
    const body = { ...req.body };
    // Default ownerId to the authenticated user if not provided (assignment)
    if (!body.ownerId && req.userId) {
        body.ownerId = req.userId;
    }
    const parsed = schema_1.createTaskSchema.safeParse(body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
    }
    try {
        await taskService.createTask(parsed.data);
        return res.status(201).json({ message: "Task created successfully" });
    }
    catch (error) {
        console.error("Task creation failed:", error);
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
}
async function updateTaskStatusController(req, res) {
    const parsed = schema_1.updateStatusScehma.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error });
    }
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        await taskService.updateTaskStatus(req.params.id, userId, parsed.data.status);
        res.json({ message: "Task status updated successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getTask(req, res) {
    try {
        const tasks = await taskService.listTask(req.params.projectId);
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getMyTasks(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const tasks = await taskService.listUserTasks(userId);
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function approveTaskController(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        await taskService.approveTask(req.params.id, userId);
        res.json({ message: "Task approved successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getProjectActivityController(req, res) {
    try {
        const activity = await taskService.getProjectActivity(req.params.projectId);
        res.json(activity);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
async function getAllActivityController(req, res) {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const activity = await taskService.getAllUserActivity(userId);
        res.json(activity);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}
