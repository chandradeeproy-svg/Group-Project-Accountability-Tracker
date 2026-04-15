"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const module_alias_1 = __importDefault(require("module-alias"));
const path_1 = __importDefault(require("path"));
// Register aliases
module_alias_1.default.addAlias("@gpa/shared", path_1.default.join(__dirname, "../../../shared"));
const app_1 = require("./app");
const shared_1 = require("@gpa/shared");
const PORT = process.env.PORT || process.env.PROJECT_PORT || 4002;
app_1.app.listen(PORT, async () => {
    console.log("Project Service is running on port:", PORT);
    try {
        await shared_1.pool.query("SELECT NOW()");
        console.log("DB Connected");
    }
    catch (e) {
        console.error("DB Connection Failed", e);
    }
});
