import { createErrorLogger } from "../error-logger";
import { createErrorResponse } from "../error-response";

export class ErrorOperations {
  static logError(
    error: unknown,
    logger: {
      warn: (message: string, data?: unknown) => void;
      info: (message: string, data?: unknown) => void;
      error: (message: string, data?: unknown) => void;
    },
  ): void {
    createErrorLogger(logger).logError(error);
  }

  static toSafeResponse(error: unknown): {
    success: false;
    error: {
      name: string;
      message: string;
      code?: string;
      issues?: Record<string, string[]>;
    };
  } {
    return createErrorResponse(error);
  }
}
