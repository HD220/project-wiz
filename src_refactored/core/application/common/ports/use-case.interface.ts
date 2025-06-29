// src_refactored/core/application/common/ports/use-case.interface.ts
import { DomainError } from '@/domain/common/errors';

import { ApplicationError } from '@/application/common/errors';

import { Executable } from '../executable';

/**
 * Defines the basic contract for a use case.
 * A use case executes a specific piece of business logic.
 * It extends the generic Executable interface.
 *
 * @template TRequest The type of the request object that the use case accepts.
 * @template TResponse The type of the successful output from the use case.
 * @template TError The type of the error output from the use case. Defaults to DomainError or ApplicationError.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IUseCase<
  TRequest,
  TResponse,
  TError extends Error = DomainError | ApplicationError,
> extends Executable<TRequest, TResponse, TError> {
  // This interface is intentionally kept lean, primarily inheriting from Executable.
  // Future enhancements or specific use case methods can be added here.
  // For now, it serves as a clear marker for use case implementations.
}
