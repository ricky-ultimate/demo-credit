import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "../../config/db.config";
import { signToken } from "../../utils/jwt.utils";
import { isBlacklisted } from "../../utils/adjutor.utils";
import { AppError } from "../../middlewares/error.middleware";
import { User, CreateUserPayload } from "../../models/user.model";
import { CreateWalletPayload } from "../../models/wallet.model";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResult {
  token: string;
  user: Omit<User, "password_hash">;
}

export const registerUser = async (
  payload: RegisterPayload
): Promise<AuthResult> => {
  const { name, email, password } = payload;

  const blacklisted = await isBlacklisted(email);
  if (blacklisted) {
    throw new AppError(
      "This account cannot be created due to a policy restriction.",
      403
    );
  }

  const existing = await db<User>("users").where({ email }).first();
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const password_hash = await bcrypt.hash(password, 12);
  const userId = uuidv4();
  const walletId = uuidv4();

  await db.transaction(async (trx) => {
    const userPayload: CreateUserPayload = {
      id: userId,
      name,
      email,
      password_hash,
    };

    await trx<User>("users").insert(userPayload);

    const walletPayload: CreateWalletPayload = {
      id: walletId,
      user_id: userId,
    };

    await trx("wallets").insert(walletPayload);
  });

  const user = await db<User>("users").where({ id: userId }).first();

  if (!user) {
    throw new AppError("User creation failed.", 500);
  }

  const token = signToken({ userId: user.id, email: user.email });

  const { password_hash: _, ...safeUser } = user;

  return { token, user: safeUser };
};

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const user = await db<User>("users").where({ email }).first();

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (user.is_blacklisted) {
    throw new AppError("This account has been suspended.", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = signToken({ userId: user.id, email: user.email });

  const { password_hash: _, ...safeUser } = user;

  return { token, user: safeUser };
};
