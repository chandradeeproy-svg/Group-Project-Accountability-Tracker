import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import * as projectService from "../services/project.service";
import { createProjectSchema, addMemberSchema } from "../schema";

export const getUserProjectsController = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await projectService.getUserProjects(req.userId!);
    res.json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProjectController = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = createProjectSchema.safeParse(req.body);
    
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message, details: parsed.error });
    }

    const project = await projectService.createProject(parsed.data.name, req.userId!);
    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectByIdController = async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectService.getProjectById(req.params.projectId);
    res.json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addProjectMemberController = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    
    const parsed = addMemberSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0].message, details: parsed.error });
    }

    await projectService.addProjectMember(projectId, parsed.data.userId, parsed.data.role);
    res.status(201).json({ message: "Member added successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectMembersController = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const members = await projectService.getProjectMembers(projectId);
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
