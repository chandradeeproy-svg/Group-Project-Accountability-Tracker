import { Router } from "express";
import { pool } from "@gpa/shared";
import { authenticate, AuthRequest } from "../middlewares/auth.middleware";

const router = Router();

// Search users by name or email
router.get("/users/search", authenticate, async (req: AuthRequest, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const result = await pool.query(
      `SELECT id, name, email FROM users 
       WHERE name ILIKE $1 OR email ILIKE $1 
       LIMIT 20`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
