import { registerUser, loginUser } from "../core/auth/auth.service";
import { AppError } from "../middlewares/error.middleware";
import db from "../config/db.config";
import * as adjutorUtils from "../utils/adjutor.utils";
import * as jwtUtils from "../utils/jwt.utils";
import bcrypt from "bcryptjs";

jest.mock("../config/db.config", () => {
  const qb = {
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockResolvedValue([1]),
  };

  const trx: any = jest.fn(() => qb);
  trx.where = qb.where;
  trx.first = qb.first;
  trx.insert = qb.insert;

  const mockDb: any = jest.fn(() => qb);
  mockDb.transaction = jest.fn((cb: Function) => cb(trx));
  mockDb._qb = qb;

  return { __esModule: true, default: mockDb };
});

jest.mock("../utils/adjutor.utils");
jest.mock("../utils/jwt.utils");
jest.mock("bcryptjs");
jest.mock("uuid", () => ({ v4: jest.fn(() => "mock-uuid") }));

const mockDb = db as any;
const mockIsBlacklisted = adjutorUtils.isBlacklisted as jest.MockedFunction<typeof adjutorUtils.isBlacklisted>;
const mockSignToken = jwtUtils.signToken as jest.MockedFunction<typeof jwtUtils.signToken>;
const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;

const mockUser = {
  id: "mock-uuid",
  name: "John Doe",
  email: "john@example.com",
  password_hash: "hashed_password",
  is_blacklisted: false,
  created_at: new Date(),
  updated_at: new Date(),
};

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb._qb.where.mockReturnThis();
    mockSignToken.mockReturnValue("mock-token");
  });

  describe("registerUser", () => {
    describe("positive scenarios", () => {
      it("should register a new user and return a token", async () => {
        mockIsBlacklisted.mockResolvedValue(false);
        mockDb._qb.first
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockUser);
        (mockBcryptHash as jest.Mock).mockResolvedValue("hashed_password");

        const result = await registerUser({
          name: "John Doe",
          email: "john@example.com",
          password: "securepassword",
        });

        expect(mockIsBlacklisted).toHaveBeenCalledWith("john@example.com");
        expect(result.token).toBe("mock-token");
        expect(result.user.email).toBe("john@example.com");
        expect(result.user).not.toHaveProperty("password_hash");
      });

      it("should hash the password before storing", async () => {
        mockIsBlacklisted.mockResolvedValue(false);
        mockDb._qb.first
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce(mockUser);
        (mockBcryptHash as jest.Mock).mockResolvedValue("hashed_password");

        await registerUser({
          name: "John Doe",
          email: "john@example.com",
          password: "securepassword",
        });

        expect(mockBcryptHash).toHaveBeenCalledWith("securepassword", 12);
      });
    });

    describe("negative scenarios", () => {
      it("should throw 403 if user is blacklisted", async () => {
        mockIsBlacklisted.mockResolvedValue(true);

        await expect(
          registerUser({
            name: "Bad Actor",
            email: "bad@example.com",
            password: "securepassword",
          })
        ).rejects.toThrow(
          new AppError(
            "This account cannot be created due to a policy restriction.",
            403
          )
        );
      });

      it("should throw 409 if email already exists", async () => {
        mockIsBlacklisted.mockResolvedValue(false);
        mockDb._qb.first.mockResolvedValueOnce(mockUser);

        await expect(
          registerUser({
            name: "John Doe",
            email: "john@example.com",
            password: "securepassword",
          })
        ).rejects.toThrow(
          new AppError("An account with this email already exists.", 409)
        );
      });

      it("should throw if Adjutor API fails", async () => {
        mockIsBlacklisted.mockRejectedValue(
          new Error(
            "Unable to verify user identity. Please try again later."
          )
        );

        await expect(
          registerUser({
            name: "John Doe",
            email: "john@example.com",
            password: "securepassword",
          })
        ).rejects.toThrow(
          "Unable to verify user identity. Please try again later."
        );
      });
    });
  });

  describe("loginUser", () => {
    describe("positive scenarios", () => {
      it("should return a token on valid credentials", async () => {
        mockDb._qb.first.mockResolvedValue(mockUser);
        (mockBcryptCompare as jest.Mock).mockResolvedValue(true);

        const result = await loginUser("john@example.com", "securepassword");

        expect(result.token).toBe("mock-token");
        expect(result.user.email).toBe("john@example.com");
        expect(result.user).not.toHaveProperty("password_hash");
      });
    });

    describe("negative scenarios", () => {
      it("should throw 401 if user does not exist", async () => {
        mockDb._qb.first.mockResolvedValue(null);

        await expect(
          loginUser("nobody@example.com", "securepassword")
        ).rejects.toThrow(new AppError("Invalid email or password.", 401));
      });

      it("should throw 401 if password does not match", async () => {
        mockDb._qb.first.mockResolvedValue(mockUser);
        (mockBcryptCompare as jest.Mock).mockResolvedValue(false);

        await expect(
          loginUser("john@example.com", "wrongpassword")
        ).rejects.toThrow(new AppError("Invalid email or password.", 401));
      });
    });
  });
});
