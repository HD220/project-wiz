/**
 * Base service class providing common business logic functionality
 * Implements standardized service patterns with validation and error handling
 */

import { IService, Result, ResultUtils } from "../abstractions";

/**
 * Abstract base class for all services in the system
 * Provides common service functionality with:
 * - Business logic orchestration
 * - Error handling and logging
 * - Result pattern implementation
 */
export abstract class BaseService<T> implements IService<T> {
  protected readonly serviceName: string;

  /**
   * Creates a new service instance
   * @param serviceName - Name of the service for logging purposes
   */
  protected constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Execute business logic operation
   * @param data - Input data for the operation
   * @returns Promise resolving to Result containing success or error
   */
  public async execute(data: unknown): Promise<Result<T, Error>> {
    try {
      this.logOperation("execute", data);

      // Execute the business logic
      const result = await this.doExecute(data);

      this.logOperationSuccess("execute", data, result);
      return result;
    } catch (error) {
      this.logError("execute", error, data);
      return ResultUtils.error(error as Error);
    }
  }

  /**
   * Performs the actual business logic execution
   * Override this method to implement specific business logic
   * @param data - Input data for the operation
   * @returns Promise resolving to Result containing success or error
   */
  protected abstract doExecute(data: unknown): Promise<Result<T, Error>>;

  /**
   * Creates a standardized business logic error
   * @param message - Error message
   * @param operation - Operation that failed
   * @param data - Input data that caused the error
   * @returns Business logic error
   */
  protected createBusinessError(
    message: string,
    operation: string,
    data?: any,
  ): Error {
    const error = new Error(`${this.serviceName} ${operation}: ${message}`);
    error.name = "BusinessLogicError";
    return error;
  }

  /**
   * Creates a standardized validation error
   * @param message - Error message
   * @param field - Field that failed validation
   * @returns Validation error
   */
  protected createValidationError(message: string, field?: string): Error {
    const error = new Error(
      `Validation error${field ? ` for ${field}` : ""}: ${message}`,
    );
    error.name = "ValidationError";
    return error;
  }

  /**
   * Safely processes an operation with error handling
   * @param operation - Operation name
   * @param data - Input data
   * @param processor - Function to process the operation
   * @returns Promise resolving to Result
   */
  protected async safeProcess<TResult>(
    operation: string,
    data: any,
    processor: (data: any) => Promise<TResult>,
  ): Promise<Result<TResult, Error>> {
    try {
      this.logOperation(operation, data);
      const result = await processor(data);
      this.logOperationSuccess(operation, data, result);
      return ResultUtils.success(result);
    } catch (error) {
      this.logError(operation, error, data);
      return ResultUtils.error(error as Error);
    }
  }

  /**
   * Combines multiple Results into a single Result
   * @param results - Array of Results to combine
   * @returns Combined Result
   */
  protected combineResults<TResult>(
    results: Result<TResult, Error>[],
  ): Result<TResult[], Error> {
    const values: TResult[] = [];

    for (const result of results) {
      if (ResultUtils.isSuccess(result)) {
        values.push(result.value);
      } else {
        return ResultUtils.error(result.error);
      }
    }

    return ResultUtils.success(values);
  }

  /**
   * Executes multiple operations in parallel
   * @param operations - Array of operations to execute
   * @returns Promise resolving to Result with array of results
   */
  protected async executeParallel<TResult>(
    operations: Array<() => Promise<Result<TResult, Error>>>,
  ): Promise<Result<TResult[], Error>> {
    try {
      const results = await Promise.all(operations.map((op) => op()));
      return this.combineResults(results);
    } catch (error) {
      return ResultUtils.error(error as Error);
    }
  }

  /**
   * Executes multiple operations in sequence
   * @param operations - Array of operations to execute
   * @returns Promise resolving to Result with array of results
   */
  protected async executeSequential<TResult>(
    operations: Array<() => Promise<Result<TResult, Error>>>,
  ): Promise<Result<TResult[], Error>> {
    const results: TResult[] = [];

    for (const operation of operations) {
      const result = await operation();
      if (ResultUtils.isSuccess(result)) {
        results.push(result.value);
      } else {
        return ResultUtils.error(result.error);
      }
    }

    return ResultUtils.success(results);
  }

  // Logging methods

  /**
   * Logs the start of a service operation
   * @param operation - The operation name
   * @param data - Operation data
   */
  private logOperation(operation: string, data: any): void {
    console.log(
      `[${this.serviceName}Service] ${operation}`,
      this.sanitizeForLog(data),
    );
  }

  /**
   * Logs successful operation
   * @param operation - The operation name
   * @param data - Operation data
   * @param result - Operation result
   */
  private logOperationSuccess(operation: string, data: any, result: any): void {
    console.log(`[${this.serviceName}Service] ${operation} SUCCESS`, {
      data: this.sanitizeForLog(data),
      result: this.sanitizeForLog(result),
    });
  }

  /**
   * Logs service error
   * @param operation - The operation name
   * @param error - The error that occurred
   * @param data - Operation data
   */
  private logError(operation: string, error: any, data: any): void {
    console.error(`[${this.serviceName}Service] ${operation} ERROR`, {
      error: error.message,
      data: this.sanitizeForLog(data),
    });
  }

  /**
   * Sanitizes data for logging
   * @param data - The data to sanitize
   * @returns Sanitized data
   */
  private sanitizeForLog(data: any): any {
    if (typeof data === "string") {
      return data.length > 100 ? `${data.substring(0, 100)}...` : data;
    }
    if (typeof data === "object" && data !== null) {
      return "[Object]";
    }
    return data;
  }
}
