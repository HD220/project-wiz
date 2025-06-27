import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';

/**
 * @fileoverview Data Transfer Objects (DTOs) for the IWorkerService interface.
 * These objects define the shape of data passed to and from worker service methods.
 */

/**
 * Represents the role a worker is designed to handle.
 * Example roles: 'CodeGenerator', 'DocumentationWriter', 'GenericTaskProcessor'.
 */
export type WorkerRole = string;

/**
 * Defines the possible operational statuses of a worker.
 */
export type WorkerStatusValue =
  | 'STARTING'    // Worker is in the process of initializing.
  | 'IDLE'        // Worker is initialized and waiting for jobs.
  | 'BUSY'        // Worker is currently processing a job.
  | 'STOPPING'    // Worker is in the process of shutting down.
  | 'OFFLINE'     // Worker is not running or not reachable.
  | 'ERROR'       // Worker has encountered an error.
  | 'UNKNOWN';    // Worker status cannot be determined.

/**
 * Parameters for registering a new worker with the WorkerService.
 */
export interface RegisterWorkerParams {
  /** The role this worker is designed to handle. */
  role: WorkerRole;
  /** An optional human-readable name for this worker instance. */
  name?: string;
  /** Optional list of specific capabilities or skills this worker possesses. */
  capabilities?: string[];
  /** Optional: The host where the worker is running, if applicable. */
  host?: string;
  /** Optional: The port number the worker is listening on, if applicable. */
  port?: number;
}

/**
 * Information returned after successfully registering a worker,
 * or when querying details of an existing worker.
 */
export interface WorkerDetailsDTO {
  /** The unique identifier assigned to the worker. */
  workerId: string;
  /** The role this worker handles. */
  role: WorkerRole;
  /** A human-readable name for this worker instance. */
  name: string;
  /** The current operational status of the worker. */
  status: WorkerStatusValue;
  /** Timestamp of when the worker was registered. */
  registeredAt: Date;
  /** Timestamp of the last time the worker was seen or reported activity. */
  lastSeenAt: Date;
  /** The ID of the job the worker is currently processing, if any. */
  currentJobId?: JobIdVO | null;
  /** Specific capabilities or skills this worker possesses. */
  capabilities?: string[];
   /** The host where the worker is running, if applicable. */
  host?: string;
  /** The port number the worker is listening on, if applicable. */
  port?: number;
}

/**
 * Parameters for updating the status of an existing worker.
 */
export interface UpdateWorkerStatusParams {
  /** The current operational status of the worker. */
  status: WorkerStatusValue;
  /** The ID of the job the worker is currently processing, if status is 'BUSY'. */
  currentJobId?: JobIdVO | null;
  /** Optional error message if the status is 'ERROR'. */
  error?: string;
}

/**
 * Parameters for filtering a list of workers.
 * All properties are optional.
 */
export interface WorkerFilterParams {
  /** Filter by worker role. */
  role?: WorkerRole;
  /** Filter by worker status. */
  status?: WorkerStatusValue;
  /** Filter by capability. */
  capability?: string;
}

/**
 * Parameters for a worker to send a heartbeat signal.
 */
export interface WorkerHeartbeatParams {
  /** The current operational status of the worker. */
  status: WorkerStatusValue;
  /** The ID of the job the worker is currently processing, if status is 'BUSY'. */
  currentJobId?: JobIdVO | null;
}

/**
 * Represents the result of a job processing attempt by a worker.
 * This might be used if the WorkerService orchestrates job completion reporting.
 */
export interface JobProcessResultDTO {
  jobId: JobIdVO;
  status: 'COMPLETED' | 'FAILED' | 'CANCELLED'; // Simplified job outcomes
  output?: unknown; // Output of the job, if any; changed from any to unknown
  error?: string; // Error message if the job failed
}

/**
 * Parameters for telling a worker to start processing jobs for its role.
 * This might be relevant if workers are explicitly started/stopped by the service.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StartWorkerProcessingParams {
  // Currently no specific parameters, workerId is the primary identifier.
  // Could include things like concurrency settings for the worker in the future.
}

/**
 * Parameters for telling a worker to stop processing jobs.
 */
export interface StopWorkerProcessingParams {
  /** Optional: Specifies if the worker should finish its current job before stopping. */
  graceful?: boolean;
}
// Note: JobId is imported from domain. Adjust path if necessary after checking final JobId location.
// For now, assuming a placeholder until JobId's final location is confirmed.
// Temporary placeholder for JobId if not available from domain yet.
// type JobId = string;
// Ensure to replace with actual JobId import from:
// import { JobId } from '../../../domain/job/job.value-objects';
// or similar correct path.
// Based on current file structure, it should be:
// import { JobId } from '../../domain/job/job.value-objects';
// Will correct this path when creating the interface file.
// For now, this DTO file is self-contained with a local JobId alias if needed.
// The import { JobId } from '../../../domain/job/job.value-objects'; is correct
// relative to src_refactored/core/application/services/worker/dtos.ts
// if JobId is in src_refactored/core/domain/job/job.value-objects.ts
// Let's check JobId location.
// Assuming JobId is in `src_refactored/core/domain/job/job.value-objects.ts` for now.
// The plan indicates `src_refactored/core/domain/`, so `job/job.value-objects.ts` is a reasonable assumption.
// The import path `../../../domain/job/job.value-objects` refers to:
// `dtos.ts` is in `application/services/worker/`
// `../` -> `application/services/`
// `../../` -> `application/`
// `../../../` -> `core/`
// So, `../../../domain/job/job.value-objects` would resolve to `core/domain/job/job.value-objects.ts`
// This seems correct.
