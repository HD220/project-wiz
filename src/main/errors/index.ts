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

export class ErrorHandler {
  static isApplicationError = ErrorDetection.isApplicationError;
  static getUserMessage = ErrorDetection.getUserMessage;
  static logError = ErrorOperations.logError;
  static toSafeResponse = ErrorOperations.toSafeResponse;
}
