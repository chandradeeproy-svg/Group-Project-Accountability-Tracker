"use strict";

const bcrypt = require("bcrypt");
const { pool, ConflictError, NotFoundError } = require("@gpa/shared");
const { v4: uuidv4 } = require("uuid");

async function registerUser(name, email, password) {
  const existing = await pool.query(
    "select id from users where email=$1",
    [email],
  );

  if (existing.rows[0]) {
    throw new ConflictError("User already exists");
  }

  const userId = uuidv4();
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "insert into users (id, name, email, password) values ($1, $2, $3, $4) RETURNING id, name, email",
    [userId, name, email, hashedPassword],
  );

  return result.rows[0];
}

async function loginUser(email, password) {
  const result = await pool.query("select * from users where email=$1", [email]);

  if (!result.rowCount) {
    throw new NotFoundError("User not found");
  }

  const user = result.rows[0];
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

module.exports = { registerUser, loginUser };
