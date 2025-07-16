import { ErrorContext } from "./error-context.type";

export interface ErrorMetadata {
  code?: string;
  context?: ErrorContext;
  timestamp?: Date;
  stack?: string;
}
