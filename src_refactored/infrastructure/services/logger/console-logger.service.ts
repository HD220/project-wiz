import { injectable, unmanaged } from "inversify";

import { ILoggerService } from "@/core/common/services/i-logger.service";

@injectable()
export class ConsoleLoggerService implements ILoggerService {
  private context?: string;

  constructor(@unmanaged() context?: string) {
    this.context = context;
  }

  private formatMessage(
    level: string,
    message: string,
    meta?: unknown[]
  ): string {
    const timestamp = new Date().toISOString();
    const contextString = this.context ? `[${this.context}] ` : "";
    let logMessage = `${timestamp} [${level.toUpperCase()}] ${contextString}${message}`;
    if (meta && meta.length > 0) {
      logMessage += ` ${meta.map((meta) => (typeof meta === "object" ? JSON.stringify(meta) : meta)).join(" ")}`;
    }
    return logMessage;
  }

  public log(message: string, ...meta: unknown[]): void {
    console.log(this.formatMessage("log", message, meta));
  }

  public error(
    message: string,
    error?: Error | unknown,
    ...meta: unknown[]
  ): void {
    const fullMeta = error ? [error, ...meta] : meta;
    console.error(this.formatMessage("error", message, fullMeta));
  }

  public warn(message: string, ...meta: unknown[]): void {
    console.warn(this.formatMessage("warn", message, meta));
  }

  public info(message: string, ...meta: unknown[]): void {
    console.info(this.formatMessage("info", message, meta));
  }

  public debug(message: string, ...meta: unknown[]): void {
    console.debug(this.formatMessage("debug", message, meta));
  }

  public setContext(context: string): void {
    this.context = context;
  }
}
