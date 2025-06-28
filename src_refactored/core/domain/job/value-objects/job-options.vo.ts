// src_refactored/core/domain/job/value-objects/job-options.vo.ts
import { AbstractValueObject } from '@/core/common/value-objects/base.vo';

import { ValueError } from '@/domain/common/errors';

import { JobIdVO } from './job-id.vo';
import { JobPriorityVO } from './job-priority.vo';
import { RepeatOptionsVO, RepeatOptionsProps } from './repeat-options.vo';

// Define interfaces for sub-options first, as they are part of JobOptions properties
export interface RetryStrategyOptions {
  maxAttempts: number; // Total number of attempts (1 means no retries)
  // Defines delay in ms for next attempt. Can be fixed or exponential.
  // If 'exponential', baseDelay is used: delay = baseDelay * (2 ** (attemptsMade -1))
  // If 'custom', a custom function name or identifier could be stored, logic handled by worker/scheduler.
  backoff?: { type: 'fixed' | 'exponential'; delayMs: number } | false; // false means no automatic retry delay
}

// This interface mirrors the JobOptions defined in the API design document (Section 4.1)
// It's used for constructing the JobOptionsVO.
// RepeatOptionsProps is used for construction, but JobOptionsVO will hold a RepeatOptionsVO instance.
export interface IJobOptionsData {
  jobId?: string; // Custom Job ID
  priority?: number;
  delay?: number; // Initial delay in milliseconds
  attempts?: number; // Max attempts (shortcut, preferred to use retryStrategy.maxAttempts)
  retryStrategy?: RetryStrategyOptions; // More detailed retry config
  lifo?: boolean; // Process LIFO instead of FIFO
  removeOnComplete?: boolean | number; // True to remove, or number of jobs to keep
  removeOnFail?: boolean | number;    // True to remove, or number of jobs to keep
  repeat?: RepeatOptionsProps; // Use Props for construction
  dependsOnJobIds?: string[]; // Array of Job IDs
  parentId?: string;
  timeout?: number; // Max processing time in ms for a single attempt by a worker
}

// Properties stored within JobOptionsVO, including the actual VO for repeat.
export interface JobOptionsVOProps {
  jobId?: string;
  priority: number;
  delay: number;
  attempts: number; // Effective max attempts
  retryStrategy: RetryStrategyOptions;
  lifo: boolean;
  removeOnComplete: boolean | number;
  removeOnFail: boolean | number;
  repeat?: RepeatOptionsVO; // Store the VO instance
  dependsOnJobIds?: string[];
  parentId?: string;
  timeout: number;
}


// The actual Value Object
export class JobOptionsVO extends AbstractValueObject<Readonly<JobOptionsVOProps>> {
  private constructor(props: Readonly<JobOptionsVOProps>) {
    super(props);
  }

  private static validateBaseOptions(options: IJobOptionsData, mergedOptions: IJobOptionsData & { priority: number, delay: number, timeout: number }): void {
    if (mergedOptions.jobId && !JobIdVO.isValidUUID(mergedOptions.jobId)) {
      throw new ValueError('Custom JobId in options is not a valid UUID.');
    }
    JobPriorityVO.create(mergedOptions.priority); // Will throw ValueError if invalid

    if (mergedOptions.delay < 0) {
      throw new ValueError('JobOptions delay cannot be negative.');
    }
    if (mergedOptions.timeout < 0) {
      throw new ValueError('JobOptions timeout cannot be negative.');
    }
  }

