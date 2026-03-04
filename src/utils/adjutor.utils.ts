import axios from "axios";
import { ENV } from "../constants/env";
import logger from "./logger.utils";

export const isBlacklisted = async (identity: string): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${ENV.ADJUTOR_BASE_URL}/v2/verification/karma/${identity}`,
      {
        headers: {
          Authorization: `Bearer ${ENV.ADJUTOR_API_KEY}`,
        },
      }
    );

    const isMockResponse = "mock-response" in response.data;
    if (isMockResponse) {
      logger("warn", "Adjutor is in test mode. Karma check bypassed for:", identity);
      return false;
    }

    return (
      response.data?.status === "success" &&
      response.data?.data?.karma_identity !== undefined
    );
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return false;
    }
    logger("error", "Adjutor karma check failed:", error);
    throw new Error("Unable to verify user identity. Please try again later.");
  }
};
