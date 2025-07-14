/**
 * Base IPC handler class providing common functionality for Electron IPC communication
 * Implements standardized request/response patterns with error handling and validation
 */

import { IpcMainInvokeEvent } from "electron";
import { Result, ResultUtils } from "../abstractions";

/**
 * Interface for IPC request context
 */
export interface IpcRequestContext {
  event: IpcMainInvokeEvent;
  channel: string;
  args: any[];
  timestamp: Date;
  requestId: string;
}

/**
 * Interface for IPC response
 */
export interface IpcResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    stack?: string;
  };
  timestamp: Date;
  requestId: string;
}

/**
 * Abstract base class for all IPC handlers in the system
 * Provides common IPC functionality with:
 * - Standardized request/response format
 * - Error handling and logging
 * - Request validation
 * - Performance monitoring
 * - Security checks
 */
export abstract class BaseIpcHandler {
  protected readonly handlerName: string;
  protected readonly supportedChannels: string[];

  /**
   * Creates a new IPC handler instance
   * @param handlerName - Name of the handler for logging purposes
   * @param supportedChannels - Array of channels this handler supports
   */
  protected constructor(handlerName: string, supportedChannels: string[]) {
    this.handlerName = handlerName;
    this.supportedChannels = supportedChannels;
  }

  /**
   * Handles an IPC request with standardized error handling and logging
   * @param event - The IPC event
   * @param channel - The IPC channel
   * @param args - Request arguments
   * @returns Promise with IPC response
   */
  public async handle(
    event: IpcMainInvokeEvent,
    channel: string,
    ...args: any[]
  ): Promise<IpcResponse<any>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    const context: IpcRequestContext = {
      event,
      channel,
      args,
      timestamp: new Date(),
      requestId,
    };

    try {
      this.logRequest(context);

      // Validate channel
      if (!this.isChannelSupported(channel)) {
        const error = new Error(`Unsupported channel: ${channel}`);
        this.logError(context, error);
        return this.createErrorResponse(
          error,
          requestId,
          "UNSUPPORTED_CHANNEL",
        );
      }

      // Security check
      const securityResult = await this.performSecurityCheck(context);
      if (!securityResult.success) {
        const error = new Error(
          `Security check failed: ${securityResult.reason}`,
        );
        this.logError(context, error);
        return this.createErrorResponse(
          error,
          requestId,
          "SECURITY_CHECK_FAILED",
        );
      }

      // Validate request
      const validationResult = await this.validateRequest(context);
      if (!validationResult.success) {
        const error = new Error(
          `Request validation failed: ${validationResult.reason}`,
        );
        this.logError(context, error);
        return this.createErrorResponse(error, requestId, "VALIDATION_FAILED");
      }

      // Process the request
      const result = await this.processRequest(context);

      const duration = Date.now() - startTime;
      this.logResponse(context, result, duration);

      if (ResultUtils.isSuccess(result)) {
        return this.createSuccessResponse(result.value, requestId);
      }
      return this.createErrorResponse(
        result.error,
        requestId,
        "PROCESSING_FAILED",
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logError(context, error, duration);
      return this.createErrorResponse(
        error as Error,
        requestId,
        "HANDLER_ERROR",
      );
    }
  }

  /**
   * Processes the IPC request
   * Override this method to implement specific request processing logic
   * @param context - The request context
   * @returns Promise with Result containing the response data or error
   */
  protected abstract processRequest(
    context: IpcRequestContext,
  ): Promise<Result<any, Error>>;

  /**
   * Validates the IPC request
   * Override this method to implement specific validation logic
   * @param context - The request context
   * @returns Promise with validation result
   */
  protected async validateRequest(context: IpcRequestContext): Promise<{
    success: boolean;
    reason?: string;
  }> {
    // Basic validation - can be overridden in derived classes
    if (!context.args) {
      return { success: false, reason: "Missing arguments" };
    }

    return { success: true };
  }

  /**
   * Performs security checks on the request
   * Override this method to implement specific security checks
   * @param context - The request context
   * @returns Promise with security check result
   */
  protected async performSecurityCheck(context: IpcRequestContext): Promise<{
    success: boolean;
    reason?: string;
  }> {
    // Basic security check - can be overridden in derived classes
    // Check if the event is from a trusted source
    if (!context.event.senderFrame) {
      return { success: false, reason: "Invalid sender frame" };
    }

    return { success: true };
  }

  /**
   * Checks if a channel is supported by this handler
   * @param channel - The channel to check
   * @returns True if supported, false otherwise
   */
  protected isChannelSupported(channel: string): boolean {
    return this.supportedChannels.includes(channel);
  }

