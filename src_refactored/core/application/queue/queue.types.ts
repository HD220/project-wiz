// src_refactored/core/application/queue/queue.types.ts
import { JobEntity } from '@/core/domain/job/job.entity';

/**
 * Defines the signature for a job processor function.
 * This function contains the actual logic for processing a job.
 *
 * @template TData The type of the job's input data.
 * @template TResult The type of the result returned by the processor upon successful completion.
 * @param job The job entity being processed. Includes data, id, and methods to update progress or log.
 * @returns A Promise that resolves with the result of the job processing.
 *          Should throw an error if processing fails.
 */
export type ProcessorFunction<TData = unknown, TResult = unknown> =
  (job: JobEntity<TData, TResult>) => Promise<TResult>;

// Re-exporting JobEventType and related types from their new location if needed by other queue components,
// or this file becomes the central place for all queue-related shared types.
// For now, JobEventType is in './events/job-event.types.ts'.
// If this file is meant to be the main 'queue types' file, we might move them here.
// Based on plan: "Shared Types (JobEventType): Layer: core/application/queue/types.ts"
// This implies job-event.types.ts might be merged or re-exported from here.
// For now, just ProcessorFunction. Centralization of JobEventType can be a refinement.
