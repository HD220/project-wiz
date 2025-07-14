import { BaseError } from "./base.error";

export interface ValidationIssue {
  field: string;
  message: string;
  value?: unknown;
  constraint?: string;
}

export class ValidationError extends BaseError {
  public readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[] = [], code?: string) {
    super(message, "ValidationError", {
      code: code || "VALIDATION_FAILED",
      context: { issuesCount: issues.length },
    });
    this.issues = issues;
  }

  static singleField(
    field: string,
    message: string,
    value?: unknown,
  ): ValidationError {
    const issue: ValidationIssue = { field, message, value };
    return new ValidationError(
      `Validation failed for field '${field}': ${message}`,
      [issue],
      "FIELD_VALIDATION_FAILED",
    );
  }

  static multipleFields(issues: ValidationIssue[]): ValidationError {
    const fieldNames = issues.map((i) => i.field).join(", ");
    return new ValidationError(
      `Validation failed for fields: ${fieldNames}`,
      issues,
      "MULTIPLE_FIELD_VALIDATION_FAILED",
    );
  }

  static requiredField(field: string): ValidationError {
    return ValidationError.singleField(field, "This field is required");
  }

  static invalidFormat(
    field: string,
    expectedFormat: string,
    value?: unknown,
  ): ValidationError {
    return ValidationError.singleField(
      field,
      `Invalid format. Expected: ${expectedFormat}`,
      value,
    );
  }

  getUserMessage(): string {
    if (this.issues.length === 1) {
      return `Please check the ${this.issues[0].field} field: ${this.issues[0].message}`;
    }
    return `Please check the following fields: ${this.issues.map((i) => i.field).join(", ")}`;
  }

  // Get validation issues as a formatted object for API responses
  getFormattedIssues(): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const issue of this.issues) {
      if (!formatted[issue.field]) {
        formatted[issue.field] = [];
      }
      formatted[issue.field].push(issue.message);
    }

    return formatted;
  }
}
