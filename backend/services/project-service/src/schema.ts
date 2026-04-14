import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
});

export const addMemberSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  role: z.enum(["OWNER", "MEMBER"]).default("MEMBER"),
});
