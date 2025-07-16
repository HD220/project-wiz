import { FormatValidation } from "./format-validation";
import { NumberValidation } from "./number-validation";
import { SanitizationUtils } from "./sanitization-utils";
import { StringValidation } from "./string-validation";
import { ValidationProcessor } from "./validation-processor";

export class ValidationUtils {
  static isValidUUID = FormatValidation.isValidUUID;
  static isNonEmptyString = StringValidation.isNonEmptyString;
  static hasMinLength = StringValidation.hasMinLength;
  static hasMaxLength = StringValidation.hasMaxLength;
  static isInRange = NumberValidation.isInRange;
  static isValidEmail = FormatValidation.isValidEmail;
  static isValidUrl = FormatValidation.isValidUrl;
  static isValidIdentifier = StringValidation.isValidIdentifier;
  static isValidTemperature = NumberValidation.isValidTemperature;
  static isValidMaxTokens = NumberValidation.isValidMaxTokens;
  static sanitizeString = SanitizationUtils.sanitizeString;
  static validateAndSanitize = ValidationProcessor.validateAndSanitize;
}
