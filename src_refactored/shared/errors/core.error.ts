/**
 * @file Defines the CoreError class, a base class for errors originating from the core application layers (Domain and Application).
 */

/**
 * Base class for errors that occur within the core business logic (Domain) or
 * application orchestration logic (Application).
 *
 * This class allows for consistent error handling and identification of errors
 * that are expected and potentially recoverable or require specific responses,
 * as opposed to unexpected system errors.
 *
 * Subclasses should set their own `name` property to the class name for clear identification.
 */
export class CoreError extends Error {
  /**
   * An optional application-specific error code.
   * This can be used by clients to programmatically identify and handle errors,
   * or for more specific categorization of errors than the error name alone.
   * Example: 'USER_NOT_FOUND', 'INSUFFICIENT_FUNDS'.
   */
  public readonly code?: string;

  /**
   * Optional additional details or context about the error.
   * This can be any structured data that helps in understanding or handling the error.
   * For example, for a validation error, this might contain an object detailing
   * which fields failed validation and why (though ZodError is typically used for that directly).
   * For other domain errors, it might contain IDs or relevant state.
   */
  public readonly details?: any;

  /**
   * The original error that caused this CoreError, if applicable.
   * Useful for preserving stack traces and understanding the root cause,
   * especially when wrapping lower-level errors.
   */
  public readonly cause?: Error;

  constructor(
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- details can be any structured data
    options?: { code?: string; details?: any; cause?: Error },
  ) {
    super(message);
    // Ensures the name property reflects the subclass name for easier identification
    this.name = this.constructor.name;
    this.code = options?.code;
    this.details = options?.details;
    this.cause = options?.cause;

    // Maintains proper stack trace for V8 environments (Node.js, Chrome)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
