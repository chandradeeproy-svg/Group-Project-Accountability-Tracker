import "dotenv/config";
import moduleAlias from "module-alias";
import path from "path";

// Register aliases
moduleAlias.addAlias("@gpa/shared", path.join(__dirname, "../../../shared"));

import { app } from "./app";
import { pool } from "@gpa/shared";

const PORT = process.env.PORT || process.env.TASK_PORT || 4003;

app.listen(PORT, async () => {
  console.log("Task Service is running on port:", PORT);
  try {
    await pool.query("SELECT NOW()");
    console.log("DB Connected");
  } catch (e) {
    console.error("DB Connection Failed", e);
  }
});
