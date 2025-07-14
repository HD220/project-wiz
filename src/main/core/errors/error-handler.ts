import { DomainError } from "./domain-error";
import { ValidationError } from "./validation-error";
import { NotFoundError } from "./not-found-error";
import { ConflictError } from "./conflict-error";
import { UnauthorizedError } from "./unauthorized-error";
import { InternalError } from "./internal-error";
import { ErrorCode, ErrorCodeUtils } from "./error-codes";

/**
 * Represents a standardized error response
 */
export interface ErrorResponse {
  /** Error code for identification */
  code: ErrorCode;
  /** User-friendly error message */
  message: string;
  /** Error category */
  category: string;
  /** Error severity level */
  severity: "error" | "warning" | "info";
  /** Whether the error is retryable */
  retryable: boolean;
  /** Recovery suggestions */
  suggestions: string[];
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Timestamp when error occurred */
  timestamp: string;
  /** Request/trace ID for debugging */
  traceId?: string;
}

/**
 * Represents internal error information for logging
 */
export interface ErrorLogInfo extends Record<string, unknown> {
  /** Error code */
  code: ErrorCode;
  /** Error message */
  message: string;
  /** Error category */
  category: string;
  /** Error severity level */
  severity: "error" | "warning" | "info";
  /** Full stack trace */
  stack?: string;
  /** Additional context */
  context?: Record<string, unknown>;
  /** Timestamp */
  timestamp: string;
  /** Request/trace ID */
  traceId?: string;
  /** User ID if available */
  userId?: string;
  /** Component that generated the error */
  component?: string;
}

/**
 * Logger interface for error handling
 */
export interface IErrorLogger {
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Centralized error handler for the application
 */
export class ErrorHandler {
  private logger?: IErrorLogger;

  /**
   * Creates a new ErrorHandler instance
   * @param logger - Optional logger instance
   */
  constructor(logger?: IErrorLogger) {
    this.logger = logger;
  }

  /**
   * Handles an error and returns a standardized response
   * @param error - Error to handle
   * @param traceId - Optional trace ID for debugging
   * @param userId - Optional user ID for context
   * @returns Standardized error response
   */
  public handle(
    error: Error,
    traceId?: string,
    userId?: string,
  ): ErrorResponse {
    const standardError = this.transform(error);

    // Log the error
    this.logError(standardError, traceId, userId);

    // Create response
    const response: ErrorResponse = {
      code: standardError.code as ErrorCode,
      message: standardError.message,
      category: standardError.getCategory(),
      severity: standardError.getSeverity(),
      retryable: standardError.isRetryable(),
      suggestions: standardError.getRecoverySuggestions(),
      details: standardError.details,
      timestamp: new Date().toISOString(),
      traceId,
    };

    return response;
  }

  /**
   * Transforms any error into a standardized DomainError
   * @param error - Error to transform
   * @returns Standardized domain error
   */
  public transform(error: Error): DomainError {
    // If it's already a DomainError, return as is
    if (error instanceof DomainError) {
      return error;
    }

    // Handle specific error types
    if (
      error.name === "ValidationError" ||
      error.message.includes("validation")
    ) {
      return ValidationError.multipleFields(
        [{ field: "unknown", rule: "validation", message: error.message }],
        error.message,
      );
    }

    if (error.name === "NotFoundError" || error.message.includes("not found")) {
      return NotFoundError.resource("unknown", "unknown", error.message);
    }

    if (error.name === "ConflictError" || error.message.includes("conflict")) {
      return ConflictError.duplicate(
        "unknown",
        "unknown",
        error.message,
        error.message,
      );
    }

    if (
      error.name === "UnauthorizedError" ||
      error.message.includes("unauthorized")
    ) {
      return UnauthorizedError.authenticationRequired(error.message);
    }

    // Default to internal error
    return InternalError.system("unknown", "unknown", error, error.message);
  }

