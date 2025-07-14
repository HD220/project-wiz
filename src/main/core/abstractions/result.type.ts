/**
 * Success result type
 * Represents a successful operation with a value
 *
 * @template T - Type of the success value
 */
export interface ISuccess<T> {
  readonly success: true;
  readonly value: T;
  readonly isSuccess: true;
  readonly isFailure: false;
}

/**
 * Error result type
 * Represents a failed operation with an error
 *
 * @template E - Type of the error
 */
export interface IError<E> {
  readonly success: false;
  readonly error: E;
  readonly isSuccess: false;
  readonly isFailure: true;
}

/**
 * Result type that represents either success or error
 * Based on the Railway Oriented Programming pattern
 *
 * @template T - Type of the success value
 * @template E - Type of the error
 */
export type ResultType<T, E = Error> = ISuccess<T> | IError<E>;

/**
 * Result utility class for creating and working with Result instances
 * Provides static methods for creating success and error results
 */
export class Result {
  /**
   * Create a success result
   * @param value - Success value
   * @returns Success result
   */
  static success<T>(value: T): ISuccess<T> {
    return {
      success: true,
      value,
      isSuccess: true,
      isFailure: false,
    };
  }

  /**
   * Create an error result
   * @param error - Error value
   * @returns Error result
   */
  static failure<E>(error: E): IError<E> {
    return {
      success: false,
      error,
      isSuccess: false,
      isFailure: true,
    };
  }

  /**
   * Create an error result (alias for failure)
   * @param error - Error value
   * @returns Error result
   */
  static error<E>(error: E): IError<E> {
    return Result.failure(error);
  }

  /**
   * Check if result is successful
   * @param result - Result to check
   * @returns True if result is successful
   */
  static isSuccess<T, E>(result: ResultType<T, E>): result is ISuccess<T> {
    return result.success === true;
  }

  /**
   * Check if result is an error
   * @param result - Result to check
   * @returns True if result is an error
   */
  static isError<T, E>(result: ResultType<T, E>): result is IError<E> {
    return result.success === false;
  }

  /**
   * Check if result is an error (alias for isError)
   * @param result - Result to check
   * @returns True if result is an error
   */
  static isFailure<T, E>(result: ResultType<T, E>): result is IError<E> {
    return result.success === false;
  }

  /**
   * Extract value from success result or return default
   * @param result - Result to extract from
   * @param defaultValue - Default value if result is error
   * @returns Success value or default value
   */
  static getValueOrDefault<T, E>(result: ResultType<T, E>, defaultValue: T): T {
    return Result.isSuccess(result) ? result.value : defaultValue;
  }

  /**
   * Extract error from error result or return default
   * @param result - Result to extract from
   * @param defaultError - Default error if result is success
   * @returns Error value or default error
   */
  static getErrorOrDefault<T, E>(result: ResultType<T, E>, defaultError: E): E {
    return Result.isError(result) ? result.error : defaultError;
  }
}

// Export the type as Result for convenience
export type Result<T, E = Error> = ResultType<T, E>;

/**
 * Utility class for creating Result instances
 * @deprecated Use Result class instead
 */
export class ResultUtils extends Result {}
