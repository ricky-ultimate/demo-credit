import { ENV } from "../constants/env";

type LogLevel = "info" | "warn" | "error";

const logger = (level: LogLevel, ...msg: unknown[]): void => {
  if (ENV.NODE_ENV === "test") return;
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [${level.toUpperCase()}]`, ...msg);
};

export default logger;