  /**
   * Logs an error with appropriate severity level
   * @param error - Standardized error to log
   * @param traceId - Optional trace ID
   * @param userId - Optional user ID
   */
  private logError(
    error: DomainError,
    traceId?: string,
    userId?: string,
  ): void {
    if (!this.logger) {
      return;
    }

    const logInfo: ErrorLogInfo = {
      code: error.code as ErrorCode,
      message: error.message,
      category: error.getCategory(),
      severity: error.getSeverity(),
      stack: error.getStackTrace(),
      context: error.details,
      timestamp: error.timestamp.toISOString(),
      traceId,
      userId,
    };

    // Extract component from error if available
    if (error instanceof InternalError) {
      logInfo.component = error.internalInfo.component;
    }

    // Log with appropriate severity
    switch (error.getSeverity()) {
      case "error":
        this.logger.error(`[${error.code}] ${error.message}`, logInfo);
        break;
      case "warning":
        this.logger.warn(`[${error.code}] ${error.message}`, logInfo);
        break;
      case "info":
        this.logger.info(`[${error.code}] ${error.message}`, logInfo);
        break;
    }
  }

  /**
   * Handles multiple errors and returns multiple responses
   * @param errors - Array of errors to handle
   * @param traceId - Optional trace ID
   * @param userId - Optional user ID
   * @returns Array of error responses
   */
  public handleMultiple(
    errors: Error[],
    traceId?: string,
    userId?: string,
  ): ErrorResponse[] {
    return errors.map((error) => this.handle(error, traceId, userId));
  }

  /**
   * Checks if an error is retryable
   * @param error - Error to check
   * @returns Whether the error is retryable
   */
  public isRetryable(error: Error): boolean {
    if (error instanceof DomainError) {
      return error.isRetryable();
    }

    // For non-domain errors, check if they're known retryable types
    const retryableTypes = ["TimeoutError", "NetworkError", "ConnectionError"];
    return retryableTypes.includes(error.name);
  }

  /**
   * Gets recovery suggestions for an error
   * @param error - Error to get suggestions for
   * @returns Array of recovery suggestions
   */
  public getRecoverySuggestions(error: Error): string[] {
    if (error instanceof DomainError) {
      return error.getRecoverySuggestions();
    }

    // Default suggestions for non-domain errors
    return [
      "Try the operation again",
      "Check your input and try again",
      "Contact support if the problem persists",
    ];
  }

  /**
   * Creates a sanitized error response for external consumption
   * @param error - Error to sanitize
   * @param traceId - Optional trace ID
   * @returns Sanitized error response
   */
  public sanitizeError(error: Error, traceId?: string): ErrorResponse {
    const response = this.handle(error, traceId);

    // Remove sensitive information from response
    const sanitized: ErrorResponse = {
      ...response,
      details: this.sanitizeDetails(response.details),
    };

    return sanitized;
  }

  /**
   * Sanitizes error details by removing sensitive information
   * @param details - Error details to sanitize
   * @returns Sanitized details
   */
  private sanitizeDetails(
    details?: Record<string, unknown>,
  ): Record<string, unknown> | undefined {
    if (!details) {
      return undefined;
    }

    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = [
      "password",
      "token",
      "secret",
      "key",
      "credential",
      "auth",
    ];

    for (const [key, value] of Object.entries(details)) {
      const isSensitive = sensitiveKeys.some((sensitive) =>
        key.toLowerCase().includes(sensitive),
      );

      if (isSensitive) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeDetails(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sets the logger for error handling
   * @param logger - Logger instance
   */
  public setLogger(logger: IErrorLogger): void {
    this.logger = logger;
  }

  /**
   * Gets error statistics for monitoring
   * @param errors - Array of errors
   * @returns Error statistics
   */
  public getErrorStats(errors: Error[]): {
    total: number;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    retryableCount: number;
  } {
    const stats = {
      total: errors.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      retryableCount: 0,
    };

    errors.forEach((error) => {
      const domainError = this.transform(error);

      // Count by category
      const category = domainError.getCategory();
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Count by severity
      const severity = domainError.getSeverity();
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + 1;

      // Count retryable errors
      if (domainError.isRetryable()) {
        stats.retryableCount++;
      }
    });

    return stats;
  }
}
