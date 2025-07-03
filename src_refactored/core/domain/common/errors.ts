// src_refactored/core/domain/common/errors.ts

import { CoreError } from '../../../shared/errors/core.error';

/**
 * Base class for custom domain errors.
 * Inherits from CoreError to provide consistent error structure.
 */
export class DomainError extends CoreError {
  constructor(
    message: string,
    options?: { code?: string; details?: unknown; cause?: Error },
  ) {
    super(message, options);
  }
}

// Kept the more specific NotFoundError and removed the duplicate.
export class NotFoundError extends DomainError {
  constructor(entityType: string, id: string, cause?: Error) {
    super(`${entityType} with ID '${id}' not found.`, {
      code: `${entityType.toUpperCase()}_NOT_FOUND`,
      details: { entityType, id },
      cause,
    });
    this.name = 'NotFoundError';
  }
}

export class ToolNotFoundError extends NotFoundError {
  constructor(toolName: string, cause?: Error) {
    super('Tool', toolName, {
      details: { toolName },
      cause,
    });
    this.name = 'ToolNotFoundError';
  }
}

/**
 * Error thrown when a Value Object validation fails.
 */
export class ValueError extends DomainError {
  constructor(message: string, field?: string, value?: unknown, cause?: Error) {
    super(message, {
      code: 'VALUE_ERROR',
      details: { field, value },
      cause,
    });
  }
}

/**
 * Error thrown when an Entity-specific business rule is violated.
 */
export class EntityError extends DomainError {
  constructor(message: string, entityId?: string, cause?: Error) {
    super(message, {
      code: 'ENTITY_ERROR',
      details: { entityId },
      cause,
    });
  }
}

// Duplicate NotFoundError removed.
// The one above is now the single source.

/**
 * Error thrown when an IAgentTool fails during its execution.
 * Includes a flag to indicate if the error is considered recoverable by the agent executor,
 * potentially allowing the LLM to attempt a different approach.
 */
export class ToolError extends DomainError {
  constructor(
    message: string,
    toolName?: string,
    originalError?: unknown,
    isRecoverable: boolean = true,
  ) {
    super(message, {
      code: 'TOOL_ERROR',
      details: { toolName, isRecoverable, originalError: originalError instanceof Error ? undefined : originalError },
      cause: originalError instanceof Error ? originalError : undefined,
    });
  }
}

/**
 * Error thrown by queue operations.
 */
export class QueueError extends DomainError {
  constructor(message: string, queueName?: string, jobId?: string, cause?: Error) {
    super(message, {
      code: 'QUEUE_ERROR',
      details: { queueName, jobId },
      cause,
    });
  }
}

/**
 * Error thrown by LLM interactions.
 */
export class LLMError extends DomainError {
  constructor(
    message: string,
    errorDetailsProp?: {
      modelId?: string;
      provider?: string;
      statusCode?: number;
      originalError?: unknown;
    }
  ) {
    const opts: { code?: string; details?: unknown; cause?: Error } = {
      code: 'LLM_ERROR',
      details: { ...errorDetailsProp },
    };
    if (errorDetailsProp?.originalError instanceof Error) {
      opts.cause = errorDetailsProp.originalError;
      delete opts.details.originalError;
    }
    super(message, opts);
  }
}

/**
 * Error thrown by embedding generation services.
 */
export class EmbeddingError extends DomainError {
  constructor(
    message: string,
    errorDetailsProp?: {
      modelId?: string;
      originalError?: unknown;
    }
  ) {
    const opts: { code?: string; details?: unknown; cause?: Error } = {
      code: 'EMBEDDING_ERROR',
      details: { ...errorDetailsProp },
    };
    if (errorDetailsProp?.originalError instanceof Error) {
      opts.cause = errorDetailsProp.originalError;
      delete opts.details.originalError;
    }
    super(message, opts);
  }
}
