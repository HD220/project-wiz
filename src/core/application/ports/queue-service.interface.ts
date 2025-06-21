import { Job, JobId, JobStatus, JobPriority, ActivityContext } from '@/core/domain/entities/job';

export interface AddJobOptions {
  payload?: Record<string, any>;
  priority?: JobPriority;
  startAfter?: Date; // For scheduling a job to run later (becomes 'delayed')
  dependsOn?: JobId[];
}

export interface IQueueService {
  addJob(
    name: string, // Or JobName VO
    activityContext: ActivityContext, // Initial ActivityContext
    options?: AddJobOptions
  ): Promise<Job>; // Returns the created Job

  getNextJobToProcess(workerId?: string /* WorkerId VO, for worker affinity or specific queues later */): Promise<Job | null>;

  updateJobStatus(jobId: JobId, status: JobStatus): Promise<Job>;

  markJobAsActive(jobId: JobId, workerId?: string /* WorkerId */): Promise<Job>;
  markJobAsCompleted(jobId: JobId, result: Record<string, any>): Promise<Job>;
  markJobAsFailed(jobId: JobId, error: string): Promise<Job>; // Handles retry logic
  findById(jobId: JobId): Promise<Job | null>;
  saveJob(job: Job): Promise<Job>; // Added to save job with updated context or other props

  // Optional: requeueJob, manageDependencies etc.
}
