"use strict";

const jwt = require("jsonwebtoken");
const { loadServiceConfig } = require("@gpa/shared");

function getAuthConfig() {
  return loadServiceConfig("auth-service", { defaultPort: 4001 });
}

/**
 * Sign an access token (short-lived)
 */
function signToken(payload) {
  const config = getAuthConfig();
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

/**
 * Sign a refresh token (long-lived, 7 days)
 */
function signRefreshToken(payload) {
  const config = getAuthConfig();
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: "7d",
  });
}

/**
 * Verify any token (access or refresh)
 */
function verifyToken(token) {
  const config = getAuthConfig();
  return jwt.verify(token, config.JWT_SECRET);
}

module.exports = { signToken, signRefreshToken, verifyToken };
