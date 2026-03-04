import { Request, Response, NextFunction } from "express";
import { registerUser, loginUser } from "./auth.service";
import { sendSuccess } from "../../utils/response.utils";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser({ name, email, password });
    sendSuccess(res, result, "Account created successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    sendSuccess(res, result, "Login successful");
  } catch (error) {
    next(error);
  }
};
