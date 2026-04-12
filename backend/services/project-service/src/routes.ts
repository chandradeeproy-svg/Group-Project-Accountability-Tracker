import { Router } from "express";
import { authenticate, AuthRequest } from "./middleware/auth";
import * as projectService from "./service";

const router = Router();

// Get user's projects
router.get("/projects", authenticate, async (req: AuthRequest, res) => {
  try {
    const projects = await projectService.getUserProjects(req.userId!);
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new project
router.post("/projects", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await projectService.createProject(name, req.userId!);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project by ID
router.get("/projects/:projectId", authenticate, async (req: AuthRequest, res) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to project
router.post("/projects/:projectId/members", authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // SECURITY FIX: Only the owner can add members
    const project = await projectService.getProjectById(projectId);
    if (project.ownerId !== req.userId) {
      return res.status(403).json({ error: "Only the project owner can add members" });
    }

    await projectService.addProjectMember(projectId, String(userId), role);
    res.status(201).json({ message: "Member added successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get project members
router.get("/projects/:projectId/members", authenticate, async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.params;
    const members = await projectService.getProjectMembers(projectId);
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
