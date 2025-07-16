export class StringValidation {
  static isNonEmptyString(value: string): boolean {
    return typeof value === "string" && value.trim().length > 0;
  }

  static hasMinLength(value: string, minLength: number): boolean {
    return typeof value === "string" && value.length >= minLength;
  }

  static hasMaxLength(value: string, maxLength: number): boolean {
    return typeof value === "string" && value.length <= maxLength;
  }

  static isValidIdentifier(value: string): boolean {
    const identifierRegex = /^[a-zA-Z0-9_-]+$/;
    return identifierRegex.test(value);
  }
}
