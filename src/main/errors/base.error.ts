export type ErrorContext = Record<
  string,
  string | number | boolean | null | undefined
>;

export interface ErrorMetadata {
  code?: string;
  context?: ErrorContext;
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
  toJSON(): {
    name: string;
    message: string;
    timestamp: string;
    metadata: ErrorMetadata;
    stack?: string;
  } {
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
