import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { sendSuccess } from "../../utils/response.utils";
import {
  fundWallet,
  transferFunds,
  withdrawFunds,
  getWalletByUserId,
  getTransactionHistory,
} from "./wallet.service";

export const getBalance = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const wallet = await getWalletByUserId(req.user!.userId);
    sendSuccess(res, { balance: wallet.balance }, "Wallet balance retrieved");
  } catch (error) {
    next(error);
  }
};

export const fund = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount } = req.body;
    const wallet = await fundWallet(req.user!.userId, Number(amount));
    sendSuccess(res, { balance: wallet.balance }, "Wallet funded successfully");
  } catch (error) {
    next(error);
  }
};

export const transfer = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { receiver_email, amount } = req.body;
    const wallet = await transferFunds(
      req.user!.userId,
      receiver_email,
      Number(amount)
    );
    sendSuccess(res, { balance: wallet.balance }, "Transfer successful");
  } catch (error) {
    next(error);
  }
};

export const withdraw = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount } = req.body;
    const wallet = await withdrawFunds(req.user!.userId, Number(amount));
    sendSuccess(res, { balance: wallet.balance }, "Withdrawal successful");
  } catch (error) {
    next(error);
  }
};

export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const transactions = await getTransactionHistory(req.user!.userId);
    sendSuccess(res, { transactions }, "Transaction history retrieved");
  } catch (error) {
    next(error);
  }
};
