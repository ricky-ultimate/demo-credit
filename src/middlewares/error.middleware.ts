import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.utils";
import logger from "../utils/logger.utils";

export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorMiddleware = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode);
  }

  logger("error", "Unhandled error:", err);
  return sendError(res, "Internal server error", 500);
};
