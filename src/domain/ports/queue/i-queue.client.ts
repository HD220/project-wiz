// src/domain/ports/queue/i-queue.client.ts
import { Job, JobProps } from '@/domain/entities/job.entity'; // Ensure JobProps is imported or defined adequately for Omit

export interface IQueueClient {
  readonly queueName: string;

  /**
   * Gets the next available job from the associated queue, applying a lock.
   * @param workerId The ID of the worker requesting the job.
   * @returns A promise for the job and its lockToken, or null if no job is available.
   */
  getNextJob(workerId: string): Promise<{ job: Job; lockToken: string } | null>;

  /**
   * Saves the complete current state of the Job to persistence.
   * This method is used by the Worker for all state updates of a job
   * that has already been picked up (e.g., after job.startProcessing(), job.complete(), job.fail(),
   * or after the jobProcessor prepares the job for DELAYED/WAITING_CHILDREN and throws an error).
   * It delegates to IJobRepository.save(job, workerToken).
   * @param job The Job entity with its current state updated in memory.
   * @param workerToken The lock token that the Worker holds for this job.
   */
  saveJobState(job: Job, workerToken: string): Promise<void>;

  /**
   * Enqueues a new job to the queue associated with this client.
   * @param jobDetails Object containing details for the new job,
   *                   excluding id, status, createdAt, updatedAt, attempts, and queueName (which is implicit).
   * @returns A promise for the created Job entity.
   */
  enqueue(jobDetails: Omit<JobProps, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'attempts' | 'queueName'>): Promise<Job>;
}
