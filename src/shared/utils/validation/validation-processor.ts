import { ValidationOptions } from "./validation-processor/validation-options";
import { ValidationResult } from "./validation-processor/validation-result";
import { ValidationSteps } from "./validation-processor/validation-steps";

export class ValidationProcessor {
  static validateAndSanitize(
    value: string,
    options: ValidationOptions = {},
  ): ValidationResult {
    const requiredResult = ValidationSteps.validateRequired(value, options);
    if (requiredResult) return requiredResult;

    const optionalResult = ValidationSteps.validateOptional(value, options);
    if (optionalResult) return optionalResult;

    const processedValue = ValidationSteps.sanitizeValue(value, options);

    const minLengthResult = ValidationSteps.validateMinLength(
      processedValue,
      options,
    );
    if (minLengthResult) return minLengthResult;

    const maxLengthResult = ValidationSteps.validateMaxLength(
      processedValue,
      options,
    );
    if (maxLengthResult) return maxLengthResult;

    return { isValid: true, value: processedValue };
  }
}
