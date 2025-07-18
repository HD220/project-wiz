import { BaseError } from "./base.error";
import { ValidationFactory } from "./validation/validation-factory";
import { ValidationFormatter } from "./validation/validation-formatter";
import { ValidationIssue } from "./validation/validation-issue";

export { ValidationIssue } from "./validation/validation-issue";

export class ValidationError extends BaseError {
  public readonly issues: ValidationIssue[];

  constructor(message: string, issues: ValidationIssue[] = [], code?: string) {
    super(message, "ValidationError", {
      code: code || "VALIDATION_FAILED",
      context: { issuesCount: issues.length },
    });
    this.issues = issues;
  }

  static singleField = ValidationFactory.singleField;
  static multipleFields = ValidationFactory.multipleFields;
  static requiredField = ValidationFactory.requiredField;
  static invalidFormat = ValidationFactory.invalidFormat;

  getUserMessage(): string {
    return ValidationFormatter.getUserMessage(this.issues);
  }

  getFormattedIssues(): Record<string, string[]> {
    return ValidationFormatter.getFormattedIssues(this.issues);
  }
}
