import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(projectRoutes);
