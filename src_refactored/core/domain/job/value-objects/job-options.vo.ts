import { z } from 'zod';

import { AbstractValueObject } from '@/core/common/value-objects/base.vo';
import { ValueError } from '@/core/domain/common/errors';

/**
 * Options for how a job should be retried in case of failure.
 * `type` can be 'fixed' (retry after a fixed delay) or 'exponential' (delay increases exponentially).
 * `delay` is the base delay in milliseconds.
 * `jitter` is an optional percentage (0.0 to 1.0) to randomize the delay.
 */
export interface IJobBackoffOptions {
  type: 'fixed' | 'exponential';
  delay: number;
  jitter?: number;
}

const JobBackoffSchema = z.object({
  type: z.enum(['fixed', 'exponential']),
  delay: z.number().int().min(0, 'Backoff delay must be greater than or equal to 0.'),
  jitter: z.number().min(0).max(1).optional(),
});

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
  age?: number;
  count?: number;
}

const JobRemovalSchema = z.object({
  age: z.number().int().min(0, 'Removal age cannot be negative.').optional(),
  count: z.number().int().min(-1, 'Removal count cannot be less than -1.').optional(),
});

export interface IJobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  backoff?: IJobBackoffOptions | JobBackoffStrategyFn;
  removeOnComplete?: boolean | IJobRemovalOptions;
  removeOnFail?: boolean | IJobRemovalOptions;
  jobId?: string;
  timeout?: number;
  maxStalledCount?: number;
}

const JobOptionsSchema = z.object({
  priority: z.number().int().min(0).optional().default(0),
  delay: z.number().int().min(0).optional().default(0),
  attempts: z.number().int().min(1).optional().default(1),
  // z.function() for JobBackoffStrategyFn
  backoff: z.union([JobBackoffSchema, z.function()]).optional(),
  removeOnComplete: z.union([z.boolean(), JobRemovalSchema]).optional().default(true),
  removeOnFail: z.union([z.boolean(), JobRemovalSchema]).optional().default(false),
  jobId: z.string().optional(),
  timeout: z.number().int().min(0).optional(),
  maxStalledCount: z.number().int().min(0).optional().default(3),
});

export class JobOptionsVO extends AbstractValueObject<IJobOptions> {
  private constructor(props: IJobOptions) {
    super(props);
  }

  public static create(options?: IJobOptions): JobOptionsVO {
    const validationResult = JobOptionsSchema.safeParse(options);
    if (!validationResult.success) {
      throw new ValueError('Invalid job options.', {
        details: validationResult.error.flatten().fieldErrors,
      });
    }
    return new JobOptionsVO(validationResult.data);
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

  public equals(vo?: JobOptionsVO): boolean {
    // Custom equals for JobOptionsVO if needed, otherwise rely on AbstractValueObject's JSON.stringify
    // For now, AbstractValueObject's equals is sufficient if functions are not compared directly.
    return super.equals(vo);
  }

  public toPersistence(): IJobOptions {
    // For a custom backoff function, we might need to store its name or a reference
    // if it's not directly serializable. For now, assume it's handled or not persisted if function.
    // For simplicity, this example directly returns props, but in a real scenario,
    // you might transform function references or other non-serializable parts.
    const persistenceProps = { ...this.props };
    if (typeof persistenceProps.backoff === 'function') {
        // Decide how to handle function persistence.
        // For now, we'll remove it if it's a function to avoid serialization issues with simple JSON.
        delete persistenceProps.backoff;
    }
    return persistenceProps;
  }
}

