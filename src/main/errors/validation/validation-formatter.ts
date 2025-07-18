import { ValidationIssue } from "./validation-issue";

export class ValidationFormatter {
  static getUserMessage(issues: ValidationIssue[]): string {
    if (issues.length === 1) {
      return `Please check the ${issues[0].field} field: ${issues[0].message}`;
    }
    return `Please check the following fields: ${issues.map((i) => i.field).join(", ")}`;
  }

  static getFormattedIssues(
    issues: ValidationIssue[],
  ): Record<string, string[]> {
    const formatted: Record<string, string[]> = {};

    for (const issue of issues) {
      if (!formatted[issue.field]) {
        formatted[issue.field] = [];
      }
      formatted[issue.field].push(issue.message);
    }

    return formatted;
  }
}
