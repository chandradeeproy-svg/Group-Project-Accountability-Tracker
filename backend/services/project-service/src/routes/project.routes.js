"use strict";

const { Router } = require("express");
const { authenticate, asyncHandler } = require("@gpa/shared");
const projectController = require("../controllers/project.controller");

const router = Router();

router.get("/projects", authenticate, asyncHandler(projectController.getUserProjectsController));
router.post("/projects", authenticate, asyncHandler(projectController.createProjectController));
router.get("/projects/:projectId", authenticate, asyncHandler(projectController.getProjectByIdController));
router.post("/projects/:projectId/members", authenticate, asyncHandler(projectController.addProjectMemberController));
router.get("/projects/:projectId/members", authenticate, asyncHandler(projectController.getProjectMembersController));

module.exports = { default: router };
