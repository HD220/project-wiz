// src_refactored/core/domain/job/value-objects/job-execution-logs.vo.ts
import { AbstractValueObject } from '@/core/common/value-objects/base.vo';

import { JobExecutionLogEntryVO, JobExecutionLogEntryProps } from './job-execution-log-entry.vo'; // Assuming LogLevel is also exported or defined here

export class JobExecutionLogsVO extends AbstractValueObject<ReadonlyArray<JobExecutionLogEntryVO>> {
  private constructor(props: ReadonlyArray<JobExecutionLogEntryVO>) {
    // Sort logs by timestamp for consistent representation, oldest first
    super(Object.freeze([...props].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())));
  }

  public static create(entries?: JobExecutionLogEntryVO[]): JobExecutionLogsVO {
    return new JobExecutionLogsVO(entries || []);
  }

  public static empty(): JobExecutionLogsVO {
    return new JobExecutionLogsVO([]);
  }

  public get entries(): ReadonlyArray<JobExecutionLogEntryVO> {
    return this.props;
  }

  public addEntry(entry: JobExecutionLogEntryVO): JobExecutionLogsVO {
    // Returns a new VO instance with the added entry
    return new JobExecutionLogsVO([...this.props, entry]);
  }

  public addLog(
    message: string,
    level?: JobExecutionLogEntryProps['level'], // Correctly reference LogLevel from props
    details?: Record<string, any>,
  ): JobExecutionLogsVO {
    const entry = JobExecutionLogEntryVO.create(message, level, details);
    return this.addEntry(entry);
  }

  public count(): number {
    return this.props.length;
  }
}
