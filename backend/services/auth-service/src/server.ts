import "dotenv/config"; // MUST be first — loads .env before any pool is created

import moduleAlias from "module-alias";
import path from "path";

// Register aliases for production (dist)
if (process.env.NODE_ENV === "production" || !__filename.endsWith(".ts")) {
  moduleAlias.addAlias("@gpa/shared", path.join(__dirname, "../../../shared"));
}

import { app } from "./app";
import { env } from "./config/env";

import { pool } from "@gpa/shared";

app.listen(env.PORT, async () => {
  console.log(`Auth service running on port ${env.PORT}`);
  try {
    await pool.query("SELECT NOW()");
    console.log("DB Connected");
  } catch (e) {
    console.error("DB Connection Failed", e);
  }
});
