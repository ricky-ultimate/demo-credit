import { v4 as uuidv4 } from "uuid";
import db from "../../config/db.config";
import { AppError } from "../../middlewares/error.middleware";
import { Wallet } from "../../models/wallet.model";
import { Transaction, CreateTransactionPayload } from "../../models/transaction.model";
import { generateReference } from "../../utils/transaction.utils";

export const getWalletByUserId = async (userId: string): Promise<Wallet> => {
  const wallet = await db<Wallet>("wallets").where({ user_id: userId }).first();
  if (!wallet) {
    throw new AppError("Wallet not found.", 404);
  }
  return wallet;
};

export const fundWallet = async (
  userId: string,
  amount: number
): Promise<Wallet> => {
  const wallet = await getWalletByUserId(userId);

  await db.transaction(async (trx) => {
    await trx<Wallet>("wallets")
      .where({ id: wallet.id })
      .increment("balance", amount);

    const transactionPayload: CreateTransactionPayload = {
      id: uuidv4(),
      reference: generateReference(),
      sender_wallet_id: null,
      receiver_wallet_id: wallet.id,
      amount,
      type: "deposit",
      status: "success",
    };

    await trx<Transaction>("transactions").insert(transactionPayload);
  });

  const updatedWallet = await db<Wallet>("wallets")
    .where({ id: wallet.id })
    .first();

  return updatedWallet!;
};

export const transferFunds = async (
  senderUserId: string,
  receiverEmail: string,
  amount: number
): Promise<Wallet> => {
  const senderWallet = await getWalletByUserId(senderUserId);

  if (Number(senderWallet.balance) < amount) {
    throw new AppError("Insufficient balance.", 400);
  }

  const receiverUser = await db("users").where({ email: receiverEmail }).first();
  if (!receiverUser) {
    throw new AppError("Recipient account not found.", 404);
  }

  if (receiverUser.id === senderUserId) {
    throw new AppError("You cannot transfer funds to yourself.", 400);
  }

  const receiverWallet = await db<Wallet>("wallets")
    .where({ user_id: receiverUser.id })
    .first();

  if (!receiverWallet) {
    throw new AppError("Recipient wallet not found.", 404);
  }

  const reference = generateReference();

  await db.transaction(async (trx) => {
    await trx<Wallet>("wallets")
      .where({ id: senderWallet.id })
      .decrement("balance", amount);

    await trx<Wallet>("wallets")
      .where({ id: receiverWallet.id })
      .increment("balance", amount);

    const transactionPayload: CreateTransactionPayload = {
      id: uuidv4(),
      reference,
      sender_wallet_id: senderWallet.id,
      receiver_wallet_id: receiverWallet.id,
      amount,
      type: "transfer",
      status: "success",
    };

    await trx<Transaction>("transactions").insert(transactionPayload);
  });

  const updatedWallet = await db<Wallet>("wallets")
    .where({ id: senderWallet.id })
    .first();

  return updatedWallet!;
};

export const withdrawFunds = async (
  userId: string,
  amount: number
): Promise<Wallet> => {
  const wallet = await getWalletByUserId(userId);

  if (Number(wallet.balance) < amount) {
    throw new AppError("Insufficient balance.", 400);
  }

  await db.transaction(async (trx) => {
    await trx<Wallet>("wallets")
      .where({ id: wallet.id })
      .decrement("balance", amount);

    const transactionPayload: CreateTransactionPayload = {
      id: uuidv4(),
      reference: generateReference(),
      sender_wallet_id: wallet.id,
      receiver_wallet_id: null,
      amount,
      type: "withdrawal",
      status: "success",
    };

    await trx<Transaction>("transactions").insert(transactionPayload);
  });

  const updatedWallet = await db<Wallet>("wallets")
    .where({ id: wallet.id })
    .first();

  return updatedWallet!;
};

export const getTransactionHistory = async (
  userId: string
): Promise<Transaction[]> => {
  const wallet = await getWalletByUserId(userId);

  const transactions = await db<Transaction>("transactions")
    .where({ sender_wallet_id: wallet.id })
    .orWhere({ receiver_wallet_id: wallet.id })
    .orderBy("created_at", "desc");

  return transactions;
};
