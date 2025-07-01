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
export type IUseCase<
  TRequest,
  TResponse,
  TError extends Error = DomainError | ApplicationError,
> = Executable<TRequest, TResponse, TError>;

// Note: Previously, IUseCase was an empty interface extending Executable.
// It has been changed to a type alias as per ESLint's recommendation
// (@typescript-eslint/no-empty-object-type), since an interface
// declaring no new members is equivalent to its supertype.
// The type alias still serves as a clear marker for use case implementations.
