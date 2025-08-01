import pino from "pino";

import { getLoggerConfig } from "../config";

// Global logger instance - created once and reused
let globalLogger: pino.Logger | null = null;

// Context-specific loggers cache
const contextLoggers = new Map<string, Logger>();

/**
 * Logger wrapper class that provides a familiar console.log-like interface
 * while using Pino internally for structured logging
 */
export class Logger {
  private pinoLogger: pino.Logger;

  constructor(pinoLogger: pino.Logger) {
    this.pinoLogger = pinoLogger;
  }

  /**
   * Log debug messages with optional data
   * @param message - The log message
   * @param data - Optional data to log (objects, strings, numbers, etc.)
   */
  debug(message: string, ...data: any[]): void {
    if (data.length === 0) {
      this.pinoLogger.debug(message);
    } else if (data.length === 1 && typeof data[0] === 'object' && data[0] !== null) {
      this.pinoLogger.debug(data[0], message);
    } else {
      this.pinoLogger.debug({ data }, message);
    }
  }

  /**
   * Log info messages with optional data
   * @param message - The log message
   * @param data - Optional data to log (objects, strings, numbers, etc.)
   */
  info(message: string, ...data: any[]): void {
    if (data.length === 0) {
      this.pinoLogger.info(message);
    } else if (data.length === 1 && typeof data[0] === 'object' && data[0] !== null) {
      this.pinoLogger.info(data[0], message);
    } else {
      this.pinoLogger.info({ data }, message);
    }
  }

  /**
   * Log warning messages with optional data
   * @param message - The log message
   * @param data - Optional data to log (objects, strings, numbers, etc.)
   */
  warn(message: string, ...data: any[]): void {
    if (data.length === 0) {
      this.pinoLogger.warn(message);
    } else if (data.length === 1 && typeof data[0] === 'object' && data[0] !== null) {
      this.pinoLogger.warn(data[0], message);
    } else {
      this.pinoLogger.warn({ data }, message);
    }
  }

  /**
   * Log error messages with optional data
   * @param message - The log message
   * @param data - Optional data to log (objects, strings, numbers, etc.)
   */
  error(message: string, ...data: any[]): void {
    if (data.length === 0) {
      this.pinoLogger.error(message);
    } else if (data.length === 1 && typeof data[0] === 'object' && data[0] !== null) {
      this.pinoLogger.error(data[0], message);
    } else {
      this.pinoLogger.error({ data }, message);
    }
  }

  /**
   * Create a child logger with additional context
   * @param bindings - Additional context to bind to all logs
   * @returns New Logger instance with additional context
   */
  child(bindings: Record<string, any>): Logger {
    return new Logger(this.pinoLogger.child(bindings));
  }

  /**
   * Get the underlying Pino logger instance (for advanced usage)
   * @returns The underlying Pino logger
   */
  getPinoInstance(): pino.Logger {
    return this.pinoLogger;
  }
}

/**
 * Create the global logger instance with shared configuration
 * This ensures both main and worker processes use identical logging setup
 */
function createGlobalLogger(): pino.Logger {
  const config = getLoggerConfig();

  const loggerOptions: pino.LoggerOptions = {
    level: config.level,
  };

  // Add pretty printing for development
  if (config.prettyPrint) {
    loggerOptions.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    };
  }

  return pino(loggerOptions);
}

/**
 * Get the global logger instance (creates it if needed)
 * @returns The global Pino logger instance
 */
export function getGlobalLogger(): pino.Logger {
  if (!globalLogger) {
    globalLogger = createGlobalLogger();
  }
  return globalLogger;
}

/**
 * Get a logger instance with specific context
 * This is the main function to use throughout the application
 * @param context - The context string to identify log source
 * @returns A Logger wrapper with the specified context
 */
export function getLogger(context: string): Logger {
  if (!contextLoggers.has(context)) {
    const globalLogger = getGlobalLogger();
    const pinoChild = globalLogger.child({ context });
    contextLoggers.set(context, new Logger(pinoChild));
  }
  return contextLoggers.get(context)!;
}

/**
 * Create a new logger instance with custom configuration
 * Useful for special cases where different logging config is needed
 * @param options - Custom Pino logger options
 * @returns A new Logger wrapper instance
 */
export function createCustomLogger(options: pino.LoggerOptions): Logger {
  return new Logger(pino(options));
}

/**
 * Reset the global logger and context cache
 * Useful for testing or when environment changes
 */
export function resetLoggerCache(): void {
  globalLogger = null;
  contextLoggers.clear();
}

/**
 * Get the global logger wrapped in our Logger class
 * @returns Logger wrapper instance
 */
export function getGlobalLoggerWrapper(): Logger {
  return new Logger(getGlobalLogger());
}

// Default logger export for simple cases
export default getGlobalLoggerWrapper;