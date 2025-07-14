/**
 * Base class for all domain-related errors
 * Provides a consistent structure for error handling across the application
 */
export abstract class DomainError extends Error {
  /** Unique error code for identification */
  public readonly code: string;

  /** Error message for user display */
  public readonly message: string;

  /** Additional details for debugging */
  public readonly details?: Record<string, unknown>;

  /** Timestamp when error occurred */
  public readonly timestamp: Date;

  /** Original error if this is a wrapped error */
  public readonly originalError?: Error;

  /**
   * Creates a new DomainError instance
   * @param code - Unique error code
   * @param message - Error message
   * @param details - Additional error details
   * @param originalError - Original error if this is a wrapped error
   */
  protected constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>,
    originalError?: Error,
  ) {
    super(message);

    this.code = code;
    this.message = message;
    this.details = details;
    this.timestamp = new Date();
    this.originalError = originalError;

    // Maintain proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly
    Object.setPrototypeOf(this, DomainError.prototype);
  }

  /**
   * Converts error to JSON representation
   * @returns JSON representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      originalError: this.originalError?.message,
    };
  }

  /**
   * Converts error to string representation
   * @returns String representation of the error
   */
  public toString(): string {
    const baseStr = `[${this.code}] ${this.message}`;

    if (this.details) {
      const detailsStr = JSON.stringify(this.details, null, 2);
      return `${baseStr}\nDetails: ${detailsStr}`;
    }

    return baseStr;
  }

  /**
   * Gets the full stack trace including original error
   * @returns Complete stack trace
   */
  public getStackTrace(): string {
    let stackTrace = this.stack || "";

    if (this.originalError?.stack) {
      stackTrace += `\nCaused by: ${this.originalError.stack}`;
    }

    return stackTrace;
  }

  /**
   * Gets error severity level
   * @returns Severity level (error, warning, info)
   */
  public abstract getSeverity(): "error" | "warning" | "info";

  /**
   * Gets error category for classification
   * @returns Error category
   */
  public abstract getCategory(): string;

  /**
   * Checks if this error is retryable
   * @returns Whether the operation can be retried
   */
  public abstract isRetryable(): boolean;

  /**
   * Gets recovery suggestions for the error
   * @returns Array of recovery suggestions
   */
  public abstract getRecoverySuggestions(): string[];
}
