import { Job, JobStatus } from "./job.interface";

export interface FQueue {
  /**
   * Adds a new job to the queue
   */
  addJob(job: Omit<Job, "id" | "status" | "attempts">): Promise<Job>;

  /**
   * Gets the next available job for processing
   */
  getNextJob(agentId: string): Promise<Job | null>;

  /**
   * Updates job status and result
   */
  updateJobStatus(
    jobId: string,
    status: JobStatus,
    result?: any,
    data?: any
  ): Promise<void>;

  /**
   * Gets job by ID
   */
  getJob(jobId: string): Promise<Job | null>;

  /**
   * Removes a job from the queue
   */
  removeJob(jobId: string): Promise<void>;

  /**
   * Lists jobs matching criteria
   */
  listJobs(options?: {
    status?: JobStatus;
    name?: string;
    limit?: number;
  }): Promise<Job[]>;
}
