// src_refactored/core/domain/common/errors.ts

/**
 * Base class for custom domain errors.
 * Ensures that the error name is set correctly and captures the stack trace.
 */
export class DomainError extends Error {
  public readonly cause?: Error;
  constructor(message: string, cause?: Error) { // Added optional cause
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;

    // Capture stack trace in V8 environments (Node.js, Chrome)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof (Error as any).captureStackTrace === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

// Kept the more specific NotFoundError and removed the duplicate.
export class NotFoundError extends DomainError {
  constructor(entityType: string, id: string, cause?: Error) {
    super(`${entityType} with ID '${id}' not found.`, cause);
    this.name = "NotFoundError";
  }
}

export class ToolNotFoundError extends NotFoundError {
  public readonly toolName: string;
  constructor(toolName: string, cause?: Error) {
    super("Tool", toolName, cause);
    this.name = this.constructor.name;
    this.toolName = toolName;
  }
}

/**
 * Error thrown when a Value Object validation fails.
 */
export class ValueError extends DomainError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(message: string, field?: string, value?: unknown, cause?: Error) {
    super(message, cause);
    this.field = field;
    this.value = value;
  }
}

/**
 * Error thrown when an Entity-specific business rule is violated.
 */
export class EntityError extends DomainError {
  public readonly entityId?: string;

  constructor(message: string, entityId?: string, cause?: Error) {
    super(message, cause);
    this.entityId = entityId;
  }
}

// Duplicate NotFoundError removed. The one above is now the single source.

/**
 * Error thrown when an IAgentTool fails during its execution.
 * Includes a flag to indicate if the error is considered recoverable by the agent executor,
 * potentially allowing the LLM to attempt a different approach.
 */
export class ToolError extends DomainError {
  public readonly toolName?: string;
  public readonly originalError?: unknown;
  public readonly isRecoverable: boolean;

  constructor(
    message: string,
    toolName?: string,
    originalError?: unknown,
    isRecoverable: boolean = true,
  ) {
    super(message);
    this.toolName = toolName;
    this.originalError = originalError;
    this.isRecoverable = isRecoverable;
  }
}

/**
 * Error thrown by queue operations.
 */
export class QueueError extends DomainError {
  public readonly queueName?: string;
  public readonly jobId?: string;

  constructor(message: string, queueName?: string, jobId?: string) {
    super(message);
    this.queueName = queueName;
    this.jobId = jobId;
  }
}

/**
 * Error thrown by LLM interactions.
 */
export class LLMError extends DomainError {
  public readonly modelId?: string;
  public readonly provider?: string;
  public readonly statusCode?: number;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    details?: {
      modelId?: string;
      provider?: string;
      statusCode?: number;
      originalError?: unknown;
    }
  ) {
    super(message);
    this.modelId = details?.modelId;
    this.provider = details?.provider;
    this.statusCode = details?.statusCode;
    this.originalError = details?.originalError;
  }
}

/**
 * Error thrown by embedding generation services.
 */
export class EmbeddingError extends DomainError {
  public readonly modelId?: string;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    details?: {
      modelId?: string;
      originalError?: unknown;
    }
  ) {
    super(message);
    this.modelId = details?.modelId;
    this.originalError = details?.originalError;
  }
}
