"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const shared_1 = require("@gpa/shared");
const uuid_1 = require("uuid");
const registerUser = async (name, email, password) => {
    const existing = await shared_1.pool.query(`select id from users where email=$1`, [email]);
    if (existing.rows[0]) {
        throw new Error("User already exists");
    }
    const userId = (0, uuid_1.v4)();
    const hashedPassword = await bcrypt_1.default.hash(password, 10);
    const result = await shared_1.pool.query(`insert into users (id, name, email, password) values ($1, $2, $3, $4) RETURNING id, name, email`, [userId, name, email, hashedPassword]);
    return result.rows[0];
};
exports.registerUser = registerUser;
const loginUser = async (email, password) => {
    const result = await shared_1.pool.query(`select * from users where email=$1`, [email]);
    if (!result.rowCount) {
        throw new Error("User not found");
    }
    const user = result.rows[0];
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }
    return {
        id: user.id,
        name: user.name,
        email: user.email
    };
};
exports.loginUser = loginUser;
