// src_refactored/core/application/common/ports/use-case.interface.ts

/**
 * Defines the basic contract for a use case.
 * A use case executes a specific piece of business logic.
 *
 * @template TRequest The type of the request object that the use case accepts.
 * @template TResponse The type of the response (or Result) that the use case returns.
 */
export interface IUseCase<TRequest, TResponse> {
  /**
   * Executes the use case with the given request object.
   * @param request The request object for the use case.
   * @returns A Promise that resolves to the response of the use case execution.
   */
  execute(request: TRequest): Promise<TResponse>;
}
