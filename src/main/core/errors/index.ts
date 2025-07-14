/**
 * Core errors module
 * Centralizes all error-related exports for the application
 */

// Base error class
export { DomainError } from "./domain-error";

// Specific error classes
export {
  ValidationError,
  ValidationErrorCode,
  ValidationFieldInfo,
} from "./validation-error";

export {
  NotFoundError,
  NotFoundErrorCode,
  NotFoundResourceInfo,
} from "./not-found-error";

export {
  ConflictError,
  ConflictErrorCode,
  ConflictInfo,
} from "./conflict-error";

export {
  UnauthorizedError,
  UnauthorizedErrorCode,
  AuthorizationInfo,
} from "./unauthorized-error";

export {
  InternalError,
  InternalErrorCode,
  InternalErrorInfo,
} from "./internal-error";

// Error codes and utilities
export {
  ErrorCodes,
  ErrorCode,
  ErrorMessages,
  ErrorCategories,
  ErrorCodeCategories,
  ErrorCodeUtils,
} from "./error-codes";

// Error handler
export {
  ErrorHandler,
  ErrorResponse,
  ErrorLogInfo,
  IErrorLogger,
} from "./error-handler";

// Import types for use in factory functions
import { DomainError } from "./domain-error";
import {
  ValidationError,
  ValidationErrorCode,
  ValidationFieldInfo,
} from "./validation-error";
import {
  NotFoundError,
  NotFoundErrorCode,
  NotFoundResourceInfo,
} from "./not-found-error";
import {
  ConflictError,
  ConflictErrorCode,
  ConflictInfo,
} from "./conflict-error";
import {
  UnauthorizedError,
  UnauthorizedErrorCode,
  AuthorizationInfo,
} from "./unauthorized-error";
import {
  InternalError,
  InternalErrorCode,
  InternalErrorInfo,
} from "./internal-error";

// Re-export commonly used error creation methods for convenience
export const ErrorFactory = {
  // Validation errors
  requiredField: ValidationError.requiredField.bind(ValidationError),
  invalidFormat: ValidationError.invalidFormat.bind(ValidationError),
  invalidLength: ValidationError.invalidLength.bind(ValidationError),
  multipleFields: ValidationError.multipleFields.bind(ValidationError),

  // Not found errors
  resourceNotFound: NotFoundError.resource.bind(NotFoundError),
  entityNotFound: NotFoundError.entity.bind(NotFoundError),
  fileNotFound: NotFoundError.file.bind(NotFoundError),
  userNotFound: NotFoundError.user.bind(NotFoundError),
  projectNotFound: NotFoundError.project.bind(NotFoundError),
  agentNotFound: NotFoundError.agent.bind(NotFoundError),
  channelNotFound: NotFoundError.channel.bind(NotFoundError),

  // Conflict errors
  duplicate: ConflictError.duplicate.bind(ConflictError),
  concurrentModification: ConflictError.concurrentModification.bind(ConflictError),
  stateConflict: ConflictError.stateConflict.bind(ConflictError),
  businessRule: ConflictError.businessRule.bind(ConflictError),
  versionConflict: ConflictError.versionConflict.bind(ConflictError),
  uniqueConstraint: ConflictError.uniqueConstraint.bind(ConflictError),

  // Unauthorized errors
  authenticationRequired: UnauthorizedError.authenticationRequired.bind(UnauthorizedError),
  invalidCredentials: UnauthorizedError.invalidCredentials.bind(UnauthorizedError),
  tokenExpired: UnauthorizedError.tokenExpired.bind(UnauthorizedError),
  tokenInvalid: UnauthorizedError.tokenInvalid.bind(UnauthorizedError),
  insufficientPermissions: UnauthorizedError.insufficientPermissions.bind(UnauthorizedError),
  resourceAccessDenied: UnauthorizedError.resourceAccessDenied.bind(UnauthorizedError),
  roleRequired: UnauthorizedError.roleRequired.bind(UnauthorizedError),
  accountDisabled: UnauthorizedError.accountDisabled.bind(UnauthorizedError),

  // Internal errors
  systemError: InternalError.system.bind(InternalError),
  databaseError: InternalError.database.bind(InternalError),
  networkError: InternalError.network.bind(InternalError),
  fileSystemError: InternalError.fileSystem.bind(InternalError),
  configurationError: InternalError.configuration.bind(InternalError),
  timeoutError: InternalError.timeout.bind(InternalError),
  externalServiceError: InternalError.externalService.bind(InternalError),
  dependencyError: InternalError.dependency.bind(InternalError),
} as const;

