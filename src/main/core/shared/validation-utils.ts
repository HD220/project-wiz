/**
 * Validation utility functions with Zod integration
 * Provides reusable validation logic across the application
 */

import { z } from "zod";

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
  errors?: string[];
}

/**
 * Comprehensive validation utilities class using Zod
 * Provides common validation functions with Zod schemas
 */
export class ValidationUtils {
  /**
   * Common Zod schemas for reuse
   */
  public static readonly schemas = {
    // String schemas
    requiredString: z.string().min(1, "This field is required"),
    email: z.string().email("Invalid email format"),
    url: z.string().url("Invalid URL format"),
    uuid: z.string().uuid("Invalid UUID format"),
    phoneNumber: z
      .string()
      .regex(/^[\+]?[1-9][\d]{0,15}$/, "Invalid phone number format"),

    // Number schemas
    positiveNumber: z.number().positive("Must be a positive number"),
    nonNegativeNumber: z.number().nonnegative("Must be non-negative"),
    integer: z.number().int("Must be an integer"),

    // Date schemas
    pastDate: z
      .date()
      .refine((date) => date < new Date(), "Must be a past date"),
    futureDate: z
      .date()
      .refine((date) => date > new Date(), "Must be a future date"),

    // Array schemas
    nonEmptyArray: z.array(z.any()).min(1, "Array cannot be empty"),

    // Object schemas
    nonEmptyObject: z
      .object({})
      .passthrough()
      .refine((obj) => Object.keys(obj).length > 0, "Object cannot be empty"),

    // JSON schema
    jsonString: z.string().refine((str) => {
      try {
        JSON.parse(str);
        return true;
      } catch {
        return false;
      }
    }, "Must be valid JSON"),
  };

