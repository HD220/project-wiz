// src_refactored/core/domain/common/errors.ts

import { CoreError } from '../../../shared/errors/core.error';

/**
 * Base class for custom domain errors.
 * Inherits from CoreError to provide consistent error structure.
 */
export class DomainError extends CoreError {
  constructor(
    message: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- details can be any structured data
    options?: { code?: string; details?: any; cause?: Error },
  ) {
    super(message, options);
    // CoreError's constructor already sets this.name = this.constructor.name;
  }
}

// Kept the more specific NotFoundError and removed the duplicate.
export class NotFoundError extends DomainError {
  constructor(entityType: string, id: string, cause?: Error) {
    super(`${entityType} with ID '${id}' not found.`, {
      code: `${entityType.toUpperCase()}_NOT_FOUND`,
      // `details` type is `any` from DomainError -> CoreError
      details: { entityType, id },
      cause,
    });
    // Explicitly set name for clarity, though CoreError's constructor handles it.
    this.name = 'NotFoundError';
  }
}

export class ToolNotFoundError extends NotFoundError {
  constructor(toolName: string, cause?: Error) {
    // NotFoundError's constructor sets code and details, using toolName as the 'id'.
    super('Tool', toolName, cause);
    this.name = 'ToolNotFoundError';
    // Ensure toolName is explicitly in details for this specific error type.
    // `this.details` is inherited and might be undefined if not set by super,
    // so we ensure it's an object before assigning to it.
    this.details = {
      ...(this.details && typeof this.details === 'object' ? this.details : {}),
      toolName,
      // id: toolName, // already set by NotFoundError as details.id
    };
  }
}

/**
 * Error thrown when a Value Object validation fails.
 */
export class ValueError extends DomainError {
  constructor(message: string, field?: string, value?: unknown, cause?: Error) {
    super(message, {
      code: 'VALUE_ERROR',
      // `details` type is `any` from DomainError -> CoreError
      details: { field, value },
      cause,
    });
    // Properties 'field' and 'value' are now in this.details.
  }
}

/**
 * Error thrown when an Entity-specific business rule is violated.
 */
export class EntityError extends DomainError {
  constructor(message: string, entityId?: string, cause?: Error) {
    super(message, {
      code: 'ENTITY_ERROR',
      // `details` type is `any` from DomainError -> CoreError
      details: { entityId },
      cause,
    });
    // Property 'entityId' is now in this.details.
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- details can be any structured data
    const opts: { code?: string; details?: any; cause?: Error } = {
      code: 'TOOL_ERROR',
      details: { toolName, isRecoverable },
    };
    // This can be mapped to 'cause' if it's an Error instance
    if (originalError instanceof Error) {
      opts.cause = originalError;
    } else if (originalError !== undefined) {
      // If originalError is not an Error but exists, add it to details
      opts.details.originalError = originalError;
    }
    super(message, opts);
    // Properties toolName, originalError, isRecoverable are now in this.details or this.cause.
  }
}

/**
 * Error thrown by queue operations.
 */
export class QueueError extends DomainError {
  constructor(message: string, queueName?: string, jobId?: string, cause?: Error) {
    super(message, {
      code: 'QUEUE_ERROR',
      // `details` type is `any` from DomainError -> CoreError
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
    // Renamed 'details' to 'errorDetails' to avoid conflict with CoreError options
    errorDetailsProp?: {
      modelId?: string;
      provider?: string;
      statusCode?: number;
      // This can be mapped to 'cause' if it's an Error instance
      originalError?: unknown;
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- details can be any structured data
    const opts: { code?: string; details?: any; cause?: Error } = {
      code: 'LLM_ERROR',
      // Copy all provided details, `details` type is `any`
      details: { ...errorDetailsProp },
    };
    if (errorDetailsProp?.originalError instanceof Error) {
      opts.cause = errorDetailsProp.originalError;
      // Avoid duplication if it's moved to cause
      delete opts.details.originalError;
    }
    // If originalError is not an Error but exists, it remains in opts.details
    super(message, opts);
  }
}

/**
 * Error thrown by embedding generation services.
 */
export class EmbeddingError extends DomainError {
  constructor(
    message: string,
    // Renamed 'details' to 'errorDetails'
    errorDetailsProp?: {
      modelId?: string;
      // This can be mapped to 'cause' if it's an Error instance
      originalError?: unknown;
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- details can be any structured data
    const opts: { code?: string; details?: any; cause?: Error } = {
      code: 'EMBEDDING_ERROR',
      // `details` type is `any`
      details: { ...errorDetailsProp },
    };
    if (errorDetailsProp?.originalError instanceof Error) {
      opts.cause = errorDetailsProp.originalError;
      delete opts.details.originalError;
    }
    super(message, opts);
  }
}
