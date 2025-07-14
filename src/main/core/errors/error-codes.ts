/**
 * Centralized error code registry for the entire application
 * This file maintains a registry of all error codes used across the system
 */

import { ValidationErrorCode } from "./validation-error";
import { NotFoundErrorCode } from "./not-found-error";
import { ConflictErrorCode } from "./conflict-error";
import { UnauthorizedErrorCode } from "./unauthorized-error";
import { InternalErrorCode } from "./internal-error";

/**
 * All error codes used in the application
 */
export const ErrorCodes = {
  // Validation errors (VALIDATION_001 - VALIDATION_999)
  ...ValidationErrorCode,

  // Not found errors (NOT_FOUND_001 - NOT_FOUND_999)
  ...NotFoundErrorCode,

  // Conflict errors (CONFLICT_001 - CONFLICT_999)
  ...ConflictErrorCode,

  // Unauthorized errors (UNAUTHORIZED_001 - UNAUTHORIZED_999)
  ...UnauthorizedErrorCode,

  // Internal errors (INTERNAL_001 - INTERNAL_999)
  ...InternalErrorCode,
} as const;

/**
 * Type representing all possible error codes
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Error message mappings for internationalization
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Validation error messages
  [ValidationErrorCode.REQUIRED_FIELD]: "This field is required",
  [ValidationErrorCode.INVALID_FORMAT]: "Invalid format",
  [ValidationErrorCode.INVALID_LENGTH]: "Invalid length",
  [ValidationErrorCode.INVALID_VALUE]: "Invalid value",
  [ValidationErrorCode.INVALID_TYPE]: "Invalid type",
  [ValidationErrorCode.DUPLICATE_VALUE]: "Duplicate value",
  [ValidationErrorCode.INVALID_RANGE]: "Value out of range",
  [ValidationErrorCode.INVALID_PATTERN]: "Invalid pattern",
  [ValidationErrorCode.MISSING_DEPENDENCY]: "Missing dependency",
  [ValidationErrorCode.INVALID_RELATIONSHIP]: "Invalid relationship",

  // Not found error messages
  [NotFoundErrorCode.RESOURCE_NOT_FOUND]: "Resource not found",
  [NotFoundErrorCode.ENTITY_NOT_FOUND]: "Entity not found",
  [NotFoundErrorCode.FILE_NOT_FOUND]: "File not found",
  [NotFoundErrorCode.CONFIGURATION_NOT_FOUND]: "Configuration not found",
  [NotFoundErrorCode.SERVICE_NOT_FOUND]: "Service not found",
  [NotFoundErrorCode.ENDPOINT_NOT_FOUND]: "Endpoint not found",
  [NotFoundErrorCode.USER_NOT_FOUND]: "User not found",
  [NotFoundErrorCode.PROJECT_NOT_FOUND]: "Project not found",
  [NotFoundErrorCode.AGENT_NOT_FOUND]: "Agent not found",
  [NotFoundErrorCode.CHANNEL_NOT_FOUND]: "Channel not found",

  // Conflict error messages
  [ConflictErrorCode.RESOURCE_CONFLICT]: "Resource conflict",
  [ConflictErrorCode.DUPLICATE_RESOURCE]: "Duplicate resource",
  [ConflictErrorCode.CONCURRENT_MODIFICATION]:
    "Concurrent modification detected",
  [ConflictErrorCode.STATE_CONFLICT]: "State conflict",
  [ConflictErrorCode.BUSINESS_RULE_CONFLICT]: "Business rule violation",
  [ConflictErrorCode.DEPENDENCY_CONFLICT]: "Dependency conflict",
  [ConflictErrorCode.VERSION_CONFLICT]: "Version conflict",
  [ConflictErrorCode.LOCK_CONFLICT]: "Lock conflict",
  [ConflictErrorCode.UNIQUE_CONSTRAINT_VIOLATION]:
    "Unique constraint violation",
  [ConflictErrorCode.REFERENTIAL_INTEGRITY_VIOLATION]:
    "Referential integrity violation",

  // Unauthorized error messages
  [UnauthorizedErrorCode.AUTHENTICATION_REQUIRED]: "Authentication required",
  [UnauthorizedErrorCode.INVALID_CREDENTIALS]: "Invalid credentials",
  [UnauthorizedErrorCode.TOKEN_EXPIRED]: "Token expired",
  [UnauthorizedErrorCode.TOKEN_INVALID]: "Invalid token",
  [UnauthorizedErrorCode.INSUFFICIENT_PERMISSIONS]: "Insufficient permissions",
  [UnauthorizedErrorCode.ROLE_REQUIRED]: "Role required",
  [UnauthorizedErrorCode.RESOURCE_ACCESS_DENIED]: "Resource access denied",
  [UnauthorizedErrorCode.OPERATION_NOT_ALLOWED]: "Operation not allowed",
  [UnauthorizedErrorCode.SESSION_EXPIRED]: "Session expired",
  [UnauthorizedErrorCode.ACCOUNT_DISABLED]: "Account disabled",

  // Internal error messages
  [InternalErrorCode.SYSTEM_ERROR]: "System error",
  [InternalErrorCode.DATABASE_ERROR]: "Database error",
  [InternalErrorCode.NETWORK_ERROR]: "Network error",
  [InternalErrorCode.FILE_SYSTEM_ERROR]: "File system error",
  [InternalErrorCode.CONFIGURATION_ERROR]: "Configuration error",
  [InternalErrorCode.DEPENDENCY_ERROR]: "Dependency error",
  [InternalErrorCode.TIMEOUT_ERROR]: "Timeout error",
  [InternalErrorCode.MEMORY_ERROR]: "Memory error",
  [InternalErrorCode.SERIALIZATION_ERROR]: "Serialization error",
  [InternalErrorCode.EXTERNAL_SERVICE_ERROR]: "External service error",
};

/**
 * Error categorization for better organization
 */
