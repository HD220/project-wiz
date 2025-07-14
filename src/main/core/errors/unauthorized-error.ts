import { DomainError } from "./domain-error";

/**
 * Error codes for unauthorized errors
 */
export enum UnauthorizedErrorCode {
  AUTHENTICATION_REQUIRED = "UNAUTHORIZED_001",
  INVALID_CREDENTIALS = "UNAUTHORIZED_002",
  TOKEN_EXPIRED = "UNAUTHORIZED_003",
  TOKEN_INVALID = "UNAUTHORIZED_004",
  INSUFFICIENT_PERMISSIONS = "UNAUTHORIZED_005",
  ROLE_REQUIRED = "UNAUTHORIZED_006",
  RESOURCE_ACCESS_DENIED = "UNAUTHORIZED_007",
  OPERATION_NOT_ALLOWED = "UNAUTHORIZED_008",
  SESSION_EXPIRED = "UNAUTHORIZED_009",
  ACCOUNT_DISABLED = "UNAUTHORIZED_010",
}

/**
 * Represents information about the authorization context
 */
export interface AuthorizationInfo {
  /** User ID if available */
  userId?: string | number;
  /** Required permission or role */
  requiredPermission?: string;
  /** Current user roles */
  currentRoles?: string[];
  /** Resource being accessed */
  resource?: string;
  /** Operation being performed */
  operation?: string;
  /** Authentication method used */
  authMethod?: string;
  /** Additional context about the authorization */
  context?: Record<string, unknown>;
}

/**
 * Error thrown when authorization fails
 */
export class UnauthorizedError extends DomainError {
  /** Information about the authorization context */
  public readonly authorizationInfo: AuthorizationInfo;

