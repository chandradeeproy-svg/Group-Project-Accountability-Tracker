"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.authMiddleware = void 0;
const jwt_1 = require("../utils/jwt");
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = (0, jwt_1.verifyToken)(token);
        req.user = payload;
        req.userId = payload.userId;
        next();
    }
    catch {
        res.status(401).json({ message: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
// Alias for compatibility
exports.authenticate = exports.authMiddleware;
