import { DomainError } from "./domain-error";

/**
 * Error codes for validation errors
 */
export enum ValidationErrorCode {
  REQUIRED_FIELD = "VALIDATION_001",
  INVALID_FORMAT = "VALIDATION_002",
  INVALID_LENGTH = "VALIDATION_003",
  INVALID_VALUE = "VALIDATION_004",
  INVALID_TYPE = "VALIDATION_005",
  DUPLICATE_VALUE = "VALIDATION_006",
  INVALID_RANGE = "VALIDATION_007",
  INVALID_PATTERN = "VALIDATION_008",
  MISSING_DEPENDENCY = "VALIDATION_009",
  INVALID_RELATIONSHIP = "VALIDATION_010",
}

/**
 * Represents field validation information
 */
export interface ValidationFieldInfo {
  /** Field name that failed validation */
  field: string;
  /** Value that failed validation */
  value?: unknown;
  /** Validation rule that failed */
  rule: string;
  /** Expected value or format */
  expected?: unknown;
  /** Custom validation message */
  message?: string;
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends DomainError {
  /** Fields that failed validation */
  public readonly fields: ValidationFieldInfo[];

  /**
   * Creates a new ValidationError instance
   * @param code - Validation error code
   * @param message - Error message
   * @param fields - Fields that failed validation
   * @param details - Additional error details
   * @param originalError - Original error if this is a wrapped error
   */
  constructor(
    code: ValidationErrorCode,
    message: string,
    fields: ValidationFieldInfo[] = [],
    details?: Record<string, unknown>,
    originalError?: Error,
  ) {
    super(code, message, details, originalError);

    this.fields = fields;

    // Set the prototype explicitly
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Gets error severity level
   * @returns Always returns 'warning' for validation errors
   */
  public getSeverity(): "warning" {
    return "warning";
  }

  /**
   * Gets error category for classification
   * @returns Always returns 'validation'
   */
  public getCategory(): string {
    return "validation";
  }

  /**
   * Checks if this error is retryable
   * @returns Always returns true for validation errors
   */
  public isRetryable(): boolean {
    return true;
  }

  /**
   * Gets recovery suggestions for the error
   * @returns Array of recovery suggestions
   */
  public getRecoverySuggestions(): string[] {
    const suggestions: string[] = [];

    switch (this.code) {
      case ValidationErrorCode.REQUIRED_FIELD:
        suggestions.push("Provide a value for all required fields");
        break;
      case ValidationErrorCode.INVALID_FORMAT:
        suggestions.push("Check the format of the input data");
        break;
      case ValidationErrorCode.INVALID_LENGTH:
        suggestions.push("Check the length constraints of the input");
        break;
      case ValidationErrorCode.INVALID_VALUE:
        suggestions.push("Provide a valid value");
        break;
      case ValidationErrorCode.INVALID_TYPE:
        suggestions.push("Provide a value of the correct type");
        break;
      case ValidationErrorCode.DUPLICATE_VALUE:
        suggestions.push("Provide a unique value");
        break;
      case ValidationErrorCode.INVALID_RANGE:
        suggestions.push("Provide a value within the valid range");
        break;
      case ValidationErrorCode.INVALID_PATTERN:
        suggestions.push("Provide a value that matches the required pattern");
        break;
      case ValidationErrorCode.MISSING_DEPENDENCY:
        suggestions.push("Ensure all required dependencies are provided");
        break;
      case ValidationErrorCode.INVALID_RELATIONSHIP:
        suggestions.push("Check the relationship between related fields");
        break;
      default:
        suggestions.push("Review the validation requirements");
    }

    if (this.fields.length > 0) {
      suggestions.push(
        `Check the following fields: ${this.fields.map((f) => f.field).join(", ")}`,
      );
    }

    return suggestions;
  }

  /**
   * Converts error to JSON representation including field information
   * @returns JSON representation of the error
   */
  public toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }

  /**
   * Creates a ValidationError for a required field
   * @param field - Field name
   * @param message - Custom message
   * @returns ValidationError instance
   */
  public static requiredField(
    field: string,
    message?: string,
  ): ValidationError {
    return new ValidationError(
      ValidationErrorCode.REQUIRED_FIELD,
      message || `Field '${field}' is required`,
      [{ field, rule: "required" }],
    );
  }

  /**
   * Creates a ValidationError for invalid format
   * @param field - Field name
   * @param value - Invalid value
   * @param expected - Expected format
   * @param message - Custom message
   * @returns ValidationError instance
   */
  public static invalidFormat(
    field: string,
    value: unknown,
    expected?: unknown,
    message?: string,
  ): ValidationError {
    return new ValidationError(
      ValidationErrorCode.INVALID_FORMAT,
      message || `Field '${field}' has invalid format`,
      [{ field, value, expected, rule: "format" }],
    );
  }

  /**
   * Creates a ValidationError for invalid length
   * @param field - Field name
   * @param value - Invalid value
   * @param expected - Expected length constraint
   * @param message - Custom message
   * @returns ValidationError instance
   */
  public static invalidLength(
    field: string,
    value: unknown,
    expected?: unknown,
    message?: string,
  ): ValidationError {
    return new ValidationError(
      ValidationErrorCode.INVALID_LENGTH,
      message || `Field '${field}' has invalid length`,
      [{ field, value, expected, rule: "length" }],
    );
  }

  /**
   * Creates a ValidationError for multiple field validation failures
   * @param fields - Array of field validation information
   * @param message - Custom message
   * @returns ValidationError instance
   */
  public static multipleFields(
    fields: ValidationFieldInfo[],
    message?: string,
  ): ValidationError {
    return new ValidationError(
      ValidationErrorCode.INVALID_VALUE,
      message || `Multiple fields failed validation`,
      fields,
    );
  }
}
