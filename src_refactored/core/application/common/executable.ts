// src_refactored/core/application/common/executable.ts
import { Result } from '../../../shared/result';

/**
 * Represents a command or use case that can be executed.
 *
 * @template InputType - The type of the input data for the execution.
 *                       If no input is required, `void` or an empty object type can be used.
 * @template SuccessData - The type of the data returned on successful execution.
 * @template ErrorType - The type of the error returned on failed execution. Defaults to generic `Error`.
 */
export interface Executable<
  InputType,
  SuccessData,
  ErrorType extends Error = Error, // Default error type
> {
  /**
   * Executes the command or use case.
   *
   * @param input - The input data required for execution.
   * @returns A Promise that resolves to a Result, which is either
   *          successful (containing `SuccessData`) or an error (containing `ErrorType`).
   */
  execute(input: InputType): Promise<Result<SuccessData, ErrorType>>;
}

/**
 * Example Usage (not part of the interface itself):
 *
 * // For a use case with no input that returns a string or specific error
 * // class MyUseCase implements Executable<void, string, MyCustomApplicationError> {
 * //   async execute(): Promise<Result<string, MyCustomApplicationError>> {
 * //     // ... logic ...
 * //     if (success) return Result.ok("Success!");
 * //     return Result.error(new MyCustomApplicationError("Failed!"));
 * //   }
 * // }
 *
 * // For a use case with input
 * // interface CreateUserInput { name: string; }
 * // interface CreateUserOutput { userId: string; }
 * // class CreateUser implements Executable<CreateUserInput, CreateUserOutput> {
 * //   async execute(input: CreateUserInput): Promise<Result<CreateUserOutput, Error>> {
 * //     // ... logic ...
 * //     return Result.ok({ userId: "123" });
 * //   }
 * // }
 */
