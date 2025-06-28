// src_refactored/core/application/queue/events/job-event.types.ts
// Previously src_refactored/core/domain/job/events/job-event.types.ts
import { JobEntity } from '@/core/domain/job/job.entity'; // Adjusted path
import { JobExecutionLogEntryProps } from '@/core/domain/job/value-objects/job-execution-log-entry.vo';
import { JobProgressData } from '@/core/domain/job/value-objects/job-progress.vo';

export type JobId = string;
export type WorkerId = string;
export type QueueName = string;

export type JobEventType =
  | 'job.added'
  | 'job.active'
  | 'job.completed'
  | 'job.failed'
  | 'job.progress'
  | 'job.stalled'
  | 'job.delayed'
  | 'job.promoted'
  | 'job.removed'
  | 'job.log_added'
  | 'queue.paused'
  | 'queue.resumed'
  | 'worker.error';

export interface JobAddedPayload {
  queueName: QueueName;
  jobId: JobId;
  job: JobEntity<unknown, unknown>; // Changed any to unknown
}

export interface JobActivePayload {
  queueName: QueueName;
  jobId: JobId;
  job: JobEntity<unknown, unknown>; // Changed any to unknown
}

export interface JobCompletedPayload<TResult = unknown> { // Changed any to unknown
  queueName: QueueName;
  jobId: JobId;
  result: TResult;
  job?: JobEntity<unknown, TResult>; // Changed any to unknown
}

export interface JobFailedPayload {
  queueName: QueueName;
  jobId: JobId;
  error: Error;
  job?: JobEntity<unknown, unknown>; // Changed any to unknown
}

export interface JobProgressPayload {
  queueName: QueueName;
  jobId: JobId;
  progress: JobProgressData;
}

export interface JobStalledPayload {
  queueName: QueueName;
  jobId: JobId;
}

export interface JobDelayedPayload {
  queueName: QueueName;
  jobId: JobId;
  delayUntil: number;
}

export interface JobPromotedPayload {
  queueName: QueueName;
  jobId: JobId;
}

export interface JobRemovedPayload {
  queueName: QueueName;
  jobId: JobId;
}

export interface JobLogAddedPayload {
  queueName: QueueName;
  jobId: JobId;
  logEntry: JobExecutionLogEntryProps;
}

export interface QueuePausedPayload {
  queueName: QueueName;
}

export interface QueueResumedPayload {
  queueName: QueueName;
}

export interface WorkerErrorPayload {
  queueName: QueueName;
  workerId: WorkerId;
  error: Error;
}

export interface JobEventPayloadMap {
  'job.added': JobAddedPayload;
  'job.active': JobActivePayload;
  'job.completed': JobCompletedPayload<unknown>; // Changed any to unknown
  'job.failed': JobFailedPayload;
  'job.progress': JobProgressPayload;
  'job.stalled': JobStalledPayload;
  'job.delayed': JobDelayedPayload;
  'job.promoted': JobPromotedPayload;
  'job.removed': JobRemovedPayload;
  'job.log_added': JobLogAddedPayload;
  'queue.paused': QueuePausedPayload;
  'queue.resumed': QueueResumedPayload;
  'worker.error': WorkerErrorPayload;
}
