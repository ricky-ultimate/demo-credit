import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { ENV } from "./constants/env";
import logger from "./utils/logger.utils";
import db from "./config/db.config";

dotenv.config();

const app: Application = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

db.raw("SELECT 1")
  .then(() => {
    logger("info", "Database connection established");
    app.listen(ENV.PORT, () => {
      logger("info", `Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
    });
  })
  .catch((err: unknown) => {
    logger("error", "Database connection failed:", err);
    process.exit(1);
  });

export default app;
