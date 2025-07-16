import { BaseError } from "./base.error";
import { NotFoundError } from "./not-found.error";
import { ValidationError } from "./validation.error";

export function createErrorLogger(logger: {
  warn: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
}) {
  return {
    logError(error: unknown): void {
      if (error instanceof ValidationError) {
        logger.warn("Validation error:", error.toJSON());
        return;
      }

      if (error instanceof NotFoundError) {
        logger.info("Resource not found:", error.toJSON());
        return;
      }

      if (error instanceof BaseError) {
        logger.error("Application error:", error.toJSON());
        return;
      }

      logger.error("Unexpected error:", error);
    },
  };
}
