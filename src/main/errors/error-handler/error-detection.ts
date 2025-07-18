import { BaseError } from "../base.error";

export const ErrorDetection = {
  isApplicationError(error: unknown): error is BaseError {
    return error instanceof BaseError;
  },

  getUserMessage(error: unknown): string {
    if (error instanceof BaseError) {
      return error.getUserMessage();
    }

    if (error instanceof Error) {
      return "An unexpected error occurred. Please try again.";
    }

    return "An unknown error occurred.";
  },
};
