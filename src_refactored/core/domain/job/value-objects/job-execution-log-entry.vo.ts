// src_refactored/core/domain/job/value-objects/job-execution-log-entry.vo.ts
import { AbstractValueObject } from '@/core/common/value-objects/base.vo';

import { ValueError } from '@/domain/common/errors';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

export interface JobExecutionLogEntryProps {
  readonly timestamp: Date;
  readonly message: string;
  readonly level: LogLevel;
  readonly details?: Record<string, any>; // Optional structured details
}

export class JobExecutionLogEntryVO extends AbstractValueObject<JobExecutionLogEntryProps> {
  private constructor(props: JobExecutionLogEntryProps) {
    super(props);
  }

  public static create(
    message: string,
    level: LogLevel = 'INFO',
    details?: Record<string, any>,
    timestamp?: Date,
  ): JobExecutionLogEntryVO {
    if (!message || message.trim() === '') {
      throw new ValueError('Log message cannot be empty.');
    }
    const validLevels: LogLevel[] = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    if (!validLevels.includes(level)) {
      throw new ValueError(`Invalid log level: ${level}. Must be one of ${validLevels.join(', ')}.`);
    }

    return new JobExecutionLogEntryVO(
      Object.freeze({
        timestamp: timestamp || new Date(),
        message,
        level,
        details: details ? Object.freeze({ ...details }) : undefined,
      }),
    );
  }

  get timestamp(): Date { return this.props.timestamp; }
  get message(): string { return this.props.message; }
  get level(): LogLevel { return this.props.level; }
  get details(): Record<string, any> | undefined { return this.props.details; }

  public toString(): string {
    return `[${this.props.timestamp.toISOString()}] [${this.props.level}] ${this.props.message}${this.props.details ? ' ' + JSON.stringify(this.props.details) : ''}`;
  }
}
