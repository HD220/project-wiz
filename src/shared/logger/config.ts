import pino from "pino";

import { getLoggerConfig } from "../config";

// Global logger instance - created once and reused
let globalLogger: pino.Logger | null = null;

// Context-specific loggers cache
const contextLoggers = new Map<string, pino.Logger>();

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
 * @returns A child logger with the specified context
 */
export function getLogger(context: string): pino.Logger {
  if (!contextLoggers.has(context)) {
    const globalLogger = getGlobalLogger();
    contextLoggers.set(context, globalLogger.child({ context }));
  }
  return contextLoggers.get(context)!;
}

/**
 * Create a new logger instance with custom configuration
 * Useful for special cases where different logging config is needed
 * @param options - Custom Pino logger options
 * @returns A new Pino logger instance
 */
export function createCustomLogger(options: pino.LoggerOptions): pino.Logger {
  return pino(options);
}

/**
 * Reset the global logger and context cache
 * Useful for testing or when environment changes
 */
export function resetLoggerCache(): void {
  globalLogger = null;
  contextLoggers.clear();
}

// Default logger export for simple cases
export default getGlobalLogger;