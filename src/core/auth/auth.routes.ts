import { Router } from "express";
import { register, login } from "./auth.controller";
import { validate } from "../../middlewares/validate.middleware";

const router = Router();

router.post(
  "/register",
  validate([
    { field: "name", type: "string", required: true, minLength: 2 },
    { field: "email", type: "email", required: true },
    { field: "password", type: "string", required: true, minLength: 8 },
  ]),
  register
);

router.post(
  "/login",
  validate([
    { field: "email", type: "email", required: true },
    { field: "password", type: "string", required: true },
  ]),
  login
);

export default router;
