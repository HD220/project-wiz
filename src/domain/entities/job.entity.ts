// src/domain/entities/job.entity.ts
import { JobStatusVO } from './value-objects/job-status.vo';
import { randomUUID } from 'crypto'; // Ensure crypto is available

export interface JobProps {
  id: string;
  name: string;
  queueName: string;
  payload: any;
  data?: any;
  status: JobStatusVO;
  attempts: number;
  maxAttempts: number;
  priority?: number;
  delayUntil?: Date;
  processedAt?: Date;
  finishedAt?: Date;
  result?: any;
  error?: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  // backoffOptions?: BackoffOptions; // Not implementing backoff directly in entity for now
}

export class Job {
  public props: JobProps;

  private constructor(props: JobProps) {
    this.props = props;
  }

  public static create(params: {
    id?: string;
    name: string;
    queueName: string;
    payload: any;
    maxAttempts?: number;
    priority?: number;
    delayUntil?: Date;
    parentId?: string;
    initialData?: any;
    // backoffOptions?: BackoffOptions;
  }): Job {
    const now = new Date();
    const id = params.id || randomUUID();
    return new Job({
      id,
      name: params.name,
      queueName: params.queueName,
      payload: params.payload,
      status: JobStatusVO.create('PENDING'),
      attempts: 0,
      maxAttempts: params.maxAttempts || 3,
      priority: params.priority || 10,
      delayUntil: params.delayUntil,
      parentId: params.parentId,
      data: params.initialData,
      createdAt: now,
      updatedAt: now,
      processedAt: undefined,
      finishedAt: undefined,
      result: undefined,
      error: undefined,
      // backoffOptions: params.backoffOptions || { type: 'exponential', delay: 1000 },
    });
  }

  get id(): string { return this.props.id; }
  get status(): string { return this.props.status.value; }
  get name(): string { return this.props.name; }
  get queueName(): string { return this.props.queueName; }
  get payload(): any { return this.props.payload; }
  // Add other getters as needed

  public startProcessing(): void {
    if (this.props.status.is('PENDING') || this.props.status.is('DELAYED')) {
        this.props.status = JobStatusVO.create('ACTIVE');
        this.props.attempts += 1;
        this.props.processedAt = new Date();
        this.props.updatedAt = new Date();
    } else {
        // Or throw an error, depending on desired strictness
        console.warn(`Job ${this.id} cannot start processing in status ${this.status}`);
    }
  }

  public complete(result: any): void {
    if (this.props.status.is('ACTIVE')) {
        this.props.status = JobStatusVO.create('COMPLETED');
        this.props.result = result;
        this.props.finishedAt = new Date();
        this.props.updatedAt = new Date();
    } else {
        console.warn(`Job ${this.id} cannot complete in status ${this.status}`);
    }
  }

  public fail(error: string): void {
    // Can fail from ACTIVE or other states if needed, e.g. if a pre-check fails
    this.props.status = JobStatusVO.create('FAILED');
    this.props.error = error;
    this.props.finishedAt = new Date();
    this.props.updatedAt = new Date();
  }

  public canRetry(): boolean {
    return this.props.status.is('FAILED') && this.props.attempts < this.props.maxAttempts;
  }

  public markAsPendingRetry(): void {
    if (this.props.status.is('FAILED')) { // Or ensure it can only be retried if failed
        this.props.status = JobStatusVO.create('PENDING');
        this.props.updatedAt = new Date();
        this.props.error = undefined;
        this.props.result = undefined;
        this.props.finishedAt = undefined;
        this.props.processedAt = undefined;
        // this.props.delayUntil = ... // Logic for backoff delay would be set here by repository/worker
    } else {
        console.warn(`Job ${this.id} cannot be marked for retry in status ${this.status}`);
    }
  }

  public updateJobData(newData: any): void {
    this.props.data = { ...(this.props.data || {}), ...newData };
    this.props.updatedAt = new Date();
  }

  public prepareForDelay(delayTargetTimestamp: Date): void {
    // Allow delay if PENDING (initial delay) or ACTIVE (delay during processing)
    if (this.props.status.is('PENDING') || this.props.status.is('ACTIVE')) {
        this.props.status = JobStatusVO.create('DELAYED');
        this.props.delayUntil = delayTargetTimestamp;
        this.props.updatedAt = new Date();
    } else {
      console.warn(`Job ${this.id} cannot be prepared for delay in status ${this.status}. Current delayUntil: ${this.props.delayUntil}`);
      // Potentially throw an error if strict state transitions are required
      // throw new Error(`Job ${this.id} cannot be prepared for delay in status ${this.status}`);
    }
  }

  public prepareToWaitForChildren(): void {
    if (this.props.status.is('ACTIVE')) {
        this.props.status = JobStatusVO.create('WAITING_CHILDREN');
        this.props.updatedAt = new Date();
    } else {
      console.warn(`Job ${this.id} cannot be prepared to wait for children in status ${this.status}`);
      // Potentially throw an error
      // throw new Error(`Job ${this.id} cannot be prepared to wait for children in status ${this.status}`);
    }
  }
}
