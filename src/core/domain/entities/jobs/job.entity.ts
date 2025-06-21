// src/core/domain/entities/jobs/job.entity.ts

import { JobStatus, JobStatusType } from './job-status';
import { JobRuntimeData } from './job-runtime-data.interface';

export interface JobProps<Input = any, Output = any> {
  id: string;
  queueId: string;
  name: string;
  payload: Input;
  data?: JobRuntimeData; // Data that can be modified during job execution
  result?: Output;
  maxAttempts: number;
  attempts: number;
  // Delays in milliseconds
  maxRetryDelay: number;
  retryDelay: number; // Current retry delay
  delay: number; // Delay for 'DELAYED' status
  priority: number; // Lower number means higher priority
  status: JobStatus;
  dependsOn?: string[]; // List of job IDs this job depends on
  createdAt: Date;
  updatedAt: Date;
  executeAfter?: Date; // Specific time after which the job should be executed
  targetAgentRole?: string;
  requiredCapabilities?: string[];
}

export class Job<Input = any, Output = any> {
  public props: JobProps<Input, Output>; // Made public for easier access in SaveJobUseCase, consider implications

  constructor(props: Omit<JobProps<Input, Output>, 'status' | 'attempts' | 'retryDelay' | 'createdAt' | 'updatedAt'> & { status?: JobStatusType, attempts?: number, retryDelay?: number, createdAt?: Date, updatedAt?: Date }) {
    const now = new Date();
    this.props = {
      ...props,
      attempts: props.attempts || 0,
      status: new JobStatus(props.status || JobStatusType.WAITING),
      retryDelay: props.retryDelay || 0, // Initial retry delay can be set based on a base value or config
      createdAt: props.createdAt || now,
      updatedAt: props.updatedAt || now,
    };
  }

  // Getters
  public get id(): string { return this.props.id; }
  public get queueId(): string { return this.props.queueId; }
  public get name(): string { return this.props.name; }
  public get payload(): Input { return this.props.payload; }
  public get data(): JobRuntimeData | undefined { return this.props.data; }
  public get result(): Output | undefined { return this.props.result; }
  public get maxAttempts(): number { return this.props.maxAttempts; }
  public get attempts(): number { return this.props.attempts; }
  public get maxRetryDelay(): number { return this.props.maxRetryDelay; }
  public get retryDelay(): number { return this.props.retryDelay; }
  public get delay(): number { return this.props.delay; }
  public get priority(): number { return this.props.priority; }
  public get status(): JobStatus { return this.props.status; }
  public get dependsOn(): string[] | undefined { return this.props.dependsOn; }
  public get createdAt(): Date { return this.props.createdAt; }
  public get updatedAt(): Date { return this.props.updatedAt; }
  public get executeAfter(): Date | undefined { return this.props.executeAfter; }
  public get targetAgentRole(): string | undefined { return this.props.targetAgentRole; }
  public get requiredCapabilities(): string[] | undefined { return this.props.requiredCapabilities; }

  // Public methods to change status
  public moveToWaiting(): boolean {
    if (this.props.status.is(JobStatusType.WAITING)) return false;
    this.props.status = this.props.status.moveTo(JobStatusType.WAITING);
    this.props.updatedAt = new Date();
    return true;
  }

  public moveToActive(): boolean {
    // Add validation later: e.g., can only move from WAITING or DELAYED
    if (this.props.status.is(JobStatusType.ACTIVE)) return false;
    this.props.status = this.props.status.moveTo(JobStatusType.ACTIVE);
    this.props.attempts += 1;
    this.props.updatedAt = new Date();
    return true;
  }

  public moveToCompleted(result: Output): void {
    this.props.status = this.props.status.moveTo(JobStatusType.COMPLETED);
    this.props.result = result;
    this.props.updatedAt = new Date();
  }

  public moveToFailed(errorInfo?: any): void { // errorInfo to distinguish from Error class
    this.props.status = this.props.status.moveTo(JobStatusType.FAILED);
    this.props.data = {
      ...(this.props.data || {}), // Preserve existing JobRuntimeData fields
      error: errorInfo // Add/overwrite error field
    };
    this.props.updatedAt = new Date();
  }

  public moveToDelayed(delayDuration?: number): boolean {
    // delayDuration in milliseconds
    if (this.props.status.is(JobStatusType.DELAYED) && this.props.delay === delayDuration) return false;

    this.props.status = this.props.status.moveTo(JobStatusType.DELAYED);
    this.props.delay = delayDuration !== undefined ? delayDuration : this.calculateNextRetryDelay();
    this.props.executeAfter = new Date(Date.now() + this.props.delay);
    this.props.updatedAt = new Date();
    return true;
  }

  public setRetryDelay(delay: number): void {
    this.props.retryDelay = delay;
    this.props.updatedAt = new Date();
  }

  public setData(data: JobRuntimeData): void {
    this.props.data = data;
    this.props.updatedAt = new Date();
  }

  public calculateNextRetryDelay(initialRetryDelay: number = 1000): number {
    // Example: exponential backoff ((attempts) ** 2) * initial_retry_delay
    // Ensure attempts is at least 1 for calculation if it's 0 but we are retrying.
    const currentAttempts = Math.max(1, this.props.attempts);
    const nextDelay = Math.pow(currentAttempts, 2) * initialRetryDelay;
    return Math.min(nextDelay, this.props.maxRetryDelay);
  }

  public static create<I, O>(
    props: Omit<JobProps<I, O>, 'id' | 'status' | 'attempts' | 'retryDelay' | 'createdAt' | 'updatedAt' | 'delay'> &
           { id?: string, status?: JobStatusType, attempts?: number, initialRetryDelay?: number, delay?: number, targetAgentRole?: string, requiredCapabilities?: string[] }
  ): Job<I, O> {
    const id = props.id || crypto.randomUUID(); // Assuming browser/node crypto
    const initialDelay = props.delay !== undefined ? props.delay : 0;

    let executeAfterDate: Date | undefined = undefined;
    if (initialDelay > 0) {
      executeAfterDate = new Date(Date.now() + initialDelay);
    }

    const jobProps: Omit<JobProps<I, O>, 'status' | 'attempts' | 'retryDelay' | 'createdAt' | 'updatedAt'> & { status?: JobStatusType, attempts?: number, retryDelay?: number, createdAt?: Date, updatedAt?: Date } = {
      ...props,
      id: id, // Use the corrected id variable
      status: props.status || (initialDelay > 0 ? JobStatusType.DELAYED : JobStatusType.WAITING),
      attempts: props.attempts || 0,
      retryDelay: props.initialRetryDelay || 0, // This will be calculated on first moveToDelayed if needed
      delay: initialDelay,
      executeAfter: executeAfterDate,
      targetAgentRole: props.targetAgentRole,
      requiredCapabilities: props.requiredCapabilities,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return new Job<I, O>(jobProps);
  }
}
