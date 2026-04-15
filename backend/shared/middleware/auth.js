"use strict";

const jwt = require("jsonwebtoken");
const { UnauthorizedError } = require("../errors");

function authenticate(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError("No token provided"));
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(new UnauthorizedError("Invalid authorization header"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.userId = decoded.userId;
    return next();
  } catch (error) {
    return next(new UnauthorizedError("Invalid token"));
  }
}

module.exports = { authenticate, authMiddleware: authenticate };
