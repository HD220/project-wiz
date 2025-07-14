/**
 * Success result type
 * Represents a successful operation with a value
 *
 * @template T - Type of the success value
 */
export interface ISuccess<T> {
  readonly success: true;
  readonly value: T;
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
}

/**
 * Result type that represents either success or error
 * Based on the Railway Oriented Programming pattern
 *
 * @template T - Type of the success value
 * @template E - Type of the error
 */
export type Result<T, E = Error> = ISuccess<T> | IError<E>;

/**
 * Utility class for creating Result instances
 * Provides static methods for creating success and error results
 */
export class ResultUtils {
  /**
   * Create a success result
   * @param value - Success value
   * @returns Success result
   */
  static success<T>(value: T): ISuccess<T> {
    return {
      success: true,
      value,
    };
  }

  /**
   * Create an error result
   * @param error - Error value
   * @returns Error result
   */
  static error<E>(error: E): IError<E> {
    return {
      success: false,
      error,
    };
  }

  /**
   * Check if result is successful
   * @param result - Result to check
   * @returns True if result is successful
   */
  static isSuccess<T, E>(result: Result<T, E>): result is ISuccess<T> {
    return result.success === true;
  }

  /**
   * Check if result is an error
   * @param result - Result to check
   * @returns True if result is an error
   */
  static isError<T, E>(result: Result<T, E>): result is IError<E> {
    return result.success === false;
  }

  /**
   * Extract value from success result or return default
   * @param result - Result to extract from
   * @param defaultValue - Default value if result is error
   * @returns Success value or default value
   */
  static getValueOrDefault<T, E>(result: Result<T, E>, defaultValue: T): T {
    return ResultUtils.isSuccess(result) ? result.value : defaultValue;
  }

  /**
   * Extract error from error result or return default
   * @param result - Result to extract from
   * @param defaultError - Default error if result is success
   * @returns Error value or default error
   */
  static getErrorOrDefault<T, E>(result: Result<T, E>, defaultError: E): E {
    return ResultUtils.isError(result) ? result.error : defaultError;
  }
}
