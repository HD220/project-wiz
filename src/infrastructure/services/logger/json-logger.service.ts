import {
  ILogger,
  JobLogger,
  LogLevel,
} from "../../../core/ports/logger/ilogger.interface";
import { Job } from "../../../core/domain/entities/jobs/job.entity";

export class JsonLogger implements ILogger, JobLogger {
  private context: Record<string, unknown> = {};

  constructor(private readonly serviceName: string) {}

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      ...this.context,
      ...context,
    };

    const logMethod =
      level === LogLevel.ERROR
        ? console.error
        : level === LogLevel.WARN
          ? console.warn
          : console.log;

    logMethod(JSON.stringify(logEntry));
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context);
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  withJobContext(job: Job): JobLogger {
    const logger = new JsonLogger(this.serviceName);
    logger.context = {
      ...this.context,
      jobId: job.getId(),
      jobStatus: job.getStatus().current,
      jobPriority: job.getPriority(),
      createdAt: job.getCreatedAt().toISOString(),
    };
    return logger;
  }
}
