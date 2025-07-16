import { BaseError } from "./base.error";
import { ErrorMetadata } from "./error-metadata.interface";

export class ApplicationError extends BaseError {
  constructor(message: string, code?: string, context?: ErrorMetadata) {
    super(message, "ApplicationError", {
      code,
      context,
    });
  }

  static serviceUnavailable(
    serviceName: string,
    details?: ErrorMetadata,
  ): ApplicationError {
    return new ApplicationError(
      `Service ${serviceName} is currently unavailable`,
      "SERVICE_UNAVAILABLE",
      { serviceName, ...details },
    );
  }

  static configurationError(
    configKey: string,
    details?: ErrorMetadata,
  ): ApplicationError {
    return new ApplicationError(
      `Configuration error for key: ${configKey}`,
      "CONFIGURATION_ERROR",
      { configKey, ...details },
    );
  }

  static operationFailed(operation: string, reason?: string): ApplicationError {
    return new ApplicationError(
      `Operation '${operation}' failed${reason ? `: ${reason}` : ""}`,
      "OPERATION_FAILED",
      { operation, reason },
    );
  }
}
