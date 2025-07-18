// Central export for all error classes
export { BaseError } from "./base.error";
export { type ErrorMetadata } from "./error-metadata.interface";
export { type ErrorContext } from "./error-context.type";
export { ApplicationError } from "./application.error";
export { DomainError } from "./domain.error";
export { NotFoundError } from "./not-found.error";
export { ValidationError, type ValidationIssue } from "./validation.error";

import { ErrorDetection } from "./error-handler/error-detection";
import { ErrorOperations } from "./error-handler/error-operations";

export const ErrorHandler = {
  isApplicationError: ErrorDetection.isApplicationError,
  getUserMessage: ErrorDetection.getUserMessage,
  logError: ErrorOperations.logError,
  toSafeResponse: ErrorOperations.toSafeResponse,
};
