import { DomainError } from "./domain-error";

/**
 * Error codes for internal errors
 */
export enum InternalErrorCode {
  SYSTEM_ERROR = "INTERNAL_001",
  DATABASE_ERROR = "INTERNAL_002",
  NETWORK_ERROR = "INTERNAL_003",
  FILE_SYSTEM_ERROR = "INTERNAL_004",
  CONFIGURATION_ERROR = "INTERNAL_005",
  DEPENDENCY_ERROR = "INTERNAL_006",
  TIMEOUT_ERROR = "INTERNAL_007",
  MEMORY_ERROR = "INTERNAL_008",
  SERIALIZATION_ERROR = "INTERNAL_009",
  EXTERNAL_SERVICE_ERROR = "INTERNAL_010",
}

/**
 * Represents technical information about the internal error
 */
export interface InternalErrorInfo {
  /** Component that caused the error */
  component: string;
  /** Operation that was being performed */
  operation?: string;
  /** Error source (e.g., database, network, file system) */
  source?: string;
  /** Error code from the underlying system */
  systemErrorCode?: string | number;
  /** Request ID for tracing */
  requestId?: string;
  /** Session ID for tracing */
  sessionId?: string;
  /** Additional technical context */
  context?: Record<string, unknown>;
}

/**
 * Error thrown when an internal system error occurs
 */
export class InternalError extends DomainError {
  /** Technical information about the error */
  public readonly internalInfo: InternalErrorInfo;

