// Renderer-specific logger configuration
// Uses browser-compatible Pino setup without process.env dependencies

import pino from "pino";
import { getRendererLoggerConfig } from "../config/renderer";

// Global logger instance - created once and reused
let globalLogger: pino.Logger | null = null;

// Context-specific loggers cache
const contextLoggers = new Map<string, pino.Logger>();

/**
 * Create the global logger instance for renderer process
 * This ensures renderer process has safe logging without process.env access
 */
function createRendererGlobalLogger(): pino.Logger {
  const config = getRendererLoggerConfig();

  const loggerOptions: pino.LoggerOptions = {
    level: config.level,
    browser: {
      asObject: false, // Better for development console
    },
  };

  // In renderer, we always use browser mode with pretty printing
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
 * Get the global logger instance for renderer (creates it if needed)
 * @returns The global Pino logger instance
 */
export function getRendererGlobalLogger(): pino.Logger {
  if (!globalLogger) {
    globalLogger = createRendererGlobalLogger();
  }
  return globalLogger;
}

/**
 * Get a logger instance with specific context for renderer process
 * This is the main function to use in renderer components
 * @param context - The context string to identify log source
 * @returns A child logger with the specified context
 */
export function getRendererLogger(context: string): pino.Logger {
  if (!contextLoggers.has(context)) {
    const globalLogger = getRendererGlobalLogger();
    contextLoggers.set(context, globalLogger.child({ context }));
  }
  return contextLoggers.get(context)!;
}

/**
 * Reset the renderer logger cache
 * Useful for testing or when configuration changes
 */
export function resetRendererLoggerCache(): void {
  globalLogger = null;
  contextLoggers.clear();
}

// Default logger export for simple cases
export default getRendererGlobalLogger;