"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const shared_1 = require("./shared");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function initDb() {
    try {
        console.log("Reading schema.sql...");
        const schemaPath = path_1.default.join(__dirname, "schema.sql");
        const schema = fs_1.default.readFileSync(schemaPath, "utf8");
        console.log("Executing schema...");
        await shared_1.pool.query(schema);
        console.log("Database initialized successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("Failed to initialize database:", error);
        process.exit(1);
    }
}
initDb();
