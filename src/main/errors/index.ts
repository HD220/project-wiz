// Central export for all error classes
export { BaseError, type ErrorMetadata } from './base.error';
export { ApplicationError } from './application.error';
export { DomainError } from './domain.error';
export { NotFoundError } from './not-found.error';
export { ValidationError, type ValidationIssue } from './validation.error';

// Error handling utilities
export class ErrorHandler {
  /**
   * Determines if an error is a known application error
   */
  static isApplicationError(error: unknown): error is BaseError {
    return error instanceof BaseError;
  }

  /**
   * Extracts user-safe message from any error
   */
  static getUserMessage(error: unknown): string {
    if (error instanceof BaseError) {
      return error.getUserMessage();
    }
    
    if (error instanceof Error) {
      return 'An unexpected error occurred. Please try again.';
    }
    
    return 'An unknown error occurred.';
  }

  /**
   * Logs error with appropriate level based on error type
   */
  static logError(error: unknown, logger: any): void {
    if (error instanceof ValidationError) {
      logger.warn('Validation error:', error.toJSON());
    } else if (error instanceof NotFoundError) {
      logger.info('Resource not found:', error.toJSON());
    } else if (error instanceof BaseError) {
      logger.error('Application error:', error.toJSON());
    } else {
      logger.error('Unexpected error:', error);
    }
  }

  /**
   * Creates a safe error response for APIs/IPC
   */
  static toSafeResponse(error: unknown): {
    success: false;
    error: {
      name: string;
      message: string;
      code?: string;
      issues?: any;
    };
  } {
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: {
          name: error.name,
          message: error.getUserMessage(),
          code: error.metadata.code,
          issues: error.getFormattedIssues(),
        },
      };
    }

    if (error instanceof BaseError) {
      return {
        success: false,
        error: {
          name: error.name,
          message: error.getUserMessage(),
          code: error.metadata.code,
        },
      };
    }

    return {
      success: false,
      error: {
        name: 'UnknownError',
        message: 'An unexpected error occurred.',
      },
    };
  }
}