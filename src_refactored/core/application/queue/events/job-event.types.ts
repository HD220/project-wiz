// src_refactored/core/application/queue/events/job-event.types.ts

import { JobEntity } from '@/core/domain/job/job.entity';
import { JobStatus } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';

export enum JobEventType {
  // Job lifecycle events
  JOB_ADDED = 'job.added', // When a job is first added to the queue
  JOB_FETCHED = 'job.fetched', // When a worker fetches a job for processing
  JOB_ACTIVATED = 'job.activated', // When a job becomes active (processing starts)
  JOB_COMPLETED = 'job.completed', // When a job finishes successfully
  JOB_FAILED = 'job.failed', // When a job fails after all retries
  JOB_DELAYED = 'job.delayed', // When a job is delayed for a future attempt
  JOB_STALLED = 'job.stalled', // When a job's lock expires and it's considered stalled
  JOB_REMOVED = 'job.removed', // When a job is explicitly removed from the queue
  JOB_PROGRESS_UPDATED = 'job.progressUpdated', // When a job's progress is updated
  JOB_LOG_ADDED = 'job.logAdded', // When a log is added to a job

  // Queue specific events
  QUEUE_PAUSED = 'queue.paused',
  QUEUE_RESUMED = 'queue.resumed',
  QUEUE_CLEANED = 'queue.cleaned', // After old jobs are cleaned

  // Worker specific events (might be emitted by WorkerService rather than QueueService)
  WORKER_JOB_INTERRUPTED = 'worker.job.interrupted', // If worker is stopped during job processing
  WORKER_ERROR = 'worker.error', // General worker error
}

// --- Payload types for each event ---

export interface JobAddedPayload<P = unknown, R = unknown> {
  job: JobEntity<P, R>;
}

export interface JobFetchedPayload<P = unknown, R = unknown> {
  job: JobEntity<P, R>;
  workerId: string;
}

export interface JobActivatedPayload<P = unknown, R = unknown> {
  job: JobEntity<P, R>;
  workerId: string;
}

export interface JobCompletedPayload<P = unknown, R = unknown> {
  job: JobEntity<P, R>;
  returnValue: R;
  workerId: string;
}

export interface JobFailedPayload<P = unknown, R = unknown> {
  job: JobEntity<P, R>;
  error: Error | string; // Could be an Error object or a serialized string
  workerId?: string; // Worker ID if failure happened during processing
}

export interface JobDelayedPayload<P = unknown, R = unknown> {
  job: JobEntity<P, R>;
  delayUntil: Date;
}

export interface JobStalledPayload<P = unknown, R = unknown> {
  jobId: JobIdVO; // Job might not be fully loaded when detected as stalled
  queueName: string;
}

export interface JobRemovedPayload {
  jobId: JobIdVO;
  queueName: string;
}

export interface JobProgressUpdatedPayload<P = unknown, R = unknown> {
  job: JobEntity<P, R>;
  progress: number | object;
}

export interface JobLogAddedPayload<P = unknown, R = unknown> {
  job: JobEntity<P, R>;
  log: { message: string; level: string; timestamp: Date };
}

export interface QueuePausedPayload {
  queueName: string;
}

export interface QueueResumedPayload {
  queueName: string;
}

export interface QueueCleanedPayload {
  queueName: string;
  count: number;
  status?: JobStatus;
}

export interface WorkerJobInterruptedPayload<P = any, R = any> { // Use any if P, R are not specifically known here
    job: JobEntity<P,R>; // Or JobEntity<unknown, unknown> if types are truly generic for this event
    workerId: string;
}

export interface WorkerErrorPayload {
    workerId: string;
    error: Error | string;
}


// --- Event Map ---

export type JobEventPayloadMap = {
  [JobEventType.JOB_ADDED]: JobAddedPayload;
  [JobEventType.JOB_FETCHED]: JobFetchedPayload;
  [JobEventType.JOB_ACTIVATED]: JobActivatedPayload;
  [JobEventType.JOB_COMPLETED]: JobCompletedPayload;
  [JobEventType.JOB_FAILED]: JobFailedPayload;
  [JobEventType.JOB_DELAYED]: JobDelayedPayload;
  [JobEventType.JOB_STALLED]: JobStalledPayload;
  [JobEventType.JOB_REMOVED]: JobRemovedPayload;
  [JobEventType.JOB_PROGRESS_UPDATED]: JobProgressUpdatedPayload;
  [JobEventType.JOB_LOG_ADDED]: JobLogAddedPayload;
  [JobEventType.QUEUE_PAUSED]: QueuePausedPayload;
  [JobEventType.QUEUE_RESUMED]: QueueResumedPayload;
  [JobEventType.QUEUE_CLEANED]: QueueCleanedPayload;
  [JobEventType.WORKER_JOB_INTERRUPTED]: WorkerJobInterruptedPayload;
  [JobEventType.WORKER_ERROR]: WorkerErrorPayload;
  // Add other events as needed
};

// Generic event data structure (if needed, though specific payloads are better)
// export interface JobEventData<T = unknown> {
//   jobId: JobIdVO;
//   queueName: string;
//   data?: T;
// }
