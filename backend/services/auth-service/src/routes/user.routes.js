"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shared_1 = require("@gpa/shared");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Search users by name or email
router.get("/users/search", auth_middleware_1.authenticate, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== "string") {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }
        const result = await shared_1.pool.query(`SELECT id, name, email FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1 
       LIMIT 20`, [`%${q}%`]);
        res.json(result.rows);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
