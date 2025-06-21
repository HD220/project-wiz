// Using a type for specific allowed statuses
export type JobStatusValue =
  | 'pending'   // Newly created, awaiting dependencies or initial processing
  | 'waiting'   // Dependencies met, ready for worker pickup
  | 'active'    // Picked up by a worker, currently being processed
  | 'delayed'   // Execution postponed (e.g., after a retryable error, or scheduled for future)
  | 'completed' // Successfully finished
  | 'failed'    // Failed after all retry attempts or due to non-retryable error
  | 'cancelled'; // Cancelled by user or system

const VALID_STATUSES: ReadonlyArray<JobStatusValue> = [
  'pending',
  'waiting',
  'active',
  'delayed',
  'completed',
  'failed',
  'cancelled'
];

export class JobStatus {
  private readonly value: JobStatusValue;

  private constructor(status: JobStatusValue) {
    // Object Calisthenics: Rule 3 (Wrap Primitives).
    // Validation is implicit via the type, but an explicit check is good.
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid job status: ${status}`);
    }
    this.value = status;
  }

  public static create(status: JobStatusValue): JobStatus {
    return new JobStatus(status);
  }

  public static pending(): JobStatus { return new JobStatus('pending'); }
  public static waiting(): JobStatus { return new JobStatus('waiting'); }
  public static active(): JobStatus { return new JobStatus('active'); }
  public static delayed(): JobStatus { return new JobStatus('delayed'); }
  public static completed(): JobStatus { return new JobStatus('completed'); }
  public static failed(): JobStatus { return new JobStatus('failed'); }
  public static cancelled(): JobStatus { return new JobStatus('cancelled'); }

  public getValue(): JobStatusValue {
    return this.value;
  }

  public equals(other: JobStatus): boolean {
    return this.value === other.getValue();
  }

  public isPending(): boolean { return this.value === 'pending'; }
  public isWaiting(): boolean { return this.value === 'waiting'; }
  // Add other is... methods as needed
  public isActive(): boolean { return this.value === 'active'; }
  public isCompleted(): boolean { return this.value === 'completed'; }
  public isFailed(): boolean { return this.value === 'failed'; }
}
