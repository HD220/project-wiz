import { Result } from "./result.type";

/**
 * Validation error details
 */
export interface IValidationError {
  readonly field: string;
  readonly message: string;
  readonly value?: unknown;
}

/**
 * Generic validator interface for data validation
 * Defines contract for validation operations
 *
 * @template T - Type to validate
 */
export interface IValidator<T> {
  /**
   * Validate an object
   * @param data - Object to validate
   * @returns Result with validated object or validation errors
   */
  validate(data: unknown): Result<T, IValidationError[]>;

  /**
   * Check if data is valid without returning errors
   * @param data - Object to validate
   * @returns Boolean indicating if data is valid
   */
  isValid(data: unknown): boolean;
}

/**
 * Schema validator interface for complex validation scenarios
 * Provides additional validation methods for specific use cases
 *
 * @template T - Type to validate
 */
export interface ISchemaValidator<T> extends IValidator<T> {
  /**
   * Validate only specific fields of an object
   * @param data - Object to validate
   * @param fields - Array of field names to validate
   * @returns Result with validated object or validation errors
   */
  validatePartial(
    data: unknown,
    fields: (keyof T)[],
  ): Result<Partial<T>, IValidationError[]>;

  /**
   * Validate an array of objects
   * @param data - Array of objects to validate
   * @returns Result with validated objects array or validation errors
   */
  validateArray(data: unknown[]): Result<T[], IValidationError[]>;

  /**
   * Get validation schema definition
   * @returns Schema definition object
   */
  getSchema(): unknown;
}
