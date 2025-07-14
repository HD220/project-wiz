/**
 * Centralized logging utility with structured logging support
 * Provides consistent logging across the entire application
 */

/**
 * Log levels in order of severity
 */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
}

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: string;
  metadata?: Record<string, any>;
  error?: Error;
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  maxFileSize?: number;
  maxFiles?: number;
  format?: "json" | "pretty";
}

/**
 * Default logger configuration
 */
const DEFAULT_CONFIG: LoggerConfig = {
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: false,
  format: "pretty",
};

/**
 * Centralized logger class with structured logging capabilities
 * Provides consistent logging across the entire application with:
 * - Multiple log levels (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
 * - Contextual logging with metadata
 * - Console and file output support
 * - Structured JSON logging
 * - Performance tracking
 * - Error tracking with stack traces
 */
export class Logger {
  private static instance: Logger;
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;

  /**
   * Private constructor for singleton pattern
   * @param config - Logger configuration
   */
  private constructor(config: LoggerConfig = DEFAULT_CONFIG) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Gets the singleton logger instance
   * @param config - Optional configuration for first initialization
   * @returns Logger instance
   */
  public static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Creates a child logger with a specific context
   * @param context - Context name for the child logger
   * @returns Child logger instance
   */
  public createChild(context: string): ChildLogger {
    return new ChildLogger(this, context);
  }

  /**
   * Logs a trace message
   * @param message - Log message
   * @param metadata - Additional metadata
   * @param context - Optional context
   */
  public trace(
    message: string,
    metadata?: Record<string, any>,
    context?: string,
  ): void {
    this.log(LogLevel.TRACE, message, metadata, context);
  }

  /**
   * Logs a debug message
   * @param message - Log message
   * @param metadata - Additional metadata
   * @param context - Optional context
   */
  public debug(
    message: string,
    metadata?: Record<string, any>,
    context?: string,
  ): void {
    this.log(LogLevel.DEBUG, message, metadata, context);
  }

  /**
   * Logs an info message
   * @param message - Log message
   * @param metadata - Additional metadata
   * @param context - Optional context
   */
  public info(
    message: string,
    metadata?: Record<string, any>,
    context?: string,
  ): void {
    this.log(LogLevel.INFO, message, metadata, context);
  }

  /**
   * Logs a warning message
   * @param message - Log message
   * @param metadata - Additional metadata
   * @param context - Optional context
   */
  public warn(
    message: string,
    metadata?: Record<string, any>,
    context?: string,
  ): void {
    this.log(LogLevel.WARN, message, metadata, context);
  }

  /**
   * Logs an error message
   * @param message - Log message
   * @param error - Error object
   * @param metadata - Additional metadata
   * @param context - Optional context
   */
  public error(
    message: string,
    error?: Error,
    metadata?: Record<string, any>,
    context?: string,
  ): void {
    this.log(LogLevel.ERROR, message, metadata, context, error);
  }

  /**
   * Logs a fatal error message
   * @param message - Log message
   * @param error - Error object
   * @param metadata - Additional metadata
   * @param context - Optional context
   */
  public fatal(
    message: string,
    error?: Error,
    metadata?: Record<string, any>,
    context?: string,
  ): void {
    this.log(LogLevel.FATAL, message, metadata, context, error);
  }

