// src/core/ports/task.interface.ts

/**
 * Defines the contract for a Task.
 * A Task encapsulates the actual logic to be performed for a job,
 * often involving interactions with external services like LLMs and using specific tools.
 *
 * The `execute` method should:
 * - Return a value (of type `TOutput`) if the task is successfully completed.
 * - Return `void` (or `undefined`/`null`) if the task is not yet complete
 *   but did not encounter an error, indicating it needs to be re-run or continued.
 * - Throw an error if the task processing fails.
 */
export interface ITask<TInput = any, TOutput = any, TTools = any> {
  execute(payload: TInput, tools?: TTools): Promise<TOutput | void>;
}
