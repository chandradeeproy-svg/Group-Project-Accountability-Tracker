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
exports.getProjectMembersController = exports.addProjectMemberController = exports.getProjectByIdController = exports.createProjectController = exports.getUserProjectsController = void 0;
const projectService = __importStar(require("../services/project.service"));
const schema_1 = require("../schema");
const getUserProjectsController = async (req, res) => {
    try {
        const projects = await projectService.getUserProjects(req.userId);
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getUserProjectsController = getUserProjectsController;
const createProjectController = async (req, res) => {
    try {
        const parsed = schema_1.createProjectSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message, details: parsed.error });
        }
        const project = await projectService.createProject(parsed.data.name, req.userId);
        res.status(201).json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.createProjectController = createProjectController;
const getProjectByIdController = async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.projectId);
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProjectByIdController = getProjectByIdController;
const addProjectMemberController = async (req, res) => {
    try {
        const { projectId } = req.params;
        const parsed = schema_1.addMemberSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message, details: parsed.error });
        }
        await projectService.addProjectMember(projectId, parsed.data.userId, parsed.data.role);
        res.status(201).json({ message: "Member added successfully" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addProjectMemberController = addProjectMemberController;
const getProjectMembersController = async (req, res) => {
    try {
        const { projectId } = req.params;
        const members = await projectService.getProjectMembers(projectId);
        res.json(members);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProjectMembersController = getProjectMembersController;