  /**
   * Logs a performance measurement
   * @param operation - Operation name
   * @param duration - Duration in milliseconds
   * @param metadata - Additional metadata
   * @param context - Optional context
   */
  public performance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
    context?: string,
  ): void {
    this.log(
      LogLevel.INFO,
      `Performance: ${operation}`,
      {
        ...metadata,
        duration: `${duration}ms`,
        operation,
      },
      context,
    );
  }

  /**
   * Creates a performance timer
   * @param operation - Operation name
   * @param context - Optional context
   * @returns Timer function to stop and log performance
   */
  public startTimer(operation: string, context?: string): () => void {
    const startTime = Date.now();
    return () => {
      const duration = Date.now() - startTime;
      this.performance(operation, duration, undefined, context);
    };
  }

  /**
   * Core logging method
   * @param level - Log level
   * @param message - Log message
   * @param metadata - Additional metadata
   * @param context - Optional context
   * @param error - Optional error object
   */
  private log(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    context?: string,
    error?: Error,
  ): void {
    // Check if log level is enabled
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context,
      metadata: this.sanitizeMetadata(metadata),
      error,
    };

    // Add to buffer
    this.addToBuffer(entry);

    // Output to console if enabled
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }

    // Output to file if enabled
    if (this.config.enableFile) {
      this.outputToFile(entry);
    }
  }

  /**
   * Adds log entry to buffer
   * @param entry - Log entry to add
   */
  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Trim buffer if it exceeds max size
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  /**
   * Outputs log entry to console
   * @param entry - Log entry to output
   */
  private outputToConsole(entry: LogEntry): void {
    const formattedMessage = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage);
        if (entry.error) {
          console.error(entry.error);
        }
        break;
    }
  }

  /**
   * Outputs log entry to file
   * @param entry - Log entry to output
   */
  private outputToFile(entry: LogEntry): void {
    // File output would be implemented here
    // For now, this is a placeholder
    console.log("[FILE]", this.formatMessage(entry));
  }

  /**
   * Formats log message for output
   * @param entry - Log entry to format
   * @returns Formatted message
   */
  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level].padEnd(5);
    const context = entry.context ? `[${entry.context}]` : "";
    const message = entry.message;

    if (this.config.format === "json") {
      return JSON.stringify({
        timestamp,
        level: LogLevel[entry.level],
        context: entry.context,
        message,
        metadata: entry.metadata,
        error: entry.error
          ? {
              message: entry.error.message,
              stack: entry.error.stack,
            }
          : undefined,
      });
    }

    // Pretty format
    let formatted = `${timestamp} ${level} ${context} ${message}`;

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      formatted += ` ${JSON.stringify(entry.metadata)}`;
    }

    return formatted;
  }

  /**
   * Sanitizes metadata for logging
   * @param metadata - Metadata to sanitize
   * @returns Sanitized metadata
   */
  private sanitizeMetadata(
    metadata?: Record<string, any>,
  ): Record<string, any> | undefined {
    if (!metadata) return undefined;

    const sanitized: Record<string, any> = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Sanitizes an object for logging
   * @param obj - Object to sanitize
   * @returns Sanitized object
   */
  private sanitizeObject(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (typeof obj === "object" && obj !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (this.isSensitiveField(key)) {
          sanitized[key] = "[REDACTED]";
        } else {
          sanitized[key] = this.sanitizeObject(value);
        }
      }
      return sanitized;
    }

    return obj;
  }

  /**
   * Checks if a field is sensitive
   * @param fieldName - Field name to check
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
      "access_token",
      "refresh_token",
      "session_id",
      "csrf_token",
    ];

    return sensitiveFields.some((sensitive) =>
      fieldName.toLowerCase().includes(sensitive),
    );
  }

  /**
   * Gets recent log entries
   * @param count - Number of entries to get
   * @returns Array of recent log entries
   */
  public getRecentLogs(count: number = 50): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  /**
   * Clears the log buffer
   */
  public clearBuffer(): void {
    this.logBuffer = [];
  }

  /**
   * Updates logger configuration
   * @param config - New configuration
   */
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets current logger configuration
   * @returns Current configuration
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

/**
 * Child logger class that automatically includes context
 */
export class ChildLogger {
  private parent: Logger;
  private context: string;

  constructor(parent: Logger, context: string) {
    this.parent = parent;
    this.context = context;
  }

  public trace(message: string, metadata?: Record<string, any>): void {
    this.parent.trace(message, metadata, this.context);
  }

  public debug(message: string, metadata?: Record<string, any>): void {
    this.parent.debug(message, metadata, this.context);
  }

  public info(message: string, metadata?: Record<string, any>): void {
    this.parent.info(message, metadata, this.context);
  }

  public warn(message: string, metadata?: Record<string, any>): void {
    this.parent.warn(message, metadata, this.context);
  }

  public error(
    message: string,
    error?: Error,
    metadata?: Record<string, any>,
  ): void {
    this.parent.error(message, error, metadata, this.context);
  }

  public fatal(
    message: string,
    error?: Error,
    metadata?: Record<string, any>,
  ): void {
    this.parent.fatal(message, error, metadata, this.context);
  }

  public performance(
    operation: string,
    duration: number,
    metadata?: Record<string, any>,
  ): void {
    this.parent.performance(operation, duration, metadata, this.context);
  }

  public startTimer(operation: string): () => void {
    return this.parent.startTimer(operation, this.context);
  }
}

/**
 * Default logger instance
 */
export const logger = Logger.getInstance();