  private static determineRetryStrategy(
    options?: IJobOptionsData,
    defaults?: { attempts: number; retryStrategy: RetryStrategyOptions },
  ): { effectiveAttempts: number; finalRetryStrategy: RetryStrategyOptions } {
    let effectiveAttempts = defaults?.attempts ?? 1;
    let finalRetryStrategy = defaults?.retryStrategy ?? { maxAttempts: 1, backoff: false };

    if (options?.retryStrategy) {
      if (options.retryStrategy.maxAttempts < 1) {
        throw new ValueError('JobOptions retryStrategy.maxAttempts must be at least 1.');
      }
      if (options.retryStrategy.backoff && options.retryStrategy.backoff.delayMs < 0) {
        throw new ValueError('JobOptions retryStrategy.backoff.delayMs cannot be negative.');
      }
      finalRetryStrategy = options.retryStrategy;
      effectiveAttempts = options.retryStrategy.maxAttempts;
    } else if (options?.attempts) {
      if (options.attempts < 1) {
        throw new ValueError('JobOptions attempts must be at least 1.');
      }
      effectiveAttempts = options.attempts;
      finalRetryStrategy = { maxAttempts: options.attempts, backoff: false };
    }
    return { effectiveAttempts, finalRetryStrategy };
  }

  private static validateDependencies(mergedOptions: IJobOptionsData): void {
    if (mergedOptions.dependsOnJobIds) {
      mergedOptions.dependsOnJobIds.forEach((id: string) => {
        if (!JobIdVO.isValidUUID(id)) {
          throw new ValueError(`Invalid JobId in dependsOnJobIds: ${id}`);
        }
      });
    }
    if (mergedOptions.parentId && !JobIdVO.isValidUUID(mergedOptions.parentId)) {
      throw new ValueError('Invalid JobId for parentId.');
    }
  }

  public static create(options?: IJobOptionsData): JobOptionsVO {
    const defaults = {
      priority: JobPriorityVO.default().value,
      delay: 0,
      attempts: 1, // This will be the effective attempts based on logic below
      retryStrategy: { maxAttempts: 1, backoff: false } as RetryStrategyOptions,
      lifo: false,
      removeOnComplete: false,
      removeOnFail: false,
      timeout: 0,
    };

    // Ensure mergedOptions has the types from defaults for validation functions
    const mergedOptions: IJobOptionsData & typeof defaults = { ...defaults, ...options };

    JobOptionsVO.validateBaseOptions(options ?? {}, mergedOptions);
    const { effectiveAttempts, finalRetryStrategy } = JobOptionsVO.determineRetryStrategy(options, defaults);
    JobOptionsVO.validateDependencies(mergedOptions);

    const repeatVO = mergedOptions.repeat ? RepeatOptionsVO.create(mergedOptions.repeat) : undefined;

    const voProps: JobOptionsVOProps = {
      jobId: mergedOptions.jobId,
      priority: mergedOptions.priority,
      delay: mergedOptions.delay,
      attempts: effectiveAttempts,
      retryStrategy: finalRetryStrategy,
      lifo: mergedOptions.lifo,
      removeOnComplete: mergedOptions.removeOnComplete,
      removeOnFail: mergedOptions.removeOnFail,
      repeat: repeatVO,
      dependsOnJobIds: mergedOptions.dependsOnJobIds,
      parentId: mergedOptions.parentId,
      timeout: mergedOptions.timeout,
    };

    return new JobOptionsVO(Object.freeze(voProps));
  }

  public static default(): JobOptionsVO {
    return JobOptionsVO.create({});
  }

  // Accessors for convenience
  get jobId(): string | undefined { return this.props.jobId; }
  get priority(): number { return this.props.priority; }
  get delay(): number { return this.props.delay; }
  get attempts(): number { return this.props.attempts; }
  get retryStrategy(): RetryStrategyOptions { return this.props.retryStrategy; }
  get lifo(): boolean { return this.props.lifo; }
  get removeOnComplete(): boolean | number { return this.props.removeOnComplete; }
  get removeOnFail(): boolean | number { return this.props.removeOnFail; }
  get repeat(): RepeatOptionsVO | undefined { return this.props.repeat; }
  get dependsOnJobIds(): string[] | undefined { return this.props.dependsOnJobIds; }
  get parentId(): string | undefined { return this.props.parentId; }
  get timeout(): number { return this.props.timeout; }

  // equals method from AbstractValueObject will do a deep comparison of props
}
