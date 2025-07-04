// src_refactored/core/application/queue/events/job-event.types.ts

import { JobEntity } from '@/core/domain/job/job.entity';
import { JobStatus } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';

export enum JobEventType {
  // Job lifecycle events
  // When a job is first added to the queue
  JOB_ADDED = 'job.added',
  // When a worker fetches a job for processing
  JOB_FETCHED = 'job.fetched',
  // When a job becomes active (processing starts)
  JOB_ACTIVATED = 'job.activated',
  // When a job finishes successfully
  JOB_COMPLETED = 'job.completed',
  // When a job fails after all retries
  JOB_FAILED = 'job.failed',
  // When a job is delayed for a future attempt
  JOB_DELAYED = 'job.delayed',
  // When a job's lock expires and it's considered stalled
  JOB_STALLED = 'job.stalled',
  // When a job is explicitly removed from the queue
  JOB_REMOVED = 'job.removed',
  // When a job's progress is updated
  JOB_PROGRESS_UPDATED = 'job.progressUpdated',
  // When a log is added to a job
  JOB_LOG_ADDED = 'job.logAdded',

  // Queue specific events
  QUEUE_PAUSED = 'queue.paused',
  QUEUE_RESUMED = 'queue.resumed',
  // After old jobs are cleaned
  QUEUE_CLEANED = 'queue.cleaned',

  // Worker specific events (might be emitted by WorkerService rather than QueueService)
  // If worker is stopped during job processing
  WORKER_JOB_INTERRUPTED = 'worker.job.interrupted',
  // General worker error
  WORKER_ERROR = 'worker.error',
}

// --- Payload types for each event ---

export interface JobAddedPayload<PayloadType extends { userId?: string }, ReturnType = unknown> {
  job: JobEntity<PayloadType, ReturnType>;
}

export interface JobFetchedPayload<PayloadType extends { userId?: string }, ReturnType = unknown> {
  job: JobEntity<PayloadType, ReturnType>;
  workerId: string;
}

export interface JobActivatedPayload<PayloadType extends { userId?: string }, ReturnType = unknown> {
  job: JobEntity<PayloadType, ReturnType>;
  workerId: string;
}

export interface JobCompletedPayload<PayloadType extends { userId?: string }, ReturnType = unknown> {
  job: JobEntity<PayloadType, ReturnType>;
  returnValue: ReturnType;
  workerId: string;
}

export interface JobFailedPayload<PayloadType extends { userId?: string }, ReturnType = unknown> {
  job: JobEntity<PayloadType, ReturnType>;
  // Could be an Error object or a serialized string
  error: Error | string;
  // Worker ID if failure happened during processing
  workerId?: string;
}

export interface JobDelayedPayload<PayloadType extends { userId?: string }, ReturnType = unknown> {
  job: JobEntity<PayloadType, ReturnType>;
  delayUntil: Date;
}

export interface JobStalledPayload {
  // Job might not be fully loaded when detected as stalled
  jobId: JobIdVO;
  queueName: string;
}

export interface JobRemovedPayload {
  jobId: JobIdVO;
  queueName: string;
}

export interface JobProgressUpdatedPayload<PayloadType extends { userId?: string }, ReturnType = unknown> {
  job: JobEntity<PayloadType, ReturnType>;
  progress: number | object;
}

export interface JobLogAddedPayload<PayloadType extends { userId?: string }, ReturnType = unknown> {
  job: JobEntity<PayloadType, ReturnType>;
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

// Use unknown if PayloadType, ReturnType are not specifically known here
export interface WorkerJobInterruptedPayload<PayloadType extends { userId?: string }, ReturnType = unknown> {
    // Or JobEntity<unknown, unknown> if types are truly generic for this event
    job: JobEntity<PayloadType,ReturnType>;
    workerId: string;
}

export interface WorkerErrorPayload {
    workerId: string;
    error: Error | string;
}


// --- Event Map ---

export type JobEventPayloadMap<P extends { userId?: string }, R = unknown> = {
  [JobEventType.JOB_ADDED]: JobAddedPayload<P, R>;
  [JobEventType.JOB_FETCHED]: JobFetchedPayload<P, R>;
  [JobEventType.JOB_ACTIVATED]: JobActivatedPayload<P, R>;
  [JobEventType.JOB_COMPLETED]: JobCompletedPayload<P, R>;
  [JobEventType.JOB_FAILED]: JobFailedPayload<P, R>;
  [JobEventType.JOB_DELAYED]: JobDelayedPayload<P, R>;
  [JobEventType.JOB_STALLED]: JobStalledPayload;
  [JobEventType.JOB_REMOVED]: JobRemovedPayload;
  [JobEventType.JOB_PROGRESS_UPDATED]: JobProgressUpdatedPayload<P, R>;
  [JobEventType.JOB_LOG_ADDED]: JobLogAddedPayload<P, R>;
  [JobEventType.QUEUE_PAUSED]: QueuePausedPayload;
  [JobEventType.QUEUE_RESUMED]: QueueResumedPayload;
  [JobEventType.QUEUE_CLEANED]: QueueCleanedPayload;
  [JobEventType.WORKER_JOB_INTERRUPTED]: WorkerJobInterruptedPayload<P, R>;
  [JobEventType.WORKER_ERROR]: WorkerErrorPayload;
  // Add other events as needed
};

// Generic event data structure (if needed, though specific payloads are better)
// export interface JobEventData<T = unknown> {
//   jobId: JobIdVO;
//   queueName: string;
//   data?: T;
// }
