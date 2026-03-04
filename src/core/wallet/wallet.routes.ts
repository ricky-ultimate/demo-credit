import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { getBalance, fund, transfer, withdraw, getTransactions } from "./wallet.controller";

const router = Router();

router.use(authenticate);

router.get("/balance", getBalance);

router.get("/transactions", getTransactions);

router.post(
  "/fund",
  validate([
    { field: "amount", type: "number", required: true },
  ]),
  fund
);

router.post(
  "/transfer",
  validate([
    { field: "receiver_email", type: "email", required: true },
    { field: "amount", type: "number", required: true },
  ]),
  transfer
);

router.post(
  "/withdraw",
  validate([
    { field: "amount", type: "number", required: true },
  ]),
  withdraw
);

export default router;
