/**
 * @interface ILogger
 * @description Defines a generic logging interface to abstract logging implementations.
 * This allows different parts of the application (domain, application, infrastructure)
 * to log messages without being tied to a specific logging library.
 */
export interface ILogger {
  /**
   * Logs an informational message.
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>=} metadata - Optional metadata to include with the log.
   */
  info(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Logs a warning message.
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>=} metadata - Optional metadata to include with the log.
   */
  warn(message: string, metadata?: Record<string, unknown>): void;

  /**
   * Logs an error message.
   * @param {string} message - The message to log.
   * @param {Error=} error - Optional error object to associate with the log.
   * @param {Record<string, unknown>=} metadata - Optional metadata to include with the log.
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;

  /**
   * Logs a debug message. Typically used for detailed diagnostic information.
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>=} metadata - Optional metadata to include with the log.
   */
  debug(message: string, metadata?: Record<string, unknown>): void;
}

/**
 * @constant LOGGER_INTERFACE_TYPE
 * @description Symbol identifier for binding the ILogger interface in DI containers.
 */
export const LOGGER_INTERFACE_TYPE = Symbol.for('ILogger');