  /**
   * Validates a value against a Zod schema
   * @param schema - Zod schema to validate against
   * @param value - Value to validate
   * @param fieldName - Optional field name for error messages
   * @returns Validation result
   */
  public static validateWithSchema<T>(
    schema: z.ZodSchema<T>,
    value: unknown,
    fieldName?: string,
  ): ValidationResult {
    try {
      schema.parse(value);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((issue) =>
          fieldName ? `${fieldName}: ${issue.message}` : issue.message,
        );
        return {
          isValid: false,
          message: errors[0],
          errors,
        };
      }

      return {
        isValid: false,
        message: fieldName
          ? `${fieldName} validation failed`
          : "Validation failed",
      };
    }
  }

  /**
   * Validates if a value is required (not null/undefined)
   * @param value - Value to validate
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isRequired(
    value: unknown,
    fieldName?: string,
  ): ValidationResult {
    const schema = z.any().refine((val) => val !== null && val !== undefined, {
      message: `${fieldName || "Value"} is required`,
    });

    return this.validateWithSchema(schema, value, fieldName);
  }

  /**
   * Validates if a string is not empty
   * @param value - String to validate
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isNotEmpty(
    value: string,
    fieldName?: string,
  ): ValidationResult {
    return this.validateWithSchema(
      this.schemas.requiredString,
      value,
      fieldName,
    );
  }

  /**
   * Validates string length
   * @param value - String to validate
   * @param minLength - Minimum length
   * @param maxLength - Maximum length
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static hasLength(
    value: string,
    minLength?: number,
    maxLength?: number,
    fieldName?: string,
  ): ValidationResult {
    let schema = z.string();

    if (minLength !== undefined) {
      schema = schema.min(
        minLength,
        `${fieldName || "Value"} must be at least ${minLength} characters long`,
      );
    }

    if (maxLength !== undefined) {
      schema = schema.max(
        maxLength,
        `${fieldName || "Value"} must not exceed ${maxLength} characters`,
      );
    }

    return this.validateWithSchema(schema, value, fieldName);
  }

  /**
   * Validates if a string matches a pattern
   * @param value - String to validate
   * @param pattern - Regular expression pattern
   * @param fieldName - Name of the field for error messages
   * @param errorMessage - Custom error message
   * @returns Validation result
   */
  public static matchesPattern(
    value: string,
    pattern: RegExp,
    fieldName?: string,
    errorMessage?: string,
  ): ValidationResult {
    const schema = z
      .string()
      .regex(
        pattern,
        errorMessage || `${fieldName || "Value"} has invalid format`,
      );
    return this.validateWithSchema(schema, value, fieldName);
  }

  /**
   * Validates an email address
   * @param email - Email to validate
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isEmail(email: string, fieldName?: string): ValidationResult {
    return this.validateWithSchema(this.schemas.email, email, fieldName);
  }

  /**
   * Validates a URL
   * @param url - URL to validate
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isURL(url: string, fieldName?: string): ValidationResult {
    return this.validateWithSchema(this.schemas.url, url, fieldName);
  }

  /**
   * Validates a password with custom requirements
   * @param password - Password to validate
   * @param options - Password validation options
   * @returns Validation result
   */
  public static isPassword(
    password: string,
    options: {
      minLength?: number;
      maxLength?: number;
      requireLowercase?: boolean;
      requireUppercase?: boolean;
      requireNumbers?: boolean;
      requireSymbols?: boolean;
    } = {},
  ): ValidationResult {
    const {
      minLength = 8,
      maxLength = 128,
      requireLowercase = true,
      requireUppercase = true,
      requireNumbers = true,
      requireSymbols = false,
    } = options;

    let schema = z
      .string()
      .min(minLength, `Password must be at least ${minLength} characters long`)
      .max(maxLength, `Password must not exceed ${maxLength} characters`);

    if (requireLowercase) {
      schema = schema.refine(
        (val) => /[a-z]/.test(val),
        "Password must contain at least one lowercase letter",
      ) as any;
    }

    if (requireUppercase) {
      schema = schema.refine(
        (val) => /[A-Z]/.test(val),
        "Password must contain at least one uppercase letter",
      ) as any;
    }

    if (requireNumbers) {
      schema = schema.refine(
        (val) => /\d/.test(val),
        "Password must contain at least one number",
      ) as any;
    }

    if (requireSymbols) {
      schema = schema.refine(
        (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
        "Password must contain at least one special character",
      ) as any;
    }

    return this.validateWithSchema(schema, password);
  }

  /**
   * Validates a numeric value
   * @param value - Value to validate
   * @param min - Minimum value
   * @param max - Maximum value
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isNumber(
    value: unknown,
    min?: number,
    max?: number,
    fieldName?: string,
  ): ValidationResult {
    let schema = z.number();

    if (min !== undefined) {
      schema = schema.min(
        min,
        `${fieldName || "Value"} must be at least ${min}`,
      );
    }

    if (max !== undefined) {
      schema = schema.max(
        max,
        `${fieldName || "Value"} must not exceed ${max}`,
      );
    }

    return this.validateWithSchema(schema, value, fieldName);
  }

  /**
   * Validates an integer value
   * @param value - Value to validate
   * @param min - Minimum value
   * @param max - Maximum value
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isInteger(
    value: unknown,
    min?: number,
    max?: number,
    fieldName?: string,
  ): ValidationResult {
    let schema = z.number().int(`${fieldName || "Value"} must be an integer`);

    if (min !== undefined) {
      schema = schema.min(
        min,
        `${fieldName || "Value"} must be at least ${min}`,
      );
    }

    if (max !== undefined) {
      schema = schema.max(
        max,
        `${fieldName || "Value"} must not exceed ${max}`,
      );
    }

    return this.validateWithSchema(schema, value, fieldName);
  }

  /**
   * Validates if a value is in a list of allowed values
   * @param value - Value to validate
   * @param allowedValues - Array of allowed values
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isInList(
    value: unknown,
    allowedValues: unknown[],
    fieldName?: string,
  ): ValidationResult {
    const schema = z.enum(allowedValues as [string, ...string[]], {
      errorMap: () => ({
        message: `${fieldName || "Value"} must be one of: ${allowedValues.join(", ")}`,
      }),
    });

    return this.validateWithSchema(schema, value, fieldName);
  }

  /**
   * Validates an array
   * @param value - Value to validate
   * @param minLength - Minimum array length
   * @param maxLength - Maximum array length
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isArray(
    value: unknown,
    minLength?: number,
    maxLength?: number,
    fieldName?: string,
  ): ValidationResult {
    let schema = z.array(z.any());

    if (minLength !== undefined) {
      schema = schema.min(
        minLength,
        `${fieldName || "Array"} must have at least ${minLength} item${minLength === 1 ? "" : "s"}`,
      );
    }

    if (maxLength !== undefined) {
      schema = schema.max(
        maxLength,
        `${fieldName || "Array"} must not have more than ${maxLength} item${maxLength === 1 ? "" : "s"}`,
      );
    }

    return this.validateWithSchema(schema, value, fieldName);
  }

  /**
   * Validates a date
   * @param value - Value to validate
   * @param minDate - Minimum date
   * @param maxDate - Maximum date
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isDate(
    value: unknown,
    minDate?: Date,
    maxDate?: Date,
    fieldName?: string,
  ): ValidationResult {
    let schema = z.date();

    if (minDate) {
      schema = schema.min(
        minDate,
        `${fieldName || "Date"} must be after ${minDate.toISOString()}`,
      );
    }

    if (maxDate) {
      schema = schema.max(
        maxDate,
        `${fieldName || "Date"} must be before ${maxDate.toISOString()}`,
      );
    }

    return this.validateWithSchema(schema, value, fieldName);
  }

  /**
   * Validates a UUID
   * @param value - Value to validate
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isUUID(value: unknown, fieldName?: string): ValidationResult {
    return this.validateWithSchema(this.schemas.uuid, value, fieldName);
  }

  /**
   * Validates a JSON string
   * @param value - Value to validate
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isJSON(value: unknown, fieldName?: string): ValidationResult {
    return this.validateWithSchema(this.schemas.jsonString, value, fieldName);
  }

  /**
   * Validates a phone number (basic format)
   * @param value - Value to validate
   * @param fieldName - Name of the field for error messages
   * @returns Validation result
   */
  public static isPhoneNumber(
    value: unknown,
    fieldName?: string,
  ): ValidationResult {
    return this.validateWithSchema(this.schemas.phoneNumber, value, fieldName);
  }

  /**
   * Creates a schema for validating objects with specific field requirements
   * @param fieldSchemas - Object mapping field names to their Zod schemas
   * @returns Zod object schema
   */
  public static createObjectSchema<T extends Record<string, z.ZodTypeAny>>(
    fieldSchemas: T,
  ): z.ZodObject<T> {
    return z.object(fieldSchemas);
  }

  /**
   * Creates a schema for validating arrays of a specific type
   * @param itemSchema - Zod schema for array items
   * @param minLength - Minimum array length
   * @param maxLength - Maximum array length
   * @returns Zod array schema
   */
  public static createArraySchema<T>(
    itemSchema: z.ZodSchema<T>,
    minLength?: number,
    maxLength?: number,
  ): z.ZodArray<z.ZodSchema<T>> {
    let schema = z.array(itemSchema);

    if (minLength !== undefined) {
      schema = schema.min(minLength);
    }

    if (maxLength !== undefined) {
      schema = schema.max(maxLength);
    }

    return schema;
  }

  /**
   * Creates a conditional schema based on another field's value
   * @param baseSchema - Base schema to extend
   * @param condition - Condition function
   * @param conditionalSchema - Schema to apply when condition is true
   * @returns Conditional schema
   */
  public static createConditionalSchema<T>(
    baseSchema: z.ZodSchema<T>,
    condition: (value: T) => boolean,
    conditionalSchema: z.ZodSchema<T>,
  ): z.ZodSchema<T> {
    return z.union([
      baseSchema.refine((value) => !condition(value), {
        message: "Base validation failed",
      }),
      conditionalSchema,
    ]);
  }

  /**
   * Combines multiple validation results
   * @param results - Array of validation results
   * @returns Combined validation result
   */
  public static combineResults(results: ValidationResult[]): ValidationResult {
    const errors = results
      .filter((r) => !r.isValid)
      .map((r) => r.message || "Validation failed")
      .filter(Boolean);

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors.join("; ") : undefined,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Validates all fields in an object using provided schemas
   * @param obj - Object to validate
   * @param fieldSchemas - Map of field names to their Zod schemas
   * @returns Map of field names to validation results
   */
  public static validateObject<T extends Record<string, unknown>>(
    obj: T,
    fieldSchemas: { [K in keyof T]?: z.ZodSchema<T[K]> },
  ): { [K in keyof T]?: ValidationResult } {
    const results: { [K in keyof T]?: ValidationResult } = {};

    for (const [field, schema] of Object.entries(fieldSchemas)) {
      if (schema && obj && typeof obj === "object" && field in obj) {
        results[field as keyof T] = this.validateWithSchema(
          schema,
          obj[field as keyof T],
          field,
        );
      }
    }

    return results;
  }

  /**
   * Creates a validation schema for common entity fields
   * @param options - Options for entity validation
   * @returns Zod schema for entity validation
   */
  public static createEntitySchema(
    options: {
      requireId?: boolean;
      requireTimestamps?: boolean;
      additionalFields?: Record<string, z.ZodTypeAny>;
    } = {},
  ) {
    const {
      requireId = false,
      requireTimestamps = false,
      additionalFields = {},
    } = options;

    const baseFields: Record<string, z.ZodTypeAny> = {
      ...additionalFields,
    };

    if (requireId) {
      baseFields.id = z.string().uuid();
    }

    if (requireTimestamps) {
      baseFields.createdAt = z.date();
      baseFields.updatedAt = z.date();
    }

    return z.object(baseFields);
  }
}