export const ErrorCategories = {
  VALIDATION: "validation",
  NOT_FOUND: "not_found",
  CONFLICT: "conflict",
  UNAUTHORIZED: "authorization",
  INTERNAL: "internal",
} as const;

/**
 * Maps error codes to their respective categories
 */
export const ErrorCodeCategories: Record<
  ErrorCode,
  keyof typeof ErrorCategories
> = {
  // Validation errors
  [ValidationErrorCode.REQUIRED_FIELD]: "VALIDATION",
  [ValidationErrorCode.INVALID_FORMAT]: "VALIDATION",
  [ValidationErrorCode.INVALID_LENGTH]: "VALIDATION",
  [ValidationErrorCode.INVALID_VALUE]: "VALIDATION",
  [ValidationErrorCode.INVALID_TYPE]: "VALIDATION",
  [ValidationErrorCode.DUPLICATE_VALUE]: "VALIDATION",
  [ValidationErrorCode.INVALID_RANGE]: "VALIDATION",
  [ValidationErrorCode.INVALID_PATTERN]: "VALIDATION",
  [ValidationErrorCode.MISSING_DEPENDENCY]: "VALIDATION",
  [ValidationErrorCode.INVALID_RELATIONSHIP]: "VALIDATION",

  // Not found errors
  [NotFoundErrorCode.RESOURCE_NOT_FOUND]: "NOT_FOUND",
  [NotFoundErrorCode.ENTITY_NOT_FOUND]: "NOT_FOUND",
  [NotFoundErrorCode.FILE_NOT_FOUND]: "NOT_FOUND",
  [NotFoundErrorCode.CONFIGURATION_NOT_FOUND]: "NOT_FOUND",
  [NotFoundErrorCode.SERVICE_NOT_FOUND]: "NOT_FOUND",
  [NotFoundErrorCode.ENDPOINT_NOT_FOUND]: "NOT_FOUND",
  [NotFoundErrorCode.USER_NOT_FOUND]: "NOT_FOUND",
  [NotFoundErrorCode.PROJECT_NOT_FOUND]: "NOT_FOUND",
  [NotFoundErrorCode.AGENT_NOT_FOUND]: "NOT_FOUND",
  [NotFoundErrorCode.CHANNEL_NOT_FOUND]: "NOT_FOUND",

  // Conflict errors
  [ConflictErrorCode.RESOURCE_CONFLICT]: "CONFLICT",
  [ConflictErrorCode.DUPLICATE_RESOURCE]: "CONFLICT",
  [ConflictErrorCode.CONCURRENT_MODIFICATION]: "CONFLICT",
  [ConflictErrorCode.STATE_CONFLICT]: "CONFLICT",
  [ConflictErrorCode.BUSINESS_RULE_CONFLICT]: "CONFLICT",
  [ConflictErrorCode.DEPENDENCY_CONFLICT]: "CONFLICT",
  [ConflictErrorCode.VERSION_CONFLICT]: "CONFLICT",
  [ConflictErrorCode.LOCK_CONFLICT]: "CONFLICT",
  [ConflictErrorCode.UNIQUE_CONSTRAINT_VIOLATION]: "CONFLICT",
  [ConflictErrorCode.REFERENTIAL_INTEGRITY_VIOLATION]: "CONFLICT",

  // Unauthorized errors
  [UnauthorizedErrorCode.AUTHENTICATION_REQUIRED]: "UNAUTHORIZED",
  [UnauthorizedErrorCode.INVALID_CREDENTIALS]: "UNAUTHORIZED",
  [UnauthorizedErrorCode.TOKEN_EXPIRED]: "UNAUTHORIZED",
  [UnauthorizedErrorCode.TOKEN_INVALID]: "UNAUTHORIZED",
  [UnauthorizedErrorCode.INSUFFICIENT_PERMISSIONS]: "UNAUTHORIZED",
  [UnauthorizedErrorCode.ROLE_REQUIRED]: "UNAUTHORIZED",
  [UnauthorizedErrorCode.RESOURCE_ACCESS_DENIED]: "UNAUTHORIZED",
  [UnauthorizedErrorCode.OPERATION_NOT_ALLOWED]: "UNAUTHORIZED",
  [UnauthorizedErrorCode.SESSION_EXPIRED]: "UNAUTHORIZED",
  [UnauthorizedErrorCode.ACCOUNT_DISABLED]: "UNAUTHORIZED",

  // Internal errors
  [InternalErrorCode.SYSTEM_ERROR]: "INTERNAL",
  [InternalErrorCode.DATABASE_ERROR]: "INTERNAL",
  [InternalErrorCode.NETWORK_ERROR]: "INTERNAL",
  [InternalErrorCode.FILE_SYSTEM_ERROR]: "INTERNAL",
  [InternalErrorCode.CONFIGURATION_ERROR]: "INTERNAL",
  [InternalErrorCode.DEPENDENCY_ERROR]: "INTERNAL",
  [InternalErrorCode.TIMEOUT_ERROR]: "INTERNAL",
  [InternalErrorCode.MEMORY_ERROR]: "INTERNAL",
  [InternalErrorCode.SERIALIZATION_ERROR]: "INTERNAL",
  [InternalErrorCode.EXTERNAL_SERVICE_ERROR]: "INTERNAL",
};