  /**
   * Extracts and validates arguments from the request
   * @param context - The request context
   * @param expectedTypes - Array of expected argument types
   * @returns Validated arguments or throws error
   */
  protected extractArgs<T extends any[]>(
    context: IpcRequestContext,
    expectedTypes: string[],
  ): T {
    const { args } = context;

    if (args.length !== expectedTypes.length) {
      throw new Error(
        `Expected ${expectedTypes.length} arguments, got ${args.length}`,
      );
    }

    for (let i = 0; i < expectedTypes.length; i++) {
      const expectedType = expectedTypes[i];
      const actualType = typeof args[i];

      if (
        actualType !== expectedType &&
        args[i] !== null &&
        args[i] !== undefined
      ) {
        throw new Error(
          `Argument ${i} expected to be ${expectedType}, got ${actualType}`,
        );
      }
    }

    return args as T;
  }

  /**
   * Safely extracts a single argument from the request
   * @param context - The request context
   * @param index - Index of the argument
   * @param required - Whether the argument is required
   * @returns The argument value or undefined
   */
  protected extractArg<T>(
    context: IpcRequestContext,
    index: number,
    required: boolean = false,
  ): T | undefined {
    const { args } = context;

    if (index >= args.length) {
      if (required) {
        throw new Error(`Required argument at index ${index} is missing`);
      }
      return undefined;
    }

    return args[index] as T;
  }

  /**
   * Creates a success response
   * @param data - Response data
   * @param requestId - Request ID
   * @returns IPC response
   */
  private createSuccessResponse<T>(data: T, requestId: string): IpcResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date(),
      requestId,
    };
  }

  /**
   * Creates an error response
   * @param error - The error
   * @param requestId - Request ID
   * @param code - Error code
   * @returns IPC response
   */
  private createErrorResponse(
    error: Error,
    requestId: string,
    code: string,
  ): IpcResponse<any> {
    return {
      success: false,
      error: {
        message: error.message,
        code,
        stack: error.stack,
      },
      timestamp: new Date(),
      requestId,
    };
  }

  /**
   * Generates a unique request ID
   * @returns Unique request ID
   */
  private generateRequestId(): string {
    return `${this.handlerName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Logging methods

  /**
   * Logs an incoming request
   * @param context - The request context
   */
  private logRequest(context: IpcRequestContext): void {
    console.log(`[${this.handlerName}IpcHandler] REQUEST ${context.channel}`, {
      requestId: context.requestId,
      args: this.sanitizeForLog(context.args),
      timestamp: context.timestamp.toISOString(),
    });
  }

  /**
   * Logs a response
   * @param context - The request context
   * @param result - The result
   * @param duration - Request duration in ms
   */
  private logResponse(
    context: IpcRequestContext,
    result: Result<any, Error>,
    duration: number,
  ): void {
    const logLevel = ResultUtils.isSuccess(result) ? "log" : "error";
    const status = ResultUtils.isSuccess(result) ? "SUCCESS" : "ERROR";

    console[logLevel](
      `[${this.handlerName}IpcHandler] RESPONSE ${context.channel} ${status}`,
      {
        requestId: context.requestId,
        duration: `${duration}ms`,
        success: ResultUtils.isSuccess(result),
        data: ResultUtils.isSuccess(result)
          ? this.sanitizeForLog(result.value)
          : undefined,
        error: ResultUtils.isError(result) ? result.error.message : undefined,
      },
    );
  }

  /**
   * Logs an error
   * @param context - The request context
   * @param error - The error
   * @param duration - Request duration in ms
   */
  private logError(
    context: IpcRequestContext,
    error: any,
    duration?: number,
  ): void {
    console.error(`[${this.handlerName}IpcHandler] ERROR ${context.channel}`, {
      requestId: context.requestId,
      error: error.message,
      stack: error.stack,
      duration: duration ? `${duration}ms` : undefined,
      args: this.sanitizeForLog(context.args),
    });
  }

  /**
   * Sanitizes data for logging (removes sensitive information)
   * @param data - The data to sanitize
   * @returns Sanitized data
   */
  private sanitizeForLog(data: any): any {
    if (!data) return data;

    if (typeof data === "string") {
      return data.length > 100 ? `${data.substring(0, 100)}...` : data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeForLog(item));
    }

    if (typeof data === "object") {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveField(key)) {
          sanitized[key] = "[REDACTED]";
        } else {
          sanitized[key] = this.sanitizeForLog(value);
        }
      }
      return sanitized;
    }

    return data;
  }

  /**
   * Checks if a field is sensitive and should be redacted from logs
   * @param fieldName - The field name to check
   * @returns True if sensitive, false otherwise
   */
  private isSensitiveField(fieldName: string): boolean {
    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
      "auth",
      "credential",
      "pass",
      "pwd",
      "apikey",
      "api_key",
    ];

    return sensitiveFields.some((sensitive) =>
      fieldName.toLowerCase().includes(sensitive),
    );
  }
}
