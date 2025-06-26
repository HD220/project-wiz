// src_refactored/core/domain/common/errors.ts

/**
 * Base class for custom domain errors.
 * Ensures that the error name is set correctly and captures the stack trace.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    // Capture stack trace in V8 environments (Node.js, Chrome)
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when a Value Object validation fails.
 */
export class ValueError extends DomainError {
  // Optionally, include the field and value that caused the error
  public readonly field?: string;
  public readonly value?: any;

  constructor(message: string, field?: string, value?: any) {
    super(message);
    this.field = field;
    this.value = value;
  }
}

/**
 * Error thrown when an Entity-specific business rule is violated.
 */
export class EntityError extends DomainError {
  // Optionally, include the entity ID or related info
  public readonly entityId?: string;

  constructor(message: string, entityId?: string) {
    super(message);
    this.entityId = entityId;
  }
}

/**
 * Error thrown when a requested resource or entity is not found.
 */
export class NotFoundError extends DomainError {
  public readonly resourceType?: string;
  public readonly resourceId?: string | number;

  constructor(message: string, resourceType?: string, resourceId?: string | number) {
    super(message);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Error thrown when an IAgentTool fails during its execution.
 * Includes a flag to indicate if the error is considered recoverable by the agent executor,
 * potentially allowing the LLM to attempt a different approach.
 */
export class ToolError extends DomainError {
  public readonly toolName?: string;
  public readonly originalError?: any; // To store the underlying error if any
  public readonly isRecoverable: boolean;

  constructor(
    message: string,
    toolName?: string,
    originalError?: any,
    isRecoverable: boolean = true, // Default to recoverable
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
  public readonly provider?: string; // e.g., 'openai', 'anthropic'
  public readonly statusCode?: number; // HTTP status code if applicable
  public readonly originalError?: any;

  constructor(
    message: string,
    details?: {
      modelId?: string;
      provider?: string;
      statusCode?: number;
      originalError?: any;
    }
  ) {
    super(message);
    this.modelId = details?.modelId;
    this.provider = details?.provider;
    this.statusCode = details?.statusCode;
    this.originalError = details?.originalError;
  }
}
