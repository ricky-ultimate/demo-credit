import { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: unknown,
  message = "Success",
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

export const sendError = (
  res: Response,
  message = "An error occurred",
  statusCode = 500,
  errors?: unknown
): Response => {
  return res.status(statusCode).json({
    status: "error",
    message,
    ...(errors && { errors }),
  });
};
