import { SanitizationUtils } from "../sanitization-utils";
import { StringValidation } from "../string-validation";

import { ValidationOptions } from "./validation-options";
import { ValidationResult } from "./validation-result";

export class ValidationSteps {
  static validateRequired(
    value: string,
    options: ValidationOptions,
  ): ValidationResult | null {
    if (options.required && !StringValidation.isNonEmptyString(value)) {
      return {
        isValid: false,
        value,
        error: "This field is required",
      };
    }
    return null;
  }

  static validateOptional(
    value: string,
    options: ValidationOptions,
  ): ValidationResult | null {
    if (!options.required && !StringValidation.isNonEmptyString(value)) {
      return { isValid: true, value };
    }
    return null;
  }

  static sanitizeValue(value: string, options: ValidationOptions): string {
    return options.sanitize ? SanitizationUtils.sanitizeString(value) : value;
  }

  static validateMinLength(
    value: string,
    options: ValidationOptions,
  ): ValidationResult | null {
    if (
      options.minLength &&
      !StringValidation.hasMinLength(value, options.minLength)
    ) {
      return {
        isValid: false,
        value,
        error: `Must be at least ${options.minLength} characters long`,
      };
    }
    return null;
  }

  static validateMaxLength(
    value: string,
    options: ValidationOptions,
  ): ValidationResult | null {
    if (
      options.maxLength &&
      !StringValidation.hasMaxLength(value, options.maxLength)
    ) {
      return {
        isValid: false,
        value,
        error: `Must be no more than ${options.maxLength} characters long`,
      };
    }
    return null;
  }
}