/**
 * Utility functions for working with error codes
 */
export class ErrorCodeUtils {
  /**
   * Gets the user-friendly message for an error code
   * @param code - Error code
   * @returns User-friendly error message
   */
  public static getMessage(code: ErrorCode): string {
    return ErrorMessages[code] || "Unknown error";
  }

  /**
   * Gets the category for an error code
   * @param code - Error code
   * @returns Error category
   */
  public static getCategory(code: ErrorCode): string {
    return ErrorCategories[ErrorCodeCategories[code]] || "unknown";
  }

  /**
   * Checks if an error code is retryable
   * @param code - Error code
   * @returns Whether the error is retryable
   */
  public static isRetryable(code: ErrorCode): boolean {
    const retryableCodes: ErrorCode[] = [
      // Network and timeout errors are retryable
      InternalErrorCode.NETWORK_ERROR,
      InternalErrorCode.TIMEOUT_ERROR,
      InternalErrorCode.EXTERNAL_SERVICE_ERROR,
      // Concurrent modification and version conflicts are retryable
      ConflictErrorCode.CONCURRENT_MODIFICATION,
      ConflictErrorCode.VERSION_CONFLICT,
      ConflictErrorCode.LOCK_CONFLICT,
      // Expired tokens are retryable
      UnauthorizedErrorCode.TOKEN_EXPIRED,
      UnauthorizedErrorCode.SESSION_EXPIRED,
    ];

    return retryableCodes.includes(code);
  }

  /**
   * Gets the severity level for an error code
   * @param code - Error code
   * @returns Severity level
   */
  public static getSeverity(code: ErrorCode): "error" | "warning" | "info" {
    const category = ErrorCodeCategories[code];

    switch (category) {
      case "INTERNAL":
        return "error";
      case "VALIDATION":
      case "NOT_FOUND":
      case "CONFLICT":
      case "UNAUTHORIZED":
        return "warning";
      default:
        return "error";
    }
  }

  /**
   * Gets all error codes for a specific category
   * @param category - Error category
   * @returns Array of error codes in the category
   */
  public static getCodesByCategory(
    category: keyof typeof ErrorCategories,
  ): ErrorCode[] {
    return Object.entries(ErrorCodeCategories)
      .filter(([, cat]) => cat === category)
      .map(([code]) => code as ErrorCode);
  }

  /**
   * Validates that an error code is unique and follows the naming convention
   * @param code - Error code to validate
   * @returns Whether the error code is valid
   */
  public static isValidErrorCode(code: string): boolean {
    // Check format: CATEGORY_NNN (e.g., VALIDATION_001)
    const pattern =
      /^(VALIDATION|NOT_FOUND|CONFLICT|UNAUTHORIZED|INTERNAL)_\d{3}$/;
    return pattern.test(code);
  }

  /**
   * Gets the next available error code for a category
   * @param category - Error category
   * @returns Next available error code
   */
  public static getNextErrorCode(
    category: keyof typeof ErrorCategories,
  ): string {
    const codes = this.getCodesByCategory(category);
    const numbers = codes.map((code) => parseInt(code.split("_")[1]));
    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;

    return `${category}_${nextNumber.toString().padStart(3, "0")}`;
  }
}
