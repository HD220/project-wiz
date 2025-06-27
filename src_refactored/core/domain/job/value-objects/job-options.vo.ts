// src_refactored/core/domain/job/value-objects/job-options.vo.ts
import { AbstractValueObject } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/domain/common/errors';

import { JobIdVO } from './job-id.vo';
import { JobPriorityVO } from './job-priority.vo';

// Define interfaces for sub-options first, as they are part of JobOptions properties
export interface RetryStrategyOptions {
  maxAttempts: number; // Total number of attempts (1 means no retries)
  // Defines delay in ms for next attempt. Can be fixed or exponential.
  // If 'exponential', baseDelay is used: delay = baseDelay * (2 ** (attemptsMade -1))
  // If 'custom', a custom function name or identifier could be stored, logic handled by worker/scheduler.
  backoff?: { type: 'fixed' | 'exponential'; delayMs: number } | false; // false means no automatic retry delay
}

export interface RepeatOptions {
  cron?: string; // Standard cron string
  every?: number; // Interval in milliseconds
  limit?: number; // Max number of repetitions
  startDate?: Date;
  endDate?: Date;
  tz?: string; // Timezone for cron e.g. 'America/New_York'
  // immediate?: boolean; // Whether to run immediately upon adding a repeatable job (handled at Queue.add)
}

// This interface mirrors the JobOptions defined in the API design document (Section 4.1)
// It's used for constructing the JobOptionsVO.
export interface IJobOptions {
  jobId?: string; // Custom Job ID
  priority?: number;
  delay?: number; // Initial delay in milliseconds
  attempts?: number; // Max attempts (shortcut, preferred to use retryStrategy.maxAttempts)
  retryStrategy?: RetryStrategyOptions; // More detailed retry config
  lifo?: boolean; // Process LIFO instead of FIFO
  removeOnComplete?: boolean | number; // True to remove, or number of jobs to keep
  removeOnFail?: boolean | number;    // True to remove, or number of jobs to keep
  repeat?: RepeatOptions;
  dependsOnJobIds?: string[]; // Array of Job IDs
  parentId?: string;
  timeout?: number; // Max processing time in ms for a single attempt by a worker
}

// The actual Value Object
export class JobOptionsVO extends AbstractValueObject<Readonly<IJobOptions>> {
  private constructor(props: Readonly<IJobOptions>) {
    super(props);
  }

  public static create(options?: IJobOptions): JobOptionsVO {
    const defaults: IJobOptions = {
      priority: JobPriorityVO.default().value,
      delay: 0,
      attempts: 1,
      retryStrategy: { maxAttempts: 1, backoff: false },
      lifo: false,
      removeOnComplete: false, // Default: keep completed jobs
      removeOnFail: false,     // Default: keep failed jobs
      timeout: 0, // 0 means no timeout
    };

    const mergedOptions = { ...defaults, ...options };

    // Validate specific options
    if (mergedOptions.jobId && !JobIdVO.isValidUUID(mergedOptions.jobId)) {
      throw new ValueError('Custom JobId in options is not a valid UUID.');
    }
    if (mergedOptions.priority) { // Validate if provided
      JobPriorityVO.create(mergedOptions.priority); // Will throw ValueError if invalid
    }
    if (mergedOptions.delay && mergedOptions.delay < 0) {
      throw new ValueError('JobOptions delay cannot be negative.');
    }
    if (mergedOptions.attempts && mergedOptions.attempts < 1) {
      throw new ValueError('JobOptions attempts must be at least 1.');
    }
    if (mergedOptions.retryStrategy) {
      if (mergedOptions.retryStrategy.maxAttempts < 1) {
        throw new ValueError('JobOptions retryStrategy.maxAttempts must be at least 1.');
      }
      if (mergedOptions.retryStrategy.backoff && mergedOptions.retryStrategy.backoff.delayMs < 0) {
        throw new ValueError('JobOptions retryStrategy.backoff.delayMs cannot be negative.');
      }
    }
    if (mergedOptions.timeout && mergedOptions.timeout < 0) {
      throw new ValueError('JobOptions timeout cannot be negative.');
    }
    if (mergedOptions.dependsOnJobIds) {
      mergedOptions.dependsOnJobIds.forEach(id => {
        if (!JobIdVO.isValidUUID(id)) {
          throw new ValueError(`Invalid JobId in dependsOnJobIds: ${id}`);
        }
      });
    }
    if (mergedOptions.parentId && !JobIdVO.isValidUUID(mergedOptions.parentId)) {
      throw new ValueError('Invalid JobId for parentId.');
    }
    // Further validation for repeat options (cron syntax, etc.) could be added here or in RepeatOptionsVO if created.

    // If 'attempts' is provided directly, ensure it aligns with retryStrategy or sets a default one.
    if (options?.attempts && !options?.retryStrategy) {
      mergedOptions.retryStrategy = { maxAttempts: options.attempts, backoff: false };
    } else if (options?.attempts && options?.retryStrategy && options.attempts !== options.retryStrategy.maxAttempts) {
      // If both are provided, retryStrategy.maxAttempts takes precedence, or we could throw an error for inconsistency.
      // For now, let's assume options.attempts is a shorthand for retryStrategy.maxAttempts if retryStrategy.backoff is not defined.
      // If retryStrategy is fully defined, its maxAttempts should be used.
       mergedOptions.retryStrategy = { ...mergedOptions.retryStrategy, maxAttempts: options.attempts };
    }


    return new JobOptionsVO(Object.freeze(mergedOptions));
  }

  public static default(): JobOptionsVO {
    return JobOptionsVO.create({});
  }

  // Accessors for convenience, though direct access to props.value is also possible
  get jobId(): string | undefined { return this.props.jobId; }
  get priority(): number { return this.props.priority!; } // Non-null assertion due to default
  get delay(): number { return this.props.delay!; }
  get attempts(): number {
    return this.props.retryStrategy?.maxAttempts || this.props.attempts || 1;
  }
  get retryStrategy(): RetryStrategyOptions | undefined { return this.props.retryStrategy; }
  get lifo(): boolean { return this.props.lifo!; }
  get removeOnComplete(): boolean | number { return this.props.removeOnComplete!; }
  get removeOnFail(): boolean | number { return this.props.removeOnFail!; }
  get repeat(): RepeatOptions | undefined { return this.props.repeat; }
  get dependsOnJobIds(): string[] | undefined { return this.props.dependsOnJobIds; }
  get parentId(): string | undefined { return this.props.parentId; }
  get timeout(): number { return this.props.timeout!; }

  // equals method from AbstractValueObject will do a deep comparison of props
}