// Type guards for error checking
export const ErrorTypeGuards = {
  /**
   * Checks if an error is a domain error
   * @param error - Error to check
   * @returns Whether the error is a domain error
   */
  isDomainError: (error: unknown): error is DomainError => {
    return error instanceof DomainError;
  },

  /**
   * Checks if an error is a validation error
   * @param error - Error to check
   * @returns Whether the error is a validation error
   */
  isValidationError: (error: unknown): error is ValidationError => {
    return error instanceof ValidationError;
  },

  /**
   * Checks if an error is a not found error
   * @param error - Error to check
   * @returns Whether the error is a not found error
   */
  isNotFoundError: (error: unknown): error is NotFoundError => {
    return error instanceof NotFoundError;
  },

  /**
   * Checks if an error is a conflict error
   * @param error - Error to check
   * @returns Whether the error is a conflict error
   */
  isConflictError: (error: unknown): error is ConflictError => {
    return error instanceof ConflictError;
  },

  /**
   * Checks if an error is an unauthorized error
   * @param error - Error to check
   * @returns Whether the error is an unauthorized error
   */
  isUnauthorizedError: (error: unknown): error is UnauthorizedError => {
    return error instanceof UnauthorizedError;
  },

  /**
   * Checks if an error is an internal error
   * @param error - Error to check
   * @returns Whether the error is an internal error
   */
  isInternalError: (error: unknown): error is InternalError => {
    return error instanceof InternalError;
  },

  /**
   * Checks if an error is retryable
   * @param error - Error to check
   * @returns Whether the error is retryable
   */
  isRetryable: (error: unknown): boolean => {
    if (error instanceof DomainError) {
      return error.isRetryable();
    }
    return false;
  },
} as const;

// Common error patterns for frequently used errors
export const CommonErrors = {
  /**
   * User not found error
   * @param userId - User ID
   * @returns NotFoundError
   */
  USER_NOT_FOUND: (userId: string | number) => NotFoundError.user(userId),

  /**
   * Project not found error
   * @param projectId - Project ID
   * @returns NotFoundError
   */
  PROJECT_NOT_FOUND: (projectId: string | number) =>
    NotFoundError.project(projectId),

  /**
   * Agent not found error
   * @param agentId - Agent ID
   * @returns NotFoundError
   */
  AGENT_NOT_FOUND: (agentId: string | number) => NotFoundError.agent(agentId),

  /**
   * Channel not found error
   * @param channelId - Channel ID
   * @returns NotFoundError
   */
  CHANNEL_NOT_FOUND: (channelId: string | number) =>
    NotFoundError.channel(channelId),

  /**
   * Invalid ID format error
   * @param field - Field name
   * @param value - Invalid value
   * @returns ValidationError
   */
  INVALID_ID_FORMAT: (field: string, value: unknown) =>
    ValidationError.invalidFormat(field, value, "valid UUID or number"),

  /**
   * Required field error
   * @param field - Field name
   * @returns ValidationError
   */
  REQUIRED_FIELD: (field: string) => ValidationError.requiredField(field),

  /**
   * Duplicate resource error
   * @param resource - Resource type
   * @param field - Field name
   * @param value - Duplicate value
   * @returns ConflictError
   */
  DUPLICATE_RESOURCE: (resource: string, field: string, value: unknown) =>
    ConflictError.duplicate(resource, field, value),

  /**
   * Authentication required error
   * @returns UnauthorizedError
   */
  AUTHENTICATION_REQUIRED: () => UnauthorizedError.authenticationRequired(),

  /**
   * Insufficient permissions error
   * @param userId - User ID
   * @param permission - Required permission
   * @returns UnauthorizedError
   */
  INSUFFICIENT_PERMISSIONS: (userId: string | number, permission: string) =>
    UnauthorizedError.insufficientPermissions(userId, permission),

  /**
   * Database connection error
   * @param component - Component name
   * @param originalError - Original error
   * @returns InternalError
   */
  DATABASE_CONNECTION: (component: string, originalError?: Error) =>
    InternalError.database(component, "connection", originalError),

  /**
   * Network timeout error
   * @param component - Component name
   * @param timeoutMs - Timeout duration
   * @returns InternalError
   */
  NETWORK_TIMEOUT: (component: string, timeoutMs?: number) =>
    InternalError.timeout(component, "network_request", timeoutMs),
} as const;