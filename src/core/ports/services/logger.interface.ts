// src/core/ports/services/logger.interface.ts

export interface LogContext {
  [key: string]: any; // For structured context, e.g., { jobId: '123', agentRole: 'Compiler' }
}

export interface ILogger {
  /**
   * Logs a debug message. Generally for detailed information useful during development.
   * @param message The message to log.
   * @param context Optional structured context.
   */
  debug(message: string, context?: LogContext): void;

  /**
   * Logs an informational message. For general application flow events.
   * @param message The message to log.
   * @param context Optional structured context.
   */
  info(message: string, context?: LogContext): void;

  /**
   * Logs a warning message. For potential issues that don't necessarily halt execution.
   * @param message The message to log.
   * @param context Optional structured context.
   */
  warn(message: string, context?: LogContext): void;

  /**
   * Logs an error message. For errors and exceptions.
   * @param message The primary error message.
   * @param error Optional Error object associated with this log event.
   * @param context Optional structured context.
   */
  error(message: string, error?: Error, context?: LogContext): void;
}
