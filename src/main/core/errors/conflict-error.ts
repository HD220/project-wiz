import { DomainError } from "./domain-error";

/**
 * Error codes for conflict errors
 */
export enum ConflictErrorCode {
  RESOURCE_CONFLICT = "CONFLICT_001",
  DUPLICATE_RESOURCE = "CONFLICT_002",
  CONCURRENT_MODIFICATION = "CONFLICT_003",
  STATE_CONFLICT = "CONFLICT_004",
  BUSINESS_RULE_CONFLICT = "CONFLICT_005",
  DEPENDENCY_CONFLICT = "CONFLICT_006",
  VERSION_CONFLICT = "CONFLICT_007",
  LOCK_CONFLICT = "CONFLICT_008",
  UNIQUE_CONSTRAINT_VIOLATION = "CONFLICT_009",
  REFERENTIAL_INTEGRITY_VIOLATION = "CONFLICT_010",
}

/**
 * Represents information about the conflict
 */
export interface ConflictInfo {
  /** Type of conflict */
  conflictType: string;
  /** Resource that caused the conflict */
  resource: string;
  /** Conflicting value */
  conflictingValue?: unknown;
  /** Expected value */
  expectedValue?: unknown;
  /** Field that caused the conflict */
  field?: string;
  /** Additional context about the conflict */
  context?: Record<string, unknown>;
}

/**
 * Error thrown when a conflict occurs (e.g., duplicate resource, concurrent modification)
 */
export class ConflictError extends DomainError {
  /** Information about the conflict */
  public readonly conflictInfo: ConflictInfo;

