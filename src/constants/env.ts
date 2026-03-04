import dotenv from "dotenv";
dotenv.config();

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const ENV = {
  PORT: parseInt(getEnv("PORT", "5001"), 10),
  NODE_ENV: getEnv("NODE_ENV", "development"),

  DB_HOST: getEnv("DB_HOST"),
  DB_PORT: parseInt(getEnv("DB_PORT", "3306"), 10),
  DB_USER: getEnv("DB_USER"),
  DB_PASSWORD: getEnv("DB_PASSWORD"),
  DB_NAME: getEnv("DB_NAME"),

  JWT_SECRET: getEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "24h"),

  ADJUTOR_BASE_URL: getEnv("ADJUTOR_BASE_URL"),
  ADJUTOR_API_KEY: getEnv("ADJUTOR_API_KEY"),
};
