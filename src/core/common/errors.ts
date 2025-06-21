// src/core/common/errors.ts

/**
 * Base class for custom application errors.
 * Ensures that the error name is set correctly.
 */
export class CoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // For V8 environments (Node.js, Chrome), capturing the stack trace can be helpful.
    // If Error.captureStackTrace is available, use it.
    if (typeof (Error as any).captureStackTrace === 'function') {
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when a tool fails during its execution.
 */
export class ToolExecutionError extends CoreError {
  public readonly toolName?: string;
  public readonly originalError?: any;

  constructor(message: string, toolName?: string, originalError?: any) {
    super(message);
    this.toolName = toolName;
    this.originalError = originalError;
  }
}

/**
 * Error thrown when an interaction with an LLM fails or returns an unexpected error.
 */
export class LLMError extends CoreError {
  public readonly modelName?: string;
  public readonly provider?: string;
  public readonly originalError?: any;

  constructor(message: string, modelName?: string, provider?: string, originalError?: any) {
    super(message);
    this.modelName = modelName;
    this.provider = provider;
    this.originalError = originalError;
  }
}

/**
 * Error thrown due to configuration issues (e.g., missing API keys, invalid settings).
 */
export class ConfigurationError extends CoreError {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Error thrown specifically during the processing of a job by a worker or agent,
 * not covered by more specific errors like ToolExecutionError or LLMError.
 */
export class JobProcessingError extends CoreError {
  public readonly jobId?: string;
  public readonly agentRole?: string;

  constructor(message: string, jobId?: string, agentRole?: string) {
    super(message);
    this.jobId = jobId;
    this.agentRole = agentRole;
  }
}

/**
 * Error thrown when a requested resource or entity is not found.
 */
export class NotFoundError extends CoreError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(message: string, resourceType?: string, resourceId?: string) {
    super(message);
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Error thrown when input data fails validation.
 */
export class ValidationError extends CoreError {
  public readonly validationErrors?: Record<string, string[]>; // e.g., { fieldName: ['error message 1', 'error message 2'] }

  constructor(message: string, validationErrors?: Record<string, string[]>) {
    super(message);
    this.validationErrors = validationErrors;
  }
}
