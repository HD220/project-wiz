import { Result } from '@/shared/result';
// Assuming JobIdVO is needed for some return types or context from DTOs, but not directly used in this interface yet.
// import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';

import {
  RegisterWorkerParams,
  WorkerDetailsDTO,
  UpdateWorkerStatusParams,
  WorkerFilterParams,
  WorkerHeartbeatParams,
  // JobProcessResultDTO, // Might be handled by a different service or event
  // StartWorkerProcessingParams, // Implicitly handled by worker registration and job availability
  // StopWorkerProcessingParams, // Covered by unregister or a more generic shutdown
} from './dtos';

/**
 * @fileoverview Interface for the WorkerService.
 * The WorkerService is responsible for managing the lifecycle and coordination of workers
 * that process jobs based on their roles.
 */

export const WorkerServiceSymbol = Symbol('IWorkerService');

export interface IWorkerService {
  /**
   * Registers a new worker with the system.
   * This is typically called by a worker process when it starts up.
   * @param params - Parameters for registering the worker.
   * @returns A Result containing the details of the registered worker or an error.
   */
  registerWorker(
    params: RegisterWorkerParams,
  ): Promise<Result<WorkerDetailsDTO, Error>>;

  /**
   * Unregisters an existing worker from the system.
   * This is typically called when a worker process shuts down gracefully.
   * @param workerId - The unique identifier of the worker to unregister.
   * @returns A Result indicating success or an error.
   */
  unregisterWorker(workerId: string): Promise<Result<void, Error>>;

  /**
   * Handles a heartbeat signal from a worker.
   * Workers should call this periodically to indicate they are still active
   * and to update their current status.
   * @param workerId - The unique identifier of the worker sending the heartbeat.
   * @param params - Heartbeat parameters including current status.
   * @returns A Result indicating success or an error (e.g., if workerId is not found).
   */
  handleHeartbeat(
    workerId: string,
    params: WorkerHeartbeatParams,
  ): Promise<Result<void, Error>>;

  /**
   * Updates the status of a specific worker.
   * This can be used for more specific status changes outside of regular heartbeats.
   * @param workerId - The unique identifier of the worker to update.
   * @param params - Parameters for updating the worker's status.
   * @returns A Result containing the updated worker details or an error.
   */
  updateWorkerStatus(
    workerId: string,
    params: UpdateWorkerStatusParams,
  ): Promise<Result<WorkerDetailsDTO, Error>>;

  /**
   * Retrieves the details of a specific worker.
   * @param workerId - The unique identifier of the worker.
   * @returns A Result containing the worker's details or an error if not found.
   */
  getWorkerDetails(workerId: string): Promise<Result<WorkerDetailsDTO, Error>>;

  /**
   * Lists all registered workers, optionally filtered by the given parameters.
   * @param filters - Optional parameters to filter the list of workers.
   * @returns A Result containing an array of worker details or an error.
   */
  listWorkers(
    filters?: WorkerFilterParams,
  ): Promise<Result<WorkerDetailsDTO[], Error>>;

  /**
   * Finds an available worker for a given role.
   * This could be used by a job dispatching mechanism.
   * @param role - The role for which to find an available worker.
   * @returns A Result containing the details of an available worker or an error if none are found/available.
   */
  findAvailableWorker(
    role: string, // WorkerRole from DTOs
  ): Promise<Result<WorkerDetailsDTO | null, Error>>;

  // Regarding "inicialização" and "parada de workers" from task criteria:
  // - "Inicialização": Assumed to be handled by the worker process itself before calling `registerWorker`.
  //   The service could have a method like `activateWorker(workerId: string)` if there's a pool of
  //   pre-defined worker configurations that can be activated on demand. For now, registration implies readiness.
  // - "Parada de workers": `unregisterWorker` handles graceful shutdown.
  //   A method like `requestWorkerShutdown(workerId: string)` could be added if the service needs to actively
  //   tell a worker to stop, which might then lead to the worker calling `unregisterWorker`.

  // Regarding "submissão de jobs" from task criteria:
  // As per `04_sistema_jobs_atividades_fila.md` and typical worker patterns,
  // the `WorkerService` makes workers available. A separate system (Job Queue + Agent Executor)
  // will likely handle the actual job fetching and execution by an agent running in a worker.
  // The `WorkerService` might be queried for available workers (`findAvailableWorker`) or
  // workers themselves might poll a Job Queue.
  // If `WorkerService` *were* to directly dispatch jobs, it might look like:
  // assignJobToWorker(workerId: string, jobId: JobId): Promise<Result<void, Error>>;
  // However, this seems to couple it too tightly with the job entity itself, which is
  // likely managed by `IJobRepository` and `IJobQueue`.
  // For now, keeping the scope to worker lifecycle and status management.
}
// Path correction for JobId import based on the DTO file:
// The DTO file is in: src_refactored/core/application/services/worker/dtos.ts
// This interface file is in: src_refactored/core/application/services/worker/i-worker.service.ts
// The domain layer is at: src_refactored/core/domain/
// So, to get to `job.value-objects.ts` from here:
// `../` -> `services/`
// `../../` -> `application/`
// `../../../` -> `core/`
// `../../../domain/job/job.value-objects` -> `core/domain/job/job.value-objects.ts`
// The import for JobId: `import { JobId } from '../../../domain/job/job.value-objects';` is correct.

// The import for Result: `import { Result } from '../../../../shared/result';`
// `i-worker.service.ts` is in `application/services/worker/`
// `../` -> `application/services/`
// `../../` -> `application/`
// `../../../` -> `core/`
// `../../../../` -> `src_refactored/` (root of this source tree)
// So `../../../../shared/result` -> `src_refactored/shared/result.ts`. This is also correct.
