// src_refactored/core/domain/job/value-objects/job-options.vo.ts

import { AbstractValueObject } from '@/core/common/value-objects/base.vo';
import { DomainError } from '@/core/domain/common/errors';

/**
 * Options for how a job should be retried in case of failure.
 * `type` can be 'fixed' (retry after a fixed delay) or 'exponential' (delay increases exponentially).
 * `delay` is the base delay in milliseconds.
 * `jitter` is an optional percentage (0.0 to 1.0) to randomize the delay.
 */
export interface IJobBackoffOptions {
  type: 'fixed' | 'exponential';
  delay: number; // in milliseconds
  jitter?: number; // percentage (0.0 to 1.0)
}

/**
 * A function that determines the backoff delay for a job.
 * @param attemptsMade The number of attempts already made for the job.
 * @param error The error that caused the last failure.
 * @returns The delay in milliseconds, or -1 to indicate no further retries.
 */
export type JobBackoffStrategyFn = (attemptsMade: number, error: Error) => number;

/**
 * Options for removing a job automatically after completion or failure.
 * `age` is the maximum age in seconds for jobs to keep.
 * `count` is the maximum number of jobs to keep. (0 means keep all, -1 means keep none of the specified type)
 * If both age and count are specified, the criteria that is met first will trigger the removal.
 */
export interface IJobRemovalOptions {
  age?: number; // Maximum age in seconds for jobs to keep.
  count?: number; // Maximum number of jobs to keep. 0 means keep all (of this type), -1 means keep none.
}
export interface IJobOptions {
  priority?: number; // Lower numbers have higher priority
  delay?: number; // Delay in milliseconds before the job can be processed
  attempts?: number; // Total number of attempts to try the job until it completes
  backoff?: IJobBackoffOptions | JobBackoffStrategyFn; // Backoff strategy for retries
  removeOnComplete?: boolean | IJobRemovalOptions; // If true, remove job when successfully completed. If object, specifies retention rules.
  removeOnFail?: boolean | IJobRemovalOptions; // If true, remove job when it fails after all attempts. If object, specifies retention rules.
  jobId?: string; // Optional custom job ID
  // TODO: Add `dependsOn?: string[] | { jobId: string; status: 'completed' | 'failed' }[]` in the future if needed
  // TODO: Add `repeat?: IRepeatOptions` in thefuture if needed (align with BullMQ's new Job Schedulers)
  timeout?: number; // Optional: max time in ms for a job to run
  maxStalledCount?: number; // Optional: max times a job can be stalled before failing
}

export class JobOptionsVO extends AbstractValueObject<IJobOptions> {
  private constructor(props: IJobOptions) {
    super(JobOptionsVO.sanitize(props));
  }

  public static create(options?: IJobOptions): JobOptionsVO {
    const defaults: IJobOptions = {
      priority: 0,
      delay: 0,
      attempts: 1,
      removeOnComplete: true, // Default to remove on complete
      removeOnFail: false,    // Default to keep on fail for inspection
      maxStalledCount: 3,     // Default max stalled count
    };
    return new JobOptionsVO({ ...defaults, ...(options || {}) });
  }

  private static sanitize(props: IJobOptions): IJobOptions {
    const sanitized: IJobOptions = { ...props };

    sanitized.priority = Math.max(0, props.priority || 0);
    sanitized.delay = Math.max(0, props.delay || 0);
    sanitized.attempts = Math.max(1, props.attempts || 1); // At least 1 attempt
    sanitized.maxStalledCount = Math.max(0, props.maxStalledCount || 0); // Default or provided

    if (props.backoff && typeof props.backoff === 'object') {
      if (props.backoff.delay <= 0) {
        throw new DomainError('Backoff delay must be greater than 0.');
      }
      if (props.backoff.jitter && (props.backoff.jitter < 0 || props.backoff.jitter > 1)) {
        throw new DomainError('Backoff jitter must be between 0 and 1.');
      }
    }

    // Sanitize removeOnComplete
    if (typeof props.removeOnComplete === 'object') {
      if (props.removeOnComplete.age !== undefined && props.removeOnComplete.age < 0) {
        throw new DomainError('removeOnComplete.age cannot be negative.');
      }
      if (props.removeOnComplete.count !== undefined && props.removeOnComplete.count < -1) {
        throw new DomainError('removeOnComplete.count cannot be less than -1.');
      }
    } else if (typeof props.removeOnComplete !== 'boolean' && props.removeOnComplete !== undefined) {
      throw new DomainError('removeOnComplete must be a boolean or an IJobRemovalOptions object.');
    }

    // Sanitize removeOnFail
    if (typeof props.removeOnFail === 'object') {
      if (props.removeOnFail.age !== undefined && props.removeOnFail.age < 0) {
        throw new DomainError('removeOnFail.age cannot be negative.');
      }
      if (props.removeOnFail.count !== undefined && props.removeOnFail.count < -1) {
        throw new DomainError('removeOnFail.count cannot be less than -1.');
      }
    } else if (typeof props.removeOnFail !== 'boolean' && props.removeOnFail !== undefined) {
      throw new DomainError('removeOnFail must be a boolean or an IJobRemovalOptions object.');
    }

    return sanitized;
  }

  get priority(): number { return this.props.priority!; }
  get delay(): number { return this.props.delay!; }
  get attempts(): number { return this.props.attempts!; }
  get backoff(): IJobBackoffOptions | JobBackoffStrategyFn | undefined { return this.props.backoff; }
  get removeOnComplete(): boolean | IJobRemovalOptions { return this.props.removeOnComplete!; }
  get removeOnFail(): boolean | IJobRemovalOptions { return this.props.removeOnFail!; }
  get jobId(): string | undefined { return this.props.jobId; }
  get timeout(): number | undefined { return this.props.timeout; }
  get maxStalledCount(): number { return this.props.maxStalledCount!; }


  public toPersistence(): IJobOptions {
    // For a custom backoff function, we might need to store its name or a reference
    // if it's not directly serializable. For now, assume it's handled or not persisted if function.
    // For simplicity, this example directly returns props, but in a real scenario,
    // you might transform function references or other non-serializable parts.
    const persistenceProps = { ...this.props };
    if (typeof persistenceProps.backoff === 'function') {
        // Decide how to handle function persistence.
        // Option 1: Store a well-known name of the strategy
        // Option 2: Do not persist the function itself (rely on code for custom strategies)
        // For now, let's remove it if it's a function to avoid serialization issues with simple JSON.
        // The application layer would need to reconstruct it if 'custom' type is indicated.
        // Or, better, the IJobBackoffOptions would have a 'type: "custom"' and a 'name?: string'
        // This VO is more about runtime validation and defaults.
        // Let's assume for now the 'backoff' field in the DB will store the IJobBackoffOptions object
        // and custom functions are applied at runtime by the worker based on some other config or job name.
        // So, if it's a function, it won't be directly part of the serialized options in this simple model.
        // A more advanced system would handle this more gracefully.
        // For this iteration, we'll allow the object form to be persisted.
    }
    return persistenceProps;
  }
}
