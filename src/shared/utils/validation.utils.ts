// Shared validation utilities

export class ValidationUtils {
  /**
   * Validates if a string is a valid UUID
   */
  static isValidUUID(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  /**
   * Validates if a string is not empty or just whitespace
   */
  static isNonEmptyString(value: string): boolean {
    return typeof value === "string" && value.trim().length > 0;
  }

  /**
   * Validates if a string has minimum length
   */
  static hasMinLength(value: string, minLength: number): boolean {
    return typeof value === "string" && value.length >= minLength;
  }

  /**
   * Validates if a string has maximum length
   */
  static hasMaxLength(value: string, maxLength: number): boolean {
    return typeof value === "string" && value.length <= maxLength;
  }

  /**
   * Validates if a number is within range
   */
  static isInRange(value: number, min: number, max: number): boolean {
    return typeof value === "number" && value >= min && value <= max;
  }

  /**
   * Validates if an email has basic format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates if a URL has valid format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a string contains only alphanumeric characters and certain special chars
   */
  static isValidIdentifier(value: string): boolean {
    const identifierRegex = /^[a-zA-Z0-9_-]+$/;
    return identifierRegex.test(value);
  }

  /**
   * Validates if temperature is in valid range for LLM
   */
  static isValidTemperature(temperature: number): boolean {
    return this.isInRange(temperature, 0.0, 2.0);
  }

  /**
   * Validates if max tokens is in valid range
   */
  static isValidMaxTokens(maxTokens: number): boolean {
    return Number.isInteger(maxTokens) && this.isInRange(maxTokens, 1, 10000);
  }

  /**
   * Sanitizes a string by removing dangerous characters
   */
  static sanitizeString(value: string): string {
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/[<>]/g, "")
      .trim();
  }

  /**
   * Validates and sanitizes user input
   */
  static validateAndSanitize(
    value: string,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      sanitize?: boolean;
    } = {},
  ): { isValid: boolean; value: string; error?: string } {
    let processedValue = value;

    // Check if required and empty
    if (options.required && !this.isNonEmptyString(value)) {
      return {
        isValid: false,
        value: processedValue,
        error: "This field is required",
      };
    }

    // Skip other validations if not required and empty
    if (!options.required && !this.isNonEmptyString(value)) {
      return { isValid: true, value: processedValue };
    }

    // Sanitize if requested
    if (options.sanitize) {
      processedValue = this.sanitizeString(processedValue);
    }

    // Check minimum length
    if (
      options.minLength &&
      !this.hasMinLength(processedValue, options.minLength)
    ) {
      return {
        isValid: false,
        value: processedValue,
        error: `Must be at least ${options.minLength} characters long`,
      };
    }

    // Check maximum length
    if (
      options.maxLength &&
      !this.hasMaxLength(processedValue, options.maxLength)
    ) {
      return {
        isValid: false,
        value: processedValue,
        error: `Must be no more than ${options.maxLength} characters long`,
      };
    }

    return { isValid: true, value: processedValue };
  }
}
