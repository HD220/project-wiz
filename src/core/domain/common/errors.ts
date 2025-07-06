// src/core/domain/common/errors.ts

import { CoreError } from "../../../shared/errors/core.error";

/**
 * Base class for custom domain errors.
 * Inherits from CoreError to provide consistent error structure.
 */
export class DomainError extends CoreError {
  constructor(
    message: string,
    options?: { code?: string; details?: unknown; cause?: Error }
  ) {
    super(message, options);
  }
}

// Kept the more specific NotFoundError and removed the duplicate.
export class NotFoundError extends DomainError {
  constructor(entityType: string, id: string, cause?: Error) {
    const domainErrorOptions: {
      code?: string;
      details?: unknown;
      cause?: Error;
    } = {
      code: `${entityType.toUpperCase()}_NOT_FOUND`,
      details: { entityType, id },
      cause,
    };
    super(`${entityType} with ID '${id}' not found.`, domainErrorOptions);
    this.name = "NotFoundError";
  }
}

export class ToolNotFoundError extends NotFoundError {
  constructor(toolName: string, cause?: Error) {
    super("Tool", toolName, cause);
    this.name = "ToolNotFoundError";
  }
}

/**
 * Error thrown when a Value Object validation fails.
 */
export class ValueError extends DomainError {
  constructor(
    message: string,
    options?: {
      field?: string;
      value?: unknown;
      details?: unknown;
      cause?: Error;
    }
  ) {
    super(message, {
      code: "VALUE_ERROR",
      details: options?.details || {
        field: options?.field,
        value: options?.value,
      },
      cause: options?.cause,
    });
  }
}

/**
 * Error thrown when an Entity-specific business rule is violated.
 */
export class EntityError extends DomainError {
  constructor(
    message: string,
    options?: { entityId?: string; details?: unknown; cause?: Error }
  ) {
    super(message, {
      code: "ENTITY_ERROR",
      details: options?.details || { entityId: options?.entityId },
      cause: options?.cause,
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
    options?: {
      toolName?: string;
      originalError?: unknown;
      isRecoverable?: boolean;
      details?: unknown;
      cause?: Error;
    }
  ) {
    super(message, {
      code: "TOOL_ERROR",
      details: options?.details || {
        toolName: options?.toolName,
        isRecoverable: options?.isRecoverable,
        originalError:
          options?.originalError instanceof Error
            ? undefined
            : options?.originalError,
      },
      cause:
        options?.originalError instanceof Error
          ? options?.originalError
          : options?.cause,
    });
  }
}

/**
 * Error thrown by queue operations.
 */
export class QueueError extends DomainError {
  constructor(
    message: string,
    options?: {
      queueName?: string;
      jobId?: string;
      details?: unknown;
      cause?: Error;
    }
  ) {
    super(message, {
      code: "QUEUE_ERROR",
      details: options?.details || {
        queueName: options?.queueName,
        jobId: options?.jobId,
      },
      cause: options?.cause,
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
    const details = { ...errorDetailsProp };
    let cause: Error | undefined;

    if (details.originalError instanceof Error) {
      cause = details.originalError;
      delete details.originalError;
    }

    super(message, { code: "LLM_ERROR", details, cause });
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
    const details = { ...errorDetailsProp };
    let cause: Error | undefined;

    if (details.originalError instanceof Error) {
      cause = details.originalError;
      delete details.originalError;
    }

    super(message, { code: "EMBEDDING_ERROR", details, cause });
  }
}
