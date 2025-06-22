// src_refactored/core/common/errors.ts

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
