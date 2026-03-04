import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.test.ts"],
  coverageDirectory: "coverage",
  verbose: true,
  forceExit: true,
  clearMocks: true,
};

export default config;
