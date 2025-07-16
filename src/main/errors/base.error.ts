import type { ErrorConstructor } from "@/shared/types/constructor.types";

import { ErrorMetadata } from "./error-metadata.interface";
import { setupErrorPrototype } from "./error-prototype.helper";
import { serializeError } from "./error-serialization.helper";

export abstract class BaseError extends Error {
  timestamp: Date;
  metadata: ErrorMetadata;

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

    setupErrorPrototype(this, new.target as ErrorConstructor);
  }

  toJSON(): {
    name: string;
    message: string;
    timestamp: string;
    metadata: ErrorMetadata;
    stack?: string;
  } {
    return serializeError(
      this.name,
      this.message,
      this.timestamp,
      this.metadata,
      this.stack,
    );
  }

  getUserMessage(): string {
    return this.message;
  }
}
