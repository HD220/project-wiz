export class CoreError extends Error {
  public readonly code?: string;
  public readonly details?: any;
  public readonly cause?: Error;

  constructor(message: string, code?: string, details?: any, cause?: Error) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.cause = cause;
    Object.setPrototypeOf(this, CoreError.prototype);
  }
}

export class ValueError extends CoreError {
  constructor(message: string, details?: any, cause?: Error) {
    super(message, 'VALUE_ERROR', details, cause);
    this.name = 'ValueError';
    Object.setPrototypeOf(this, ValueError.prototype);
  }
}

export class EntityError extends CoreError {
  constructor(message: string, details?: any, cause?: Error) {
    super(message, 'ENTITY_ERROR', details, cause);
    this.name = 'EntityError';
    Object.setPrototypeOf(this, EntityError.prototype);
  }
}

export class DomainError extends CoreError {
  constructor(message: string, details?: any, cause?: Error) {
    super(message, 'DOMAIN_ERROR', details, cause);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

export class ApplicationError extends CoreError {
  constructor(message: string, code?: string, details?: any, cause?: Error) {
    super(message, code || 'APPLICATION_ERROR', details, cause);
    this.name = 'ApplicationError';
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, details?: any, cause?: Error) {
    super(message, 'NOT_FOUND_ERROR', details, cause);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}