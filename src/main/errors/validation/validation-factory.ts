import { ValidationError } from "../validation.error";

import { ValidationIssue } from "./validation-issue";

export class ValidationFactory {
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
    return ValidationFactory.singleField(field, "This field is required");
  }

  static invalidFormat(
    field: string,
    expectedFormat: string,
    value?: unknown,
  ): ValidationError {
    return ValidationFactory.singleField(
      field,
      `Invalid format. Expected: ${expectedFormat}`,
      value,
    );
  }
}
