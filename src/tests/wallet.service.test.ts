import {
  fundWallet,
  transferFunds,
  withdrawFunds,
  getWalletByUserId,
  getTransactionHistory,
} from "../core/wallet/wallet.service";
import { AppError } from "../middlewares/error.middleware";
import db from "../config/db.config";

jest.mock("../config/db.config", () => {
  const mockTrx = {
    where: jest.fn().mockReturnThis(),
    increment: jest.fn().mockResolvedValue(1),
    decrement: jest.fn().mockResolvedValue(1),
    insert: jest.fn().mockResolvedValue([1]),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    first: jest.fn(),
    increment: jest.fn().mockResolvedValue(1),
    decrement: jest.fn().mockResolvedValue(1),
    insert: jest.fn().mockResolvedValue([1]),
  };

  const mockDb: any = jest.fn(() => mockQueryBuilder);
  mockDb.transaction = jest.fn((cb: Function) => cb(mockTrx));

  return { __esModule: true, default: mockDb };
});

jest.mock("uuid", () => ({ v4: jest.fn(() => "mock-uuid") }));
jest.mock("../utils/transaction.utils", () => ({
  generateReference: jest.fn(() => "DC-mock-reference"),
}));

const mockDb = db as jest.MockedFunction<any>;

const mockWallet = {
  id: "wallet-uuid",
  user_id: "user-uuid",
  balance: 5000,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockReceiverWallet = {
  id: "receiver-wallet-uuid",
  user_id: "receiver-user-uuid",
  balance: 1000,
  created_at: new Date(),
  updated_at: new Date(),
};

const mockReceiverUser = {
  id: "receiver-user-uuid",
  name: "Jane Doe",
  email: "jane@example.com",
};

describe("Wallet Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getWalletByUserId", () => {
    it("should return a wallet for a valid user", async () => {
      mockDb().where().first.mockResolvedValue(mockWallet);

      const wallet = await getWalletByUserId("user-uuid");

      expect(wallet).toEqual(mockWallet);
    });

    it("should throw 404 if wallet does not exist", async () => {
      mockDb().where().first.mockResolvedValue(null);

      await expect(getWalletByUserId("user-uuid")).rejects.toThrow(
        new AppError("Wallet not found.", 404)
      );
    });
  });

  describe("fundWallet", () => {
    it("should fund wallet and return updated wallet", async () => {
      const updatedWallet = { ...mockWallet, balance: 6000 };
      mockDb().where().first
        .mockResolvedValueOnce(mockWallet)
        .mockResolvedValueOnce(updatedWallet);

      const result = await fundWallet("user-uuid", 1000);

      expect(result.balance).toBe(6000);
    });

    it("should throw 404 if wallet not found during fund", async () => {
      mockDb().where().first.mockResolvedValue(null);

      await expect(fundWallet("user-uuid", 1000)).rejects.toThrow(
        new AppError("Wallet not found.", 404)
      );
    });
  });

  describe("transferFunds", () => {
    it("should transfer funds and return updated sender wallet", async () => {
      const updatedSenderWallet = { ...mockWallet, balance: 4000 };

      mockDb().where().first
        .mockResolvedValueOnce(mockWallet)
        .mockResolvedValueOnce(mockReceiverUser)
        .mockResolvedValueOnce(mockReceiverWallet)
        .mockResolvedValueOnce(updatedSenderWallet);

      const result = await transferFunds("user-uuid", "jane@example.com", 1000);

      expect(result.balance).toBe(4000);
    });

    it("should throw 400 if sender has insufficient balance", async () => {
      mockDb().where().first.mockResolvedValue({ ...mockWallet, balance: 100 });

      await expect(
        transferFunds("user-uuid", "jane@example.com", 1000)
      ).rejects.toThrow(new AppError("Insufficient balance.", 400));
    });

    it("should throw 404 if receiver does not exist", async () => {
      mockDb().where().first
        .mockResolvedValueOnce(mockWallet)
        .mockResolvedValueOnce(null);

      await expect(
        transferFunds("user-uuid", "nobody@example.com", 500)
      ).rejects.toThrow(new AppError("Recipient account not found.", 404));
    });

    it("should throw 400 if sender tries to transfer to themselves", async () => {
      mockDb().where().first
        .mockResolvedValueOnce(mockWallet)
        .mockResolvedValueOnce({ ...mockReceiverUser, id: "user-uuid" });

      await expect(
        transferFunds("user-uuid", "jane@example.com", 500)
      ).rejects.toThrow(
        new AppError("You cannot transfer funds to yourself.", 400)
      );
    });

    it("should throw 404 if receiver wallet does not exist", async () => {
      mockDb().where().first
        .mockResolvedValueOnce(mockWallet)
        .mockResolvedValueOnce(mockReceiverUser)
        .mockResolvedValueOnce(null);

      await expect(
        transferFunds("user-uuid", "jane@example.com", 500)
      ).rejects.toThrow(new AppError("Recipient wallet not found.", 404));
    });
  });

  describe("withdrawFunds", () => {
    it("should withdraw funds and return updated wallet", async () => {
      const updatedWallet = { ...mockWallet, balance: 4500 };
      mockDb().where().first
        .mockResolvedValueOnce(mockWallet)
        .mockResolvedValueOnce(updatedWallet);

      const result = await withdrawFunds("user-uuid", 500);

      expect(result.balance).toBe(4500);
    });

    it("should throw 400 if balance is insufficient", async () => {
      mockDb().where().first.mockResolvedValue({ ...mockWallet, balance: 100 });

      await expect(withdrawFunds("user-uuid", 500)).rejects.toThrow(
        new AppError("Insufficient balance.", 400)
      );
    });

    it("should throw 404 if wallet not found during withdrawal", async () => {
      mockDb().where().first.mockResolvedValue(null);

      await expect(withdrawFunds("user-uuid", 500)).rejects.toThrow(
        new AppError("Wallet not found.", 404)
      );
    });
  });

  describe("getTransactionHistory", () => {
    it("should return transactions for a valid wallet", async () => {
      const mockTransactions = [
        {
          id: "txn-uuid",
          reference: "DC-mock-reference",
          sender_wallet_id: null,
          receiver_wallet_id: "wallet-uuid",
          amount: 1000,
          type: "deposit",
          status: "success",
          created_at: new Date(),
        },
      ];

      mockDb().where().first.mockResolvedValue(mockWallet);
      mockDb().where().orWhere().orderBy.mockResolvedValue(mockTransactions);

      const result = await getTransactionHistory("user-uuid");

      expect(result).toEqual(mockTransactions);
      expect(result.length).toBe(1);
    });

    it("should throw 404 if wallet not found when fetching history", async () => {
      mockDb().where().first.mockResolvedValue(null);

      await expect(getTransactionHistory("user-uuid")).rejects.toThrow(
        new AppError("Wallet not found.", 404)
      );
    });
  });
});
