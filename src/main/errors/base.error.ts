export interface ErrorMetadata {
  code?: string;
  context?: Record<string, any>;
  timestamp?: Date;
  stack?: string;
}

export abstract class BaseError extends Error {
  public readonly timestamp: Date;
  public readonly metadata: ErrorMetadata;

  constructor(
    message: string,
    public readonly name: string = "BaseError",
    metadata: ErrorMetadata = {},
  ) {
    super(message);
    this.timestamp = metadata.timestamp || new Date();
    this.metadata = {
      ...metadata,
      timestamp: this.timestamp,
    };

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace if available
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Serializable error for logging and API responses
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      timestamp: this.timestamp.toISOString(),
      metadata: this.metadata,
      stack: this.stack,
    };
  }

  // Get user-friendly message
  getUserMessage(): string {
    return this.message;
  }
}
