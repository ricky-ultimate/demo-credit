import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response.utils";

type ValidationRule = {
  field: string;
  type: "string" | "email" | "number";
  required?: boolean;
  minLength?: number;
};

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const validate =
  (rules: ValidationRule[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      if (rule.required && (value === undefined || value === "")) {
        errors.push(`${rule.field} is required`);
        continue;
      }

      if (value === undefined) continue;

      if (rule.type === "string" && typeof value !== "string") {
        errors.push(`${rule.field} must be a string`);
        continue;
      }

      if (rule.type === "email" && !isValidEmail(value)) {
        errors.push(`${rule.field} must be a valid email address`);
        continue;
      }

      if (rule.type === "number" && (isNaN(value) || Number(value) <= 0)) {
        errors.push(`${rule.field} must be a positive number`);
        continue;
      }

      if (
        rule.minLength &&
        typeof value === "string" &&
        value.length < rule.minLength
      ) {
        errors.push(
          `${rule.field} must be at least ${rule.minLength} characters`
        );
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
      return;
    }

    next();
  };