  /**
   * Creates a new ConflictError instance
   * @param code - Conflict error code
   * @param message - Error message
   * @param conflictInfo - Information about the conflict
   * @param details - Additional error details
   * @param originalError - Original error if this is a wrapped error
   */
  constructor(
    code: ConflictErrorCode,
    message: string,
    conflictInfo: ConflictInfo,
    details?: Record<string, unknown>,
    originalError?: Error,
  ) {
    super(code, message, details, originalError);

    this.conflictInfo = conflictInfo;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  /**
   * Gets error severity level
   * @returns Always returns 'warning' for conflict errors
   */
  public getSeverity(): "warning" {
    return "warning";
  }

  /**
   * Gets error category for classification
   * @returns Always returns 'conflict'
   */
  public getCategory(): string {
    return "conflict";
  }

  /**
   * Checks if this error is retryable
   * @returns Returns true for some conflict types, false for others
   */
  public isRetryable(): boolean {
    switch (this.code) {
      case ConflictErrorCode.CONCURRENT_MODIFICATION:
      case ConflictErrorCode.LOCK_CONFLICT:
      case ConflictErrorCode.VERSION_CONFLICT:
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
      case ConflictErrorCode.RESOURCE_CONFLICT:
        suggestions.push("Resolve the resource conflict");
        suggestions.push("Check if the resource is in use");
        break;
      case ConflictErrorCode.DUPLICATE_RESOURCE:
        suggestions.push("Use a unique identifier");
        suggestions.push("Check if the resource already exists");
        break;
      case ConflictErrorCode.CONCURRENT_MODIFICATION:
        suggestions.push("Refresh the resource and try again");
        suggestions.push("Check for concurrent modifications");
        break;
      case ConflictErrorCode.STATE_CONFLICT:
        suggestions.push("Verify the resource state");
        suggestions.push("Ensure the operation is valid for the current state");
        break;
      case ConflictErrorCode.BUSINESS_RULE_CONFLICT:
        suggestions.push("Check business rule violations");
        suggestions.push("Verify the operation is allowed");
        break;
      case ConflictErrorCode.DEPENDENCY_CONFLICT:
        suggestions.push("Resolve dependency conflicts");
        suggestions.push("Check for circular dependencies");
        break;
      case ConflictErrorCode.VERSION_CONFLICT:
        suggestions.push("Update to the latest version");
        suggestions.push("Resolve version conflicts");
        break;
      case ConflictErrorCode.LOCK_CONFLICT:
        suggestions.push("Wait for the lock to be released");
        suggestions.push("Try the operation again later");
        break;
      case ConflictErrorCode.UNIQUE_CONSTRAINT_VIOLATION:
        suggestions.push("Use a unique value");
        suggestions.push("Check for duplicate values");
        break;
      case ConflictErrorCode.REFERENTIAL_INTEGRITY_VIOLATION:
        suggestions.push("Ensure referenced resources exist");
        suggestions.push("Check referential integrity constraints");
        break;
      default:
        suggestions.push("Resolve the conflict");
    }

    suggestions.push(`Conflict type: ${this.conflictInfo.conflictType}`);
    suggestions.push(`Resource: ${this.conflictInfo.resource}`);

    if (this.conflictInfo.field) {
      suggestions.push(`Field: ${this.conflictInfo.field}`);
    }

    return suggestions;
  }

  /**
   * Converts error to JSON representation including conflict information
   * @returns JSON representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      conflictInfo: this.conflictInfo,
    };
  }

  /**
   * Creates a ConflictError for a duplicate resource
   * @param resource - Resource type
   * @param field - Field that caused the duplication
   * @param value - Duplicate value
   * @param message - Custom message
   * @returns ConflictError instance
   */
  public static duplicate(
    resource: string,
    field: string,
    value: unknown,
    message?: string,
  ): ConflictError {
    return new ConflictError(
      ConflictErrorCode.DUPLICATE_RESOURCE,
      message || `Duplicate ${resource}: ${field} '${value}' already exists`,
      {
        conflictType: "duplicate",
        resource,
        field,
        conflictingValue: value,
      },
    );
  }

  /**
   * Creates a ConflictError for concurrent modification
   * @param resource - Resource type
   * @param id - Resource ID
   * @param message - Custom message
   * @returns ConflictError instance
   */
  public static concurrentModification(
    resource: string,
    id: string | number,
    message?: string,
  ): ConflictError {
    return new ConflictError(
      ConflictErrorCode.CONCURRENT_MODIFICATION,
      message || `Concurrent modification detected for ${resource} '${id}'`,
      {
        conflictType: "concurrent_modification",
        resource,
        context: { id },
      },
    );
  }

  /**
   * Creates a ConflictError for state conflicts
   * @param resource - Resource type
   * @param currentState - Current state
   * @param expectedState - Expected state
   * @param message - Custom message
   * @returns ConflictError instance
   */
  public static stateConflict(
    resource: string,
    currentState: string,
    expectedState: string,
    message?: string,
  ): ConflictError {
    return new ConflictError(
      ConflictErrorCode.STATE_CONFLICT,
      message ||
        `State conflict for ${resource}: current '${currentState}', expected '${expectedState}'`,
      {
        conflictType: "state_conflict",
        resource,
        conflictingValue: currentState,
        expectedValue: expectedState,
      },
    );
  }

  /**
   * Creates a ConflictError for business rule violations
   * @param resource - Resource type
   * @param rule - Business rule that was violated
   * @param message - Custom message
   * @returns ConflictError instance
   */
  public static businessRule(
    resource: string,
    rule: string,
    message?: string,
  ): ConflictError {
    return new ConflictError(
      ConflictErrorCode.BUSINESS_RULE_CONFLICT,
      message || `Business rule violation for ${resource}: ${rule}`,
      {
        conflictType: "business_rule",
        resource,
        context: { rule },
      },
    );
  }

  /**
   * Creates a ConflictError for version conflicts
   * @param resource - Resource type
   * @param currentVersion - Current version
   * @param expectedVersion - Expected version
   * @param message - Custom message
   * @returns ConflictError instance
   */
  public static versionConflict(
    resource: string,
    currentVersion: string | number,
    expectedVersion: string | number,
    message?: string,
  ): ConflictError {
    return new ConflictError(
      ConflictErrorCode.VERSION_CONFLICT,
      message ||
        `Version conflict for ${resource}: current '${currentVersion}', expected '${expectedVersion}'`,
      {
        conflictType: "version_conflict",
        resource,
        conflictingValue: currentVersion,
        expectedValue: expectedVersion,
      },
    );
  }

  /**
   * Creates a ConflictError for unique constraint violations
   * @param resource - Resource type
   * @param field - Field that violated the constraint
   * @param value - Value that violated the constraint
   * @param message - Custom message
   * @returns ConflictError instance
   */
  public static uniqueConstraint(
    resource: string,
    field: string,
    value: unknown,
    message?: string,
  ): ConflictError {
    return new ConflictError(
      ConflictErrorCode.UNIQUE_CONSTRAINT_VIOLATION,
      message ||
        `Unique constraint violation for ${resource}.${field}: '${value}' already exists`,
      {
        conflictType: "unique_constraint",
        resource,
        field,
        conflictingValue: value,
      },
    );
  }
}
