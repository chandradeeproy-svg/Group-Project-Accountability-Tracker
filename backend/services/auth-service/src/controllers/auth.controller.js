"use strict";

const { registerUser, loginUser } = require("../services/auth.service");
const { signToken, signRefreshToken, verifyToken } = require("../utils/jwt");
const { registerSchema, loginSchema } = require("../schema");
const { ValidationError, UnauthorizedError, publish, EventTypes } = require("@gpa/shared");

async function registerController(req, res) {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    throw new ValidationError(parsed.error.issues[0].message, parsed.error.flatten());
  }

  const { name, email, password } = parsed.data;
  const user = await registerUser(name, email, password);
  const token = signToken({ userId: user.id, email: user.email });
  const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

  // Publish user.registered event
  await publish(EventTypes.USER_REGISTERED, {
    user_id: user.id,
    email: user.email,
    name: user.name,
    source: "auth-service",
  });

  res.status(201).json({ user, token, refreshToken });
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
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email });

    // Publish user.logged_in event
    await publish(EventTypes.USER_LOGGED_IN, {
      user_id: user.id,
      email: user.email,
      source: "auth-service",
    });

    res.json({ user, token, refreshToken });
  } catch (error) {
    throw new UnauthorizedError(error.message);
  }
}

/**
 * Refresh Token Controller
 *
 * Accepts a valid refresh token and returns a new access token + new refresh token.
 * This is token rotation: old refresh token should be discarded by the client.
 */
async function refreshController(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError("refreshToken is required");
  }

  try {
    const decoded = verifyToken(refreshToken);
    const newToken = signToken({ userId: decoded.userId, email: decoded.email });
    const newRefreshToken = signRefreshToken({ userId: decoded.userId, email: decoded.email });

    res.json({
      token: newToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
}

module.exports = { registerController, loginController, refreshController };
