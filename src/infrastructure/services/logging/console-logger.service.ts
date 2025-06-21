// src/infrastructure/services/logging/console-logger.service.ts

import { ILogger, LogContext } from '../../../core/ports/services/logger.interface';

export class ConsoleLogger implements ILogger {
  private formatLogObject(level: string, message: string, context?: LogContext, error?: Error): Record<string, any> {
    const logObject: Record<string, any> = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context || {}),
    };

    if (error) {
      logObject.error = {
        name: error.name,
        message: error.message,
        // Stack traces can be very long; consider summarizing or making conditional based on environment
        stack: error.stack?.split('\n').map(s => s.trim()),
      };
      // If the error is one of our custom errors, add its specific properties
      // This requires checking 'instanceof' or properties, which can be verbose here.
      // A simpler approach for now is to just log standard error properties.
      // More advanced logging could inspect 'error' for custom props.
      // Example: if (error instanceof ToolExecutionError) logObject.error.toolName = error.toolName;
    }
    return logObject;
  }

  private logToConsole(level: string, logObject: Record<string, any>): void {
    const output = JSON.stringify(logObject, null, 2); // Pretty print JSON
    switch (level) {
      case 'DEBUG':
        console.debug(output);
        break;
      case 'INFO':
        console.info(output);
        break;
      case 'WARN':
        console.warn(output);
        break;
      case 'ERROR':
        console.error(output);
        break;
      default:
        console.log(output);
    }
  }

  public debug(message: string, context?: LogContext): void {
    const logObject = this.formatLogObject('DEBUG', message, context);
    this.logToConsole('DEBUG', logObject);
  }

  public info(message: string, context?: LogContext): void {
    const logObject = this.formatLogObject('INFO', message, context);
    this.logToConsole('INFO', logObject);
  }

  public warn(message: string, context?: LogContext): void {
    const logObject = this.formatLogObject('WARN', message, context);
    this.logToConsole('WARN', logObject);
  }

  public error(message: string, error?: Error, context?: LogContext): void {
    const logObject = this.formatLogObject('ERROR', message, context, error);
    this.logToConsole('ERROR', logObject);
  }
}
