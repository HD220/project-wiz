/**
 * @file Defines the standard response structure for use cases.
 */

/**
 * Represents the details of an error that occurred during use case execution.
 */
export interface IUseCaseErrorDetails {
  /**
   * The name of the error (e.g., 'ValidationError', 'NotFoundError').
   */
  readonly name: string;

  /**
   * A human-readable message describing the error.
   */
  readonly message: string;

  /**
   * An optional error code, useful for specific business rule violations
   * or for client-side error handling.
   */
  readonly code?: string;

  /**
   * Optional additional details about the error.
   * For instance, for a validation error, this could contain
   * an object mapping field names to error messages (e.g., ZodError.flatten()).
   */
  readonly details?: any;

  /**
   * The original error that caused this, if applicable.
   * Should be used for logging and debugging, not typically exposed to the end-user.
   */
  readonly cause?: Error;
}

/**
 * Defines a standardized structure for use case responses.
 * It can represent either a successful outcome with data, or a failed outcome with error details.
 *
 * @template TOutput The type of data returned on a successful execution. Defaults to `void` if no data is returned.
 * @template TErrorDetails The type of error details returned on a failed execution. Defaults to `IUseCaseErrorDetails`.
 */
export interface IUseCaseResponse<
  TOutput = void,
  TErrorDetails = IUseCaseErrorDetails,
> {
  /**
   * Indicates whether the use case execution was successful.
   * `true` for success, `false` for failure.
   */
  readonly success: boolean;

  /**
   * The data returned by the use case upon successful execution.
   * This field is present only if `success` is `true` and `TOutput` is not `void`.
   * If `TOutput` is `void` and execution is successful, `data` can be undefined.
   */
  readonly data?: TOutput;

  /**
   * Details about the error that occurred during execution.
   * This field is present only if `success` is `false`.
   */
  readonly error?: TErrorDetails;
}

/**
 * Utility type for a successful use case response.
 */
export type SuccessUseCaseResponse<TOutput = void> = IUseCaseResponse<
  TOutput,
  any
> & {
  success: true;
  data: TOutput; // data is explicitly required for success, even if void
  error?: never;
};

/**
 * Utility type for a failed use case response.
 */
export type ErrorUseCaseResponse<TErrorDetails = IUseCaseErrorDetails> =
  IUseCaseResponse<any, TErrorDetails> & {
    success: false;
    data?: never;
    error: TErrorDetails;
  };

/**
 * Helper function to create a successful response.
 * @param data The output data.
 * @returns A successful IUseCaseResponse.
 */
export function successUseCaseResponse<TOutput = void>(
  data: TOutput,
): SuccessUseCaseResponse<TOutput> {
  return {
    success: true,
    data,
  };
}

/**
 * Helper function to create a failed response.
 * @param errorDetails The details of the error.
 * @returns A failed IUseCaseResponse.
 */
export function errorUseCaseResponse<TErrorDetails = IUseCaseErrorDetails>(
  errorDetails: TErrorDetails,
): ErrorUseCaseResponse<TErrorDetails> {
  return {
    success: false,
    error: errorDetails,
  };
}
