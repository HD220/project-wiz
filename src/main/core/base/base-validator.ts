/**
 * Base validator class providing common validation functionality
 * Implements standardized validation patterns with Zod integration
 */

import { z } from "zod";
import {
  IValidator,
  IValidationError,
  Result,
  ResultUtils,
} from "../abstractions";

/**
 * Base validation error implementation
 */
export class ValidationError implements IValidationError {
  public readonly field: string;
  public readonly message: string;
  public readonly value?: unknown;

  constructor(field: string, message: string, value?: unknown) {
    this.field = field;
    this.message = message;
    this.value = value;
  }

  public toString(): string {
    return `${this.field}: ${this.message}`;
  }
}

/**
 * Abstract base class for all validators in the system
 * Provides common validation functionality with:
 * - Zod schema integration
 * - Standardized validation result format
 * - Error accumulation and reporting
 * - Type-safe validation
 */
export abstract class BaseValidator<T> implements IValidator<T> {
  protected readonly validatorName: string;
  protected schema?: z.ZodSchema<T>;

  /**
   * Creates a new validator instance
   * @param validatorName - Name of the validator for logging purposes
   * @param schema - Optional Zod schema for validation
   */
  protected constructor(validatorName: string, schema?: z.ZodSchema<T>) {
    this.validatorName = validatorName;
    this.schema = schema;
  }

  /**
   * Validates an object and returns validation result
   * @param data - The data to validate
   * @returns Result with validated object or validation errors
   */
  public validate(data: unknown): Result<T, IValidationError[]> {
    try {
      this.logValidation("validate", data);

      const errors: ValidationError[] = [];

      // Perform Zod schema validation if available
      if (this.schema) {
        const schemaResult = this.validateWithSchema(data);
        if (schemaResult.length > 0) {
          errors.push(...schemaResult);
        }
      }

      // Perform custom validation
      const customErrors = this.performCustomValidation(data);
      errors.push(...customErrors);

      if (errors.length === 0) {
        const validatedData = this.schema
          ? this.schema.parse(data)
          : (data as T);
        this.logValidationSuccess("validate", data, validatedData);
        return ResultUtils.success(validatedData);
      }
      this.logValidationError("validate", errors, data);
      return ResultUtils.error(errors);
    } catch (error) {
      this.logValidationError("validate", error, data);
      const validationError = new ValidationError(
        "general",
        `Validation failed: ${(error as Error).message}`,
        data,
      );
      return ResultUtils.error([validationError]);
    }
  }

  /**
   * Check if data is valid without returning errors
   * @param data - Object to validate
   * @returns Boolean indicating if data is valid
   */
  public isValid(data: unknown): boolean {
    const result = this.validate(data);
    return ResultUtils.isSuccess(result);
  }

