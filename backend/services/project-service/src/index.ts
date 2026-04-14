import moduleAlias from "module-alias";
import path from "path";

// Register aliases
moduleAlias.addAlias("@gpa/shared", path.join(__dirname, "../../../shared"));

import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes";
import { pool } from "@gpa/shared";

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

const PORT = process.env.PORT || process.env.PROJECT_PORT || 4002;

app.listen(PORT, async () => {
  console.log("Project Service is running on port:", PORT);
  try {
    await pool.query("SELECT NOW()");
    console.log("DB Connected");
  } catch (e) {
    console.error("DB Connection Failed", e);
  }
});
