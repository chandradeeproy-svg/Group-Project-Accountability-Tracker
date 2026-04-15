"use strict";

const projectService = require("../services/project.service");
const { createProjectSchema, addMemberSchema } = require("../schema");
const { ValidationError } = require("@gpa/shared");

async function getUserProjectsController(req, res) {
  const projects = await projectService.getUserProjects(req.userId);
  res.json(projects);
}

async function createProjectController(req, res) {
  const parsed = createProjectSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message, parsed.error.flatten());
  }

  const project = await projectService.createProject(parsed.data.name, req.userId);
  res.status(201).json(project);
}

async function getProjectByIdController(req, res) {
  const project = await projectService.getProjectById(req.params.projectId);
  res.json(project);
}

async function addProjectMemberController(req, res) {
  const { projectId } = req.params;
  const parsed = addMemberSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message, parsed.error.flatten());
  }

  await projectService.addProjectMember(projectId, parsed.data.userId, parsed.data.role);
  res.status(201).json({ message: "Member added successfully" });
}

async function getProjectMembersController(req, res) {
  const { projectId } = req.params;
  const members = await projectService.getProjectMembers(projectId);
  res.json(members);
}

module.exports = {
  getUserProjectsController,
  createProjectController,
  getProjectByIdController,
  addProjectMemberController,
  getProjectMembersController,
};