  /**
   * Validates using Zod schema
   * @param data - The data to validate
   * @returns Array of validation errors
   */
  protected validateWithSchema(data: unknown): ValidationError[] {
    if (!this.schema) return [];

    try {
      this.schema.parse(data);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues.map(
          (issue) =>
            new ValidationError(
              issue.path.join(".") || "root",
              issue.message,
              data,
            ),
        );
      }

      return [new ValidationError("root", "Schema validation failed", data)];
    }
  }

  /**
   * Performs custom validation logic
   * Override this method to implement specific validation rules
   * @param data - The data to validate
   * @returns Array of validation errors
   */
  protected performCustomValidation(data: unknown): ValidationError[] {
    // Override in derived classes
    return [];
  }

  /**
   * Sets or updates the Zod schema
   * @param schema - New Zod schema
   */
  protected setSchema(schema: z.ZodSchema<T>): void {
    this.schema = schema;
  }

  /**
   * Creates a composed validator with additional schema
   * @param additionalSchema - Additional Zod schema to compose
   * @returns New validator with composed schema
   */
  protected composeSchema(
    additionalSchema: z.ZodSchema<any>,
  ): z.ZodIntersection<z.ZodSchema<T>, z.ZodSchema<any>> {
    if (!this.schema) {
      throw new Error("Cannot compose without base schema");
    }
    return this.schema.and(additionalSchema);
  }

  /**
   * Validates a single field with Zod
   * @param fieldName - Name of the field
   * @param value - Value to validate
   * @param fieldSchema - Zod schema for the field
   * @returns Array of validation errors
   */
  protected validateField<U>(
    fieldName: string,
    value: U,
    fieldSchema: z.ZodSchema<U>,
  ): ValidationError[] {
    try {
      fieldSchema.parse(value);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues.map(
          (issue) => new ValidationError(fieldName, issue.message, value),
        );
      }

      return [new ValidationError(fieldName, "Field validation failed", value)];
    }
  }

  /**
   * Creates common Zod schemas for reuse
   */
  protected static createCommonSchemas() {
    return {
      // String schemas
      requiredString: z.string().min(1, "This field is required"),
      email: z.string().email("Invalid email format"),
      url: z.string().url("Invalid URL format"),
      uuid: z.string().uuid("Invalid UUID format"),

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
    };
  }

  /**
   * Validates an array of values
   * @param values - Array of values to validate
   * @returns Result with validated array or validation errors
   */
  public validateArray(values: unknown[]): Result<T[], IValidationError[]> {
    const allErrors: ValidationError[] = [];
    const validatedValues: T[] = [];

    for (let i = 0; i < values.length; i++) {
      const result = this.validate(values[i]);
      if (ResultUtils.isSuccess(result)) {
        validatedValues.push(result.value);
      } else {
        const indexedErrors = result.error.map(
          (error) =>
            new ValidationError(
              `[${i}].${error.field}`,
              error.message,
              error.value,
            ),
        );
        allErrors.push(...indexedErrors);
      }
    }

    if (allErrors.length === 0) {
      return ResultUtils.success(validatedValues);
    }
    return ResultUtils.error(allErrors);
  }

  /**
   * Validates a partial object (useful for updates)
   * @param data - The partial data to validate
   * @returns Result with validated partial object or validation errors
   */
  public validatePartial(
    data: unknown,
  ): Result<Partial<T>, IValidationError[]> {
    if (!this.schema) {
      return this.validate(data as unknown) as Result<
        Partial<T>,
        IValidationError[]
      >;
    }

    try {
      // Create a partial schema from the base schema
      const partialSchema = (this.schema as any).partial();
      const result = this.validateWithSchema(data);

      if (result.length === 0) {
        const validatedData = partialSchema.parse(data);
        return ResultUtils.success(validatedData);
      }
      return ResultUtils.error(result);
    } catch (error) {
      const validationError = new ValidationError(
        "general",
        `Partial validation failed: ${(error as Error).message}`,
        data,
      );
      return ResultUtils.error([validationError]);
    }
  }

  /**
   * Creates a standardized validation error
   * @param field - Field name
   * @param message - Error message
   * @param value - Invalid value
   * @returns Validation error
   */
  protected createError(
    field: string,
    message: string,
    value?: unknown,
  ): ValidationError {
    return new ValidationError(field, message, value);
  }

  /**
   * Combines multiple validation results
   * @param results - Array of validation results
   * @returns Combined validation result
   */
  protected combineResults(
    results: Result<T, IValidationError[]>[],
  ): Result<T[], IValidationError[]> {
    const allErrors: IValidationError[] = [];
    const validatedValues: T[] = [];

    for (const result of results) {
      if (ResultUtils.isSuccess(result)) {
        validatedValues.push(result.value);
      } else {
        allErrors.push(...result.error);
      }
    }

    if (allErrors.length === 0) {
      return ResultUtils.success(validatedValues);
    }
    return ResultUtils.error(allErrors);
  }

  // Logging methods

  /**
   * Logs the start of validation
   * @param operation - The operation name
   * @param data - Data being validated
   */
  private logValidation(operation: string, data: unknown): void {
    console.log(
      `[${this.validatorName}Validator] ${operation}`,
      this.sanitizeForLog(data),
    );
  }

  /**
   * Logs validation success
   * @param operation - The operation name
   * @param data - Data that was validated
   * @param result - Validation result
   */
  private logValidationSuccess(
    operation: string,
    data: unknown,
    result: T,
  ): void {
    console.log(`[${this.validatorName}Validator] ${operation} SUCCESS`, {
      data: this.sanitizeForLog(data),
      result: this.sanitizeForLog(result),
    });
  }

  /**
   * Logs validation error
   * @param operation - The operation name
   * @param error - The error that occurred
   * @param data - Data being validated
   */
  private logValidationError(
    operation: string,
    error: any,
    data: unknown,
  ): void {
    console.error(`[${this.validatorName}Validator] ${operation} ERROR`, {
      error: Array.isArray(error)
        ? error.map((e) => e.message || e.toString())
        : error.message || error.toString(),
      data: this.sanitizeForLog(data),
    });
  }

  /**
   * Sanitizes data for logging
   * @param data - The data to sanitize
   * @returns Sanitized data
   */
  private sanitizeForLog(data: unknown): unknown {
    if (typeof data === "string") {
      return data.length > 50 ? `${data.substring(0, 50)}...` : data;
    }
    if (typeof data === "object" && data !== null) {
      return "[Object]";
    }
    return data;
  }
}
