import { logger as baseLogger } from "../logger";

export function getLogger(context: string) {
  return baseLogger.child({ context });
}