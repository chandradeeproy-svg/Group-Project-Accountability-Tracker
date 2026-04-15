"use strict";

const { Router } = require("express");
const { pool, authenticate, asyncHandler, ValidationError } = require("@gpa/shared");

const router = Router();

router.get("/users/search", authenticate, asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    throw new ValidationError("Query parameter 'q' is required");
  }

  const result = await pool.query(
    `SELECT id, name, email FROM users
     WHERE name ILIKE $1 OR email ILIKE $1
     LIMIT 20`,
    [`%${q}%`],
  );

  res.json(result.rows);
}));

module.exports = { default: router };
