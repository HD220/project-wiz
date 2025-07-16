import { ErrorMetadata } from "./error-metadata.interface";

export function serializeError(
  name: string,
  message: string,
  timestamp: Date,
  metadata: ErrorMetadata,
  stack?: string,
): {
  name: string;
  message: string;
  timestamp: string;
  metadata: ErrorMetadata;
  stack?: string;
} {
  return {
    name,
    message,
    timestamp: timestamp.toISOString(),
    metadata,
    stack,
  };
}
