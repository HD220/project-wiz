// Central export for all error classes
export { BaseError, type ErrorMetadata, type ErrorContext } from "./base.error";
export { ApplicationError } from "./application.error";
export { DomainError } from "./domain.error";
export { NotFoundError } from "./not-found.error";
export { ValidationError, type ValidationIssue } from "./validation.error";

// Import the error classes for internal use
import { BaseError } from "./base.error";
import { NotFoundError } from "./not-found.error";
import { ValidationError } from "./validation.error";

// Error handling utilities
export class ErrorHandler {
  /**
   * Determines if an error is a known application error
   */
  static isApplicationError(error: unknown): error is BaseError {
    return error instanceof BaseError;
  }

  /**
   * Extracts user-safe message from any error
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof BaseError) {
      return error.getUserMessage();
    }

    if (error instanceof Error) {
      return "An unexpected error occurred. Please try again.";
    }

    return "An unknown error occurred.";
  }

  /**
   * Logs error with appropriate level based on error type
   */
  static logError(
    error: unknown,
    logger: {
      warn: (message: string, data?: unknown) => void;
      info: (message: string, data?: unknown) => void;
      error: (message: string, data?: unknown) => void;
    },
  ): void {
    if (error instanceof ValidationError) {
      logger.warn("Validation error:", (error as ValidationError).toJSON());
    } else if (error instanceof NotFoundError) {
      logger.info("Resource not found:", (error as NotFoundError).toJSON());
    } else if (error instanceof BaseError) {
      logger.error("Application error:", (error as BaseError).toJSON());
    } else {
      logger.error("Unexpected error:", error);
    }
  }

  /**
   * Creates a safe error response for APIs/IPC
   */
  static toSafeResponse(error: unknown): {
    success: false;
    error: {
      name: string;
      message: string;
      code?: string;
      issues?: Record<string, string[]>;
    };
  } {
    if (error instanceof ValidationError) {
      const validationError = error as ValidationError;
      return {
        success: false,
        error: {
          name: validationError.name,
          message: validationError.getUserMessage(),
          code: validationError.metadata.code,
          issues: validationError.getFormattedIssues(),
        },
      };
    }

    if (error instanceof BaseError) {
      const baseError = error as BaseError;
      return {
        success: false,
        error: {
          name: baseError.name,
          message: baseError.getUserMessage(),
          code: baseError.metadata.code,
        },
      };
    }

    return {
      success: false,
      error: {
        name: "UnknownError",
        message: "An unexpected error occurred.",
      },
    };
  }
}
