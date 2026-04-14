import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import * as projectController from "../controllers/project.controller";

const router = Router();

router.get("/projects", authenticate, projectController.getUserProjectsController as any);
router.post("/projects", authenticate, projectController.createProjectController as any);
router.get("/projects/:projectId", authenticate, projectController.getProjectByIdController as any);
router.post("/projects/:projectId/members", authenticate, projectController.addProjectMemberController as any);
router.get("/projects/:projectId/members", authenticate, projectController.getProjectMembersController as any);

export default router;
