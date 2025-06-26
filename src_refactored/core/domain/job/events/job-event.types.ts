// src_refactored/core/domain/job/events/job-event.types.ts

import { JobEntity } from '../job.entity';
import { JobProgressData } from '../value-objects/job-progress.vo';
import { JobExecutionLogEntryProps } from '../value-objects/job-execution-log-entry.vo'; // For JobLog structure

// Re-export JobId for convenience if it's just a string, or define it.
// Assuming JobIdVO.value is used, which is string.
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

// --- Payload Interfaces ---

// Using JobEntity itself for job payloads might be too heavy or cause circular deps
// if JobEntity methods emit events. Using a simpler representation or relevant parts.
// For now, let's use relevant parts or define simplified Job-like interfaces for events.
// Or, we can use `Partial<JobEntityProps>` if appropriate.
// Design doc mentioned: `job: Job<any, any>` or `job?: Job<any,any>`.
// Let's use a simplified Job representation for events to avoid full entity dependency.
// However, the design doc explicitly uses `Job<any,any>`.
// Let's try to use JobEntity for now and see if it creates issues.

export interface JobAddedPayload {
  queueName: QueueName;
  jobId: JobId;
  job: JobEntity<any, any>; // Full job entity as per design doc
}

export interface JobActivePayload {
  queueName: QueueName;
  jobId: JobId;
  job: JobEntity<any, any>; // Full or partial job entity
}

export interface JobCompletedPayload<TResult = any> {
  queueName: QueueName;
  jobId: JobId;
  result: TResult;
  job?: JobEntity<any, TResult>; // Optional full job entity
}

export interface JobFailedPayload {
  queueName: QueueName;
  jobId: JobId;
  error: Error; // Serialized error might be better: { name: string, message: string, stack?: string }
  job?: JobEntity<any, any>; // Optional full job entity
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
  delayUntil: number; // Timestamp in milliseconds
}

export interface JobPromotedPayload {
  queueName: QueueName;
  jobId: JobId;
}

export interface JobRemovedPayload {
  queueName: QueueName;
  jobId: JobId;
}

// JobExecutionLogEntryProps is { timestamp: number; message: string; level: LogLevel; details?: Record<string, any>; }
// which matches the JobLog in design doc.
export interface JobLogAddedPayload {
  queueName: QueueName;
  jobId: JobId;
  logEntry: JobExecutionLogEntryProps;
}

// Queue-Level Events
export interface QueuePausedPayload {
  queueName: QueueName;
}

export interface QueueResumedPayload {
  queueName: QueueName;
}

// Worker-Level Events
export interface WorkerErrorPayload {
  queueName: QueueName;
  workerId: WorkerId;
  error: Error; // Again, consider serialized error
}

// A type map for event payloads to allow for typed listeners later
export interface JobEventPayloadMap {
  'job.added': JobAddedPayload;
  'job.active': JobActivePayload;
  'job.completed': JobCompletedPayload<any>; // Generic result type
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