  /**
   * Creates a new InternalError instance
   * @param code - Internal error code
   * @param message - Error message
   * @param internalInfo - Technical information about the error
   * @param details - Additional error details
   * @param originalError - Original error if this is a wrapped error
   */
  constructor(
    code: InternalErrorCode,
    message: string,
    internalInfo: InternalErrorInfo,
    details?: Record<string, unknown>,
    originalError?: Error,
  ) {
    super(code, message, details, originalError);

    this.internalInfo = internalInfo;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, InternalError.prototype);
  }

  /**
   * Gets error severity level
   * @returns Always returns 'error' for internal errors
   */
  public getSeverity(): "error" {
    return "error";
  }

  /**
   * Gets error category for classification
   * @returns Always returns 'internal'
   */
  public getCategory(): string {
    return "internal";
  }

  /**
   * Checks if this error is retryable
   * @returns Returns true for some internal error types, false for others
   */
  public isRetryable(): boolean {
    switch (this.code) {
      case InternalErrorCode.NETWORK_ERROR:
      case InternalErrorCode.TIMEOUT_ERROR:
      case InternalErrorCode.EXTERNAL_SERVICE_ERROR:
        return true;
      case InternalErrorCode.CONFIGURATION_ERROR:
      case InternalErrorCode.DEPENDENCY_ERROR:
      case InternalErrorCode.SERIALIZATION_ERROR:
        return false;
      default:
        return false;
    }
  }

  /**
   * Gets recovery suggestions for the error
   * @returns Array of recovery suggestions
   */
  public getRecoverySuggestions(): string[] {
    const suggestions: string[] = [];

    switch (this.code) {
      case InternalErrorCode.SYSTEM_ERROR:
        suggestions.push("Check system logs for more details");
        suggestions.push("Contact system administrator");
        break;
      case InternalErrorCode.DATABASE_ERROR:
        suggestions.push("Check database connection");
        suggestions.push("Verify database configuration");
        break;
      case InternalErrorCode.NETWORK_ERROR:
        suggestions.push("Check network connectivity");
        suggestions.push("Verify network configuration");
        suggestions.push("Try again later");
        break;
      case InternalErrorCode.FILE_SYSTEM_ERROR:
        suggestions.push("Check file permissions");
        suggestions.push("Verify disk space");
        suggestions.push("Check file path");
        break;
      case InternalErrorCode.CONFIGURATION_ERROR:
        suggestions.push("Check configuration settings");
        suggestions.push("Verify configuration file");
        break;
      case InternalErrorCode.DEPENDENCY_ERROR:
        suggestions.push("Check dependency availability");
        suggestions.push("Verify dependency configuration");
        break;
      case InternalErrorCode.TIMEOUT_ERROR:
        suggestions.push("Try again later");
        suggestions.push("Check timeout settings");
        break;
      case InternalErrorCode.MEMORY_ERROR:
        suggestions.push("Check available memory");
        suggestions.push("Restart the application");
        break;
      case InternalErrorCode.SERIALIZATION_ERROR:
        suggestions.push("Check data format");
        suggestions.push("Verify serialization configuration");
        break;
      case InternalErrorCode.EXTERNAL_SERVICE_ERROR:
        suggestions.push("Check external service status");
        suggestions.push("Try again later");
        break;
      default:
        suggestions.push("Contact technical support");
    }

    suggestions.push(`Component: ${this.internalInfo.component}`);

    if (this.internalInfo.operation) {
      suggestions.push(`Operation: ${this.internalInfo.operation}`);
    }

    if (this.internalInfo.source) {
      suggestions.push(`Source: ${this.internalInfo.source}`);
    }

    if (this.internalInfo.requestId) {
      suggestions.push(`Request ID: ${this.internalInfo.requestId}`);
    }

    return suggestions;
  }

  /**
   * Converts error to JSON representation including internal information
   * @returns JSON representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      internalInfo: this.internalInfo,
    };
  }

  /**
   * Creates an InternalError for system errors
   * @param component - Component that caused the error
   * @param operation - Operation that was being performed
   * @param originalError - Original error
   * @param message - Custom message
   * @returns InternalError instance
   */
  public static system(
    component: string,
    operation?: string,
    originalError?: Error,
    message?: string,
  ): InternalError {
    return new InternalError(
      InternalErrorCode.SYSTEM_ERROR,
      message || "An internal system error occurred",
      { component, operation },
      undefined,
      originalError,
    );
  }

  /**
   * Creates an InternalError for database errors
   * @param component - Component that caused the error
   * @param operation - Database operation that failed
   * @param originalError - Original database error
   * @param message - Custom message
   * @returns InternalError instance
   */
  public static database(
    component: string,
    operation?: string,
    originalError?: Error,
    message?: string,
  ): InternalError {
    return new InternalError(
      InternalErrorCode.DATABASE_ERROR,
      message || "A database error occurred",
      { component, operation, source: "database" },
      undefined,
      originalError,
    );
  }

  /**
   * Creates an InternalError for network errors
   * @param component - Component that caused the error
   * @param operation - Network operation that failed
   * @param originalError - Original network error
   * @param message - Custom message
   * @returns InternalError instance
   */
  public static network(
    component: string,
    operation?: string,
    originalError?: Error,
    message?: string,
  ): InternalError {
    return new InternalError(
      InternalErrorCode.NETWORK_ERROR,
      message || "A network error occurred",
      { component, operation, source: "network" },
      undefined,
      originalError,
    );
  }

  /**
   * Creates an InternalError for file system errors
   * @param component - Component that caused the error
   * @param operation - File system operation that failed
   * @param originalError - Original file system error
   * @param message - Custom message
   * @returns InternalError instance
   */
  public static fileSystem(
    component: string,
    operation?: string,
    originalError?: Error,
    message?: string,
  ): InternalError {
    return new InternalError(
      InternalErrorCode.FILE_SYSTEM_ERROR,
      message || "A file system error occurred",
      { component, operation, source: "file_system" },
      undefined,
      originalError,
    );
  }

  /**
   * Creates an InternalError for configuration errors
   * @param component - Component that caused the error
   * @param configKey - Configuration key that is invalid
   * @param message - Custom message
   * @returns InternalError instance
   */
  public static configuration(
    component: string,
    configKey?: string,
    message?: string,
  ): InternalError {
    return new InternalError(
      InternalErrorCode.CONFIGURATION_ERROR,
      message || "A configuration error occurred",
      {
        component,
        operation: "configuration",
        source: "configuration",
        context: { configKey },
      },
    );
  }

  /**
   * Creates an InternalError for timeout errors
   * @param component - Component that caused the error
   * @param operation - Operation that timed out
   * @param timeoutMs - Timeout duration in milliseconds
   * @param message - Custom message
   * @returns InternalError instance
   */
  public static timeout(
    component: string,
    operation?: string,
    timeoutMs?: number,
    message?: string,
  ): InternalError {
    return new InternalError(
      InternalErrorCode.TIMEOUT_ERROR,
      message || "Operation timed out",
      {
        component,
        operation,
        source: "timeout",
        context: { timeoutMs },
      },
    );
  }

  /**
   * Creates an InternalError for external service errors
   * @param component - Component that caused the error
   * @param serviceName - Name of the external service
   * @param operation - Operation that failed
   * @param originalError - Original service error
   * @param message - Custom message
   * @returns InternalError instance
   */
  public static externalService(
    component: string,
    serviceName: string,
    operation?: string,
    originalError?: Error,
    message?: string,
  ): InternalError {
    return new InternalError(
      InternalErrorCode.EXTERNAL_SERVICE_ERROR,
      message || `External service error: ${serviceName}`,
      {
        component,
        operation,
        source: "external_service",
        context: { serviceName },
      },
      undefined,
      originalError,
    );
  }

  /**
   * Creates an InternalError for dependency errors
   * @param component - Component that caused the error
   * @param dependency - Name of the missing dependency
   * @param message - Custom message
   * @returns InternalError instance
   */
  public static dependency(
    component: string,
    dependency: string,
    message?: string,
  ): InternalError {
    return new InternalError(
      InternalErrorCode.DEPENDENCY_ERROR,
      message || `Dependency error: ${dependency}`,
      {
        component,
        operation: "dependency_check",
        source: "dependency",
        context: { dependency },
      },
    );
  }
}
