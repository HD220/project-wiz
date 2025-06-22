// src_refactored/shared/result.ts

export type Success<T> = { success: true; value: T };
export type Failure<E extends Error = Error> = { success: false; error: E };
export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

export const ok = <T>(value: T): Success<T> => ({ success: true, value });
export const error = <E extends Error>(error: E): Failure<E> => ({
  success: false,
  error,
});

// Example of a more specific error if needed
export class DomainError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    // TODO: Consider if stack trace should include cause's stack in a specific way
  }
}

// Type guards
export const isSuccess = <T, E extends Error>(result: Result<T, E>): result is Success<T> => result.success;
export const isError = <T, E extends Error>(result: Result<T, E>): result is Failure<E> => !result.success;
