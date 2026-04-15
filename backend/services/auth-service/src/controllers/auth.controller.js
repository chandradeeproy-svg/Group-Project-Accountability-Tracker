"use strict";

const { registerUser, loginUser } = require("../services/auth.service");
const { signToken } = require("../utils/jwt");
const { registerSchema, loginSchema } = require("../schema");
const { ValidationError, UnauthorizedError } = require("@gpa/shared");

async function registerController(req, res) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message, parsed.error.flatten());
  }

  const { name, email, password } = parsed.data;
  const user = await registerUser(name, email, password);
  const token = signToken({ userId: user.id, email: user.email });

  res.status(201).json({ user, token });
}

async function loginController(req, res) {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message, parsed.error.flatten());
  }

  const { email, password } = parsed.data;
  try {
    const user = await loginUser(email, password);
    const token = signToken({ userId: user.id, email: user.email });
    res.json({ user, token });
  } catch (error) {
    throw new UnauthorizedError(error.message);
  }
}

module.exports = { registerController, loginController };
