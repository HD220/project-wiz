import type { Job as JobRecord } from "@/main/schemas/job.schema";

export class JobInstance {
  private _data: JobRecord;
  private _dirty = false; // Track if job state changed

  constructor(jobRecord: JobRecord) {
    this._data = { ...jobRecord };
  }

  // Getters for job properties
  get id(): string { return this._data.id; }
  get queueName(): string { return this._data.queueName; }
  get data(): any { return JSON.parse(this._data.data); }
  get status(): string { return this._data.status; }
  get attempts(): number { return this._data.attempts; }
  get maxAttempts(): number { return this._data.maxAttempts; }
  get workerId(): string | null { return this._data.workerId; }
  get createdAt(): Date { return this._data.createdAt; }
  get updatedAt(): Date { return this._data.updatedAt; }
  get isDirty(): boolean { return this._dirty; }

  // Check if job should retry on failure
  shouldRetry(): boolean {
    return this.attempts < this.maxAttempts;
  }

  // Calculate retry delay with exponential backoff
  calculateRetryDelay(): number {
    const baseDelay = 1000; // 1s
    const maxDelay = 30000; // 30s
    const jitter = Math.random() * 1000; // 0-1s jitter
    
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, this.attempts), maxDelay);
    return exponentialDelay + jitter;
  }

  // Mark job as completed (in memory only)
  markCompleted(result: unknown): void {
    const now = new Date();
    
    this._data.status = "completed";
    this._data.result = JSON.stringify(result);
    this._data.finishedOn = now;
    this._data.updatedAt = now;
    this._data.workerId = null;
    this._dirty = true;
  }

  // Mark job as failed (in memory only)
  markFailed(error: Error): void {
    const now = new Date();
    
    this._data.status = "failed";
    this._data.attempts = this.attempts + 1;
    this._data.failureReason = error.message;
    this._data.finishedOn = now;
    this._data.updatedAt = now;
    this._data.workerId = null;
    this._dirty = true;
  }

  // Move job to delayed status (in memory only)
  markDelayed(error: Error, customDelay?: number): void {
    const now = new Date();
    const retryDelay = customDelay || this.calculateRetryDelay();
    const scheduledFor = new Date(now.getTime() + retryDelay);

    this._data.status = "delayed";
    this._data.attempts = this.attempts + 1;
    this._data.delayMs = retryDelay;
    this._data.scheduledFor = scheduledFor;
    this._data.failureReason = error.message;
    this._data.updatedAt = now;
    this._data.workerId = null;
    this._data.processedOn = null;
    this._dirty = true;
  }

  // Mark job as alive (heartbeat - in memory only)
  alive(): void {
    this._data.updatedAt = new Date();
    this._dirty = true;
  }

  // Get raw job record for persistence
  getRawRecord(): JobRecord {
    return { ...this._data };
  }

  // Reset dirty flag after persistence
  markPersisted(): void {
    this._dirty = false;
  }

  // Methods for JobInstance to control its own fate
  requestRetry(reason: string, originalError?: Error, customDelay?: number): never {
    throw new MoveToDelayedError(reason, originalError, customDelay);
  }

  requestFailure(reason: string, originalError?: Error): never {
    throw new MoveToFailedError(reason, originalError);
  }

  reportError(message: string, originalError?: Error): never {
    throw new JobProcessingError(message, originalError);
  }
}

// Custom error types that JobInstance can throw to control its fate
export class MoveToDelayedError extends Error {
  constructor(
    message: string, 
    public readonly originalError?: Error,
    public readonly customDelay?: number // Optional custom delay
  ) {
    super(message);
    this.name = "MoveToDelayedError";
  }
}

export class MoveToFailedError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = "MoveToFailedError";
  }
}

// Job processing errors that can be thrown by JobInstance methods
export class JobProcessingError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = "JobProcessingError";
  }
}