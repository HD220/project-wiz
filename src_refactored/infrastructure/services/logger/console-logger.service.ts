// src_refactored/infrastructure/services/logger/console-logger.service.ts
import { injectable, unmanaged } from 'inversify';

import { ILoggerService } from '@/core/common/services/i-logger.service';

@injectable()
export class ConsoleLoggerService implements ILoggerService {
  private context?: string;

  // Allow context to be optional or set via a method if preferred
  constructor(@unmanaged() context?: string) {
    this.context = context;
  }

  private formatMessage(level: string, message: string, meta?: any[]): string {
    const timestamp = new Date().toISOString();
    const contextString = this.context ? `[${this.context}] ` : '';
    let logMessage = `${timestamp} [${level.toUpperCase()}] ${contextString}${message}`;
    if (meta && meta.length > 0) {
      // Basic meta formatting, can be expanded
      logMessage += ` ${meta.map(m => typeof m === 'object' ? JSON.stringify(m) : m).join(' ')}`;
    }
    return logMessage;
  }

  public log(message: string, ...meta: any[]): void {
    console.log(this.formatMessage('log', message, meta));
  }

  public error(message: string, error?: Error | any, ...meta: any[]): void {
    const fullMeta = error ? [error, ...meta] : meta;
    console.error(this.formatMessage('error', message, fullMeta));
  }

  public warn(message: string, ...meta: any[]): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  public info(message: string, ...meta: any[]): void {
    console.info(this.formatMessage('info', message, meta));
  }

  public debug(message: string, ...meta: any[]): void {
    // In production, debug logs might be conditional based on an env var
    console.debug(this.formatMessage('debug', message, meta));
  }

  public setContext(context: string): void {
    this.context = context;
  }
}
