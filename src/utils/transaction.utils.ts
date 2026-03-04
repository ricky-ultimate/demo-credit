import { v4 as uuidv4 } from "uuid";

export const generateReference = (): string => {
  const timestamp = Date.now();
  const unique = uuidv4().replace(/-/g, "").substring(0, 8).toUpperCase();
  return `DC-${timestamp}-${unique}`;
};
