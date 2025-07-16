import { BaseError } from "./base.error";
import { ValidationError } from "./validation.error";

export function createErrorResponse(error: unknown): {
  success: false;
  error: {
    name: string;
    message: string;
    code?: string;
    issues?: Record<string, string[]>;
  };
} {
  if (error instanceof ValidationError) {
    return {
      success: false,
      error: {
        name: error.name,
        message: error.getUserMessage(),
        code: error.metadata.code,
        issues: error.getFormattedIssues(),
      },
    };
  }

  if (error instanceof BaseError) {
    return {
      success: false,
      error: {
        name: error.name,
        message: error.getUserMessage(),
        code: error.metadata.code,
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
