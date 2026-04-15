"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMemberSchema = exports.createProjectSchema = void 0;
const zod_1 = require("zod");
exports.createProjectSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Project name must be at least 3 characters"),
});
exports.addMemberSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid("Invalid user ID format"),
    role: zod_1.z.enum(["OWNER", "MEMBER"]).default("MEMBER"),
});
