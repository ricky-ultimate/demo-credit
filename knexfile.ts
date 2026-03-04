import type { Knex } from "knex";
import dotenv from "dotenv";
dotenv.config();

const baseConnection = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    minVersion: "TLSv1.2" as const,
    rejectUnauthorized: true,
  },
};

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: baseConnection,
    migrations: {
      directory: "./src/migrations",
      extension: "ts",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  test: {
    client: "mysql2",
    connection: baseConnection,
    migrations: {
      directory: "./src/migrations",
      extension: "ts",
    },
    pool: {
      min: 1,
      max: 5,
    },
  },
  production: {
    client: "mysql2",
    connection: baseConnection,
    migrations: {
      directory: "./src/migrations",
      extension: "ts",
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;
