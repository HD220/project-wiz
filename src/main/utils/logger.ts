import pino from "pino";

// Determine log level based on environment
const logLevel = process.env["NODE_ENV"] === "production" ? "info" : "debug";

// Create logger instance
const logger = pino({
  level: logLevel,
  ...(process.env["NODE_ENV"] !== "production" && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    },
  }),
});

// Context-specific loggers cache
const contextLoggers = new Map<string, pino.Logger>();

/**
 * Get a logger instance with specific context
 * This is the main function to use throughout the application
 */
export function getLogger(context: string): pino.Logger {
  if (!contextLoggers.has(context)) {
    contextLoggers.set(context, logger.child({ context }));
  }
  return contextLoggers.get(context)!;
}

// Default logger export for simple cases
export default logger;