  /**
   * Creates a new UnauthorizedError instance
   * @param code - Unauthorized error code
   * @param message - Error message
   * @param authorizationInfo - Information about the authorization context
   * @param details - Additional error details
   * @param originalError - Original error if this is a wrapped error
   */
  constructor(
    code: UnauthorizedErrorCode,
    message: string,
    authorizationInfo: AuthorizationInfo = {},
    details?: Record<string, unknown>,
    originalError?: Error,
  ) {
    super(code, message, details, originalError);

    this.authorizationInfo = authorizationInfo;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  /**
   * Gets error severity level
   * @returns Always returns 'warning' for unauthorized errors
   */
  public getSeverity(): "warning" {
    return "warning";
  }

  /**
   * Gets error category for classification
   * @returns Always returns 'authorization'
   */
  public getCategory(): string {
    return "authorization";
  }

  /**
   * Checks if this error is retryable
   * @returns Returns true for some unauthorized types, false for others
   */
  public isRetryable(): boolean {
    switch (this.code) {
      case UnauthorizedErrorCode.TOKEN_EXPIRED:
      case UnauthorizedErrorCode.SESSION_EXPIRED:
        return true;
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
      case UnauthorizedErrorCode.AUTHENTICATION_REQUIRED:
        suggestions.push("Please log in to access this resource");
        suggestions.push("Provide valid authentication credentials");
        break;
      case UnauthorizedErrorCode.INVALID_CREDENTIALS:
        suggestions.push("Check your username and password");
        suggestions.push("Verify your credentials are correct");
        break;
      case UnauthorizedErrorCode.TOKEN_EXPIRED:
        suggestions.push("Your session has expired, please log in again");
        suggestions.push("Refresh your authentication token");
        break;
      case UnauthorizedErrorCode.TOKEN_INVALID:
        suggestions.push("Your session is invalid, please log in again");
        suggestions.push("Obtain a new authentication token");
        break;
      case UnauthorizedErrorCode.INSUFFICIENT_PERMISSIONS:
        suggestions.push("You don't have permission to perform this action");
        suggestions.push("Contact an administrator to request access");
        break;
      case UnauthorizedErrorCode.ROLE_REQUIRED:
        suggestions.push("This action requires a specific role");
        suggestions.push(
          "Contact an administrator to assign the required role",
        );
        break;
      case UnauthorizedErrorCode.RESOURCE_ACCESS_DENIED:
        suggestions.push("You don't have access to this resource");
        suggestions.push("Request access from the resource owner");
        break;
      case UnauthorizedErrorCode.OPERATION_NOT_ALLOWED:
        suggestions.push("This operation is not allowed");
        suggestions.push("Check if you have the required permissions");
        break;
      case UnauthorizedErrorCode.SESSION_EXPIRED:
        suggestions.push("Your session has expired, please log in again");
        suggestions.push("Start a new session");
        break;
      case UnauthorizedErrorCode.ACCOUNT_DISABLED:
        suggestions.push("Your account has been disabled");
        suggestions.push("Contact an administrator to reactivate your account");
        break;
      default:
        suggestions.push("Please log in and try again");
    }

    if (this.authorizationInfo.resource) {
      suggestions.push(`Resource: ${this.authorizationInfo.resource}`);
    }

    if (this.authorizationInfo.operation) {
      suggestions.push(`Operation: ${this.authorizationInfo.operation}`);
    }

    if (this.authorizationInfo.requiredPermission) {
      suggestions.push(
        `Required permission: ${this.authorizationInfo.requiredPermission}`,
      );
    }

    return suggestions;
  }

  /**
   * Converts error to JSON representation including authorization information
   * @returns JSON representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      authorizationInfo: {
        ...this.authorizationInfo,
        // Don't include sensitive information in JSON
        userId: this.authorizationInfo.userId ? "[REDACTED]" : undefined,
      },
    };
  }

  /**
   * Creates an UnauthorizedError for authentication required
   * @param message - Custom message
   * @returns UnauthorizedError instance
   */
  public static authenticationRequired(message?: string): UnauthorizedError {
    return new UnauthorizedError(
      UnauthorizedErrorCode.AUTHENTICATION_REQUIRED,
      message || "Authentication is required to access this resource",
    );
  }

  /**
   * Creates an UnauthorizedError for invalid credentials
   * @param authMethod - Authentication method used
   * @param message - Custom message
   * @returns UnauthorizedError instance
   */
  public static invalidCredentials(
    authMethod?: string,
    message?: string,
  ): UnauthorizedError {
    return new UnauthorizedError(
      UnauthorizedErrorCode.INVALID_CREDENTIALS,
      message || "Invalid credentials provided",
      { authMethod },
    );
  }

  /**
   * Creates an UnauthorizedError for expired token
   * @param message - Custom message
   * @returns UnauthorizedError instance
   */
  public static tokenExpired(message?: string): UnauthorizedError {
    return new UnauthorizedError(
      UnauthorizedErrorCode.TOKEN_EXPIRED,
      message || "Authentication token has expired",
    );
  }

  /**
   * Creates an UnauthorizedError for invalid token
   * @param message - Custom message
   * @returns UnauthorizedError instance
   */
  public static tokenInvalid(message?: string): UnauthorizedError {
    return new UnauthorizedError(
      UnauthorizedErrorCode.TOKEN_INVALID,
      message || "Authentication token is invalid",
    );
  }

  /**
   * Creates an UnauthorizedError for insufficient permissions
   * @param userId - User ID
   * @param requiredPermission - Required permission
   * @param currentRoles - Current user roles
   * @param message - Custom message
   * @returns UnauthorizedError instance
   */
  public static insufficientPermissions(
    userId: string | number,
    requiredPermission: string,
    currentRoles?: string[],
    message?: string,
  ): UnauthorizedError {
    return new UnauthorizedError(
      UnauthorizedErrorCode.INSUFFICIENT_PERMISSIONS,
      message || `Insufficient permissions: '${requiredPermission}' required`,
      { userId, requiredPermission, currentRoles },
    );
  }

  /**
   * Creates an UnauthorizedError for resource access denied
   * @param userId - User ID
   * @param resource - Resource being accessed
   * @param operation - Operation being performed
   * @param message - Custom message
   * @returns UnauthorizedError instance
   */
  public static resourceAccessDenied(
    userId: string | number,
    resource: string,
    operation?: string,
    message?: string,
  ): UnauthorizedError {
    return new UnauthorizedError(
      UnauthorizedErrorCode.RESOURCE_ACCESS_DENIED,
      message || `Access denied to resource '${resource}'`,
      { userId, resource, operation },
    );
  }

  /**
   * Creates an UnauthorizedError for role required
   * @param userId - User ID
   * @param requiredRole - Required role
   * @param currentRoles - Current user roles
   * @param message - Custom message
   * @returns UnauthorizedError instance
   */
  public static roleRequired(
    userId: string | number,
    requiredRole: string,
    currentRoles?: string[],
    message?: string,
  ): UnauthorizedError {
    return new UnauthorizedError(
      UnauthorizedErrorCode.ROLE_REQUIRED,
      message || `Role '${requiredRole}' is required`,
      { userId, requiredPermission: requiredRole, currentRoles },
    );
  }

  /**
   * Creates an UnauthorizedError for disabled account
   * @param userId - User ID
   * @param message - Custom message
   * @returns UnauthorizedError instance
   */
  public static accountDisabled(
    userId: string | number,
    message?: string,
  ): UnauthorizedError {
    return new UnauthorizedError(
      UnauthorizedErrorCode.ACCOUNT_DISABLED,
      message || "Account has been disabled",
      { userId },
    );
  }
}
