"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStatusScehma = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    projectId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(3),
    ownerId: zod_1.z.string().uuid().optional(),
    deadline: zod_1.z.string().optional(),
});
exports.updateStatusScehma = zod_1.z.object({
    status: zod_1.z.enum(["IN_PROGRESS", "DONE"]),
});
