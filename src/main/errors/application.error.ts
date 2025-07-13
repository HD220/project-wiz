import { BaseError, ErrorMetadata } from './base.error';

export class ApplicationError extends BaseError {
  constructor(message: string, code?: string, context?: Record<string, any>) {
    super(message, 'ApplicationError', {
      code,
      context,
    });
  }

  static serviceUnavailable(serviceName: string, details?: Record<string, any>): ApplicationError {
    return new ApplicationError(
      `Service ${serviceName} is currently unavailable`,
      'SERVICE_UNAVAILABLE',
      { serviceName, ...details }
    );
  }

  static configurationError(configKey: string, details?: Record<string, any>): ApplicationError {
    return new ApplicationError(
      `Configuration error for key: ${configKey}`,
      'CONFIGURATION_ERROR',
      { configKey, ...details }
    );
  }

  static operationFailed(operation: string, reason?: string): ApplicationError {
    return new ApplicationError(
      `Operation '${operation}' failed${reason ? `: ${reason}` : ''}`,
      'OPERATION_FAILED',
      { operation, reason }
    );
  }
}
