// src/domain/repositories/i-job.repository.ts
import { Job } from '../entities/job.entity';

export interface IJobRepository {
  /**
   * Adds a new job to the persistence.
   * Used primarily by EnqueueJobUseCase for newly created jobs.
   * @param job The Job entity to be added.
   */
  add(job: Job): Promise<void>;

  /**
   * Finds a job by its ID.
   * @param jobId The ID of the job to find.
   * @returns The Job found or null.
   */
  findById(jobId: string): Promise<Job | null>;

  /**
   * Finds the next pending job (status PENDING or DELAYED with delayUntil passed)
   * for a specific queue. Applies a lock to the found job (by registering workerId
   * and a new lockToken in persistence with an expiration time) and returns the
   * job and the lockToken. If no job is available, returns null.
   * @param queueName The name of the queue to check.
   * @param workerId The ID of the worker requesting the job (for locking purposes).
   * @returns A promise for an object with the Job and lockToken, or null if no job is available.
   */
  findNextPending(queueName: string, workerId: string): Promise<{ job: Job; lockToken: string } | null>;

  /**
   * Saves the current state of a Job instance. This is the primary method
   * for persisting all state changes and data of the job after it has been
   * picked up by a Worker.
   * The implementation of this method is responsible for:
   *  - Validating the `lockToken` if the job was previously active.
   *  - Persisting all properties of the `job` (status, data, attempts, result, error, delayUntil, etc.).
   *  - Handling the logic of final state transition in persistence (e.g., if job.props.status
   *    is FAILED and job.props.attempts < job.props.maxAttempts, it might apply backoff
   *    and save as PENDING/DELAYED with a new delayUntil).
   *  - Releasing the lock if the job reaches a terminal state (COMPLETED, FAILED without retries)
   *    or if it's re-queued (DELAYED, PENDING for retry).
   * @param job The Job entity with its current state updated in memory.
   * @param lockToken The lock token that the Worker holds for this job. Essential for authorizing the update.
   */
  save(job: Job, lockToken: string): Promise<void>;
}
