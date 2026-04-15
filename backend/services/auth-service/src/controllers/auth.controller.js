"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = exports.registerController = void 0;
const auth_service_1 = require("../services/auth.service");
const jwt_1 = require("../utils/jwt");
const schema_1 = require("../schema");
const registerController = async (req, res) => {
    try {
        const parsed = schema_1.registerSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: parsed.error.issues[0].message, error: parsed.error });
        }
        const { name, email, password } = parsed.data;
        const user = await (0, auth_service_1.registerUser)(name, email, password);
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email });
        res.status(201).json({ user, token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.registerController = registerController;
const loginController = async (req, res) => {
    try {
        const parsed = schema_1.loginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ message: parsed.error.issues[0].message, error: parsed.error });
        }
        const { email, password } = parsed.data;
        const user = await (0, auth_service_1.loginUser)(email, password);
        const token = (0, jwt_1.signToken)({ userId: user.id, email: user.email });
        res.json({ user, token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.loginController = loginController;
