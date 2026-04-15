"use strict";

const jwt = require("jsonwebtoken");
const { loadServiceConfig } = require("@gpa/shared");

function getAuthConfig() {
  return loadServiceConfig("auth-service", { defaultPort: 4001 });
}

function signToken(payload) {
  const config = getAuthConfig();
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
}

function verifyToken(token) {
  const config = getAuthConfig();
  return jwt.verify(token, config.JWT_SECRET);
}

module.exports = { signToken, verifyToken };
