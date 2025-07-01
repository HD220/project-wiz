/**
 * @class ApplicationError
 * @description Base class for application-specific errors.
 * Helps in distinguishing errors originating from the application layer
 * from domain errors or infrastructure errors.
 */
export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // This is important for proper prototype chain in environments like Node.js
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * @class ServiceNotFoundError
 * @description Specific error for when a required service is not found or registered.
 */
export class ServiceNotFoundError extends ApplicationError {
  constructor(serviceName: string) {
    super(`Service '${serviceName}' not found or not registered.`);
    this.name = this.constructor.name;
  }
}

/**
 * @class ValidationError
 * @description Specific error for data validation failures at the application layer (e.g., invalid input to a use case).
 */
export class ApplicationValidationError extends ApplicationError {
  constructor(message: string, public details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
  }
}
