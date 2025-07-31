import { llmJobQueueService } from "./llm-job-queue.service";
import { llmMessageProcessorService } from "./llm-message-processor.service";

import type { CompletedJobResponse, JobProgressUpdate, JobCompletionEvent } from "./llm-job-queue.types";

/**
 * LLM Job Result Handler Service
 * 
 * Handles polling for completed jobs, processing results, and delivering
 * them back to the UI. This service runs in the main process and manages
 * the flow of job results from worker to UI.
 */
export class LLMJobResultHandlerService {
  private isPolling = false;
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL_MS = 500; // Poll every 500ms for completed jobs
  
  // Event handlers for job completion (can be used for real-time UI updates)
  private jobCompletionHandlers: Array<(event: JobCompletionEvent) => void> = [];
  private jobProgressHandlers: Array<(update: JobProgressUpdate) => void> = [];

  /**
   * Start polling for completed jobs
   * Should be called during app initialization
   */
  start(): void {
    if (this.isPolling) {
      console.warn("Job result handler is already running");
      return;
    }

    this.isPolling = true;
    this.pollingInterval = setInterval(() => {
      this.pollAndProcessCompletedJobs().catch(error => {
        console.error("Error polling completed jobs:", error);
      });
    }, this.POLL_INTERVAL_MS);

    console.log("Job result handler started");
  }

  /**
   * Stop polling for completed jobs
   * Should be called during app shutdown
   */
  stop(): void {
    if (!this.isPolling) {
      return;
    }

    this.isPolling = false;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    console.log("Job result handler stopped");
  }

  /**
   * Poll for completed jobs and process their results
   */
  private async pollAndProcessCompletedJobs(): Promise<void> {
    try {
      const completedJobs = await llmJobQueueService.pollCompletedJobs(10); // Process up to 10 jobs per poll
      
      for (const job of completedJobs) {
        await this.processCompletedJob(job);
      }
    } catch (error) {
      console.error("Error in pollAndProcessCompletedJobs:", error);
    }
  }

  /**
   * Process a single completed job
   */
  private async processCompletedJob(job: CompletedJobResponse): Promise<void> {
    try {
      console.log(`Processing completed job: ${job.id} (${job.name})`);

      // Handle the job completion via message processor
      await llmMessageProcessorService.handleJobCompletion(job.id);

      // Emit completion event for real-time UI updates
      const completionEvent: JobCompletionEvent = {
        jobId: job.id,
        result: job.result || {},
        error: job.error || undefined,
        duration: job.finishedOn ? Date.now() - new Date(job.finishedOn).getTime() : 0,
      };

      this.emitJobCompletion(completionEvent);

      console.log(`Successfully processed job: ${job.id}`);
    } catch (error) {
      console.error(`Error processing completed job ${job.id}:`, error);
    }
  }

  /**
   * Get job status for a specific job ID
   * Used by UI to check individual job status
   */
  async getJobStatus(jobId: string): Promise<{
    id: string;
    name: string;
    status: string;
    progress: number;
    result: any;
    error: string | null;
    createdAt: Date;
    processedOn: Date | null;
    finishedOn: Date | null;
  } | null> {
    return llmJobQueueService.getJobStatus(jobId);
  }

  /**
   * Get multiple job statuses
   * Used by UI to check status of multiple jobs at once
   */
  async getJobStatuses(jobIds: string[]): Promise<Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    result: any;
    error: string | null;
  }>> {
    const statuses = [];
    
    for (const jobId of jobIds) {
      const status = await this.getJobStatus(jobId);
      if (status) {
        statuses.push({
          id: status.id,
          name: status.name,
          status: status.status,
          progress: status.progress,
          result: status.result,
          error: status.error,
        });
      }
    }

    return statuses;
  }

  /**
   * Wait for a job to complete
   * Used when UI needs to wait for a specific job result
   */
  async waitForJobCompletion(
    jobId: string, 
    timeoutMs = 30000
  ): Promise<{
    success: boolean;
    result?: any;
    error?: string;
  }> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const checkJob = async () => {
        try {
          const status = await this.getJobStatus(jobId);
          
          if (!status) {
            resolve({ success: false, error: "Job not found" });
            return;
          }

          if (status.status === "completed") {
            resolve({ success: true, result: status.result });
            return;
          }

          if (status.status === "failed") {
            resolve({ success: false, error: status.error || "Job failed" });
            return;
          }

          // Check timeout
          if (Date.now() - startTime > timeoutMs) {
            resolve({ success: false, error: "Timeout waiting for job completion" });
            return;
          }

          // Job still running, check again in a moment
          setTimeout(checkJob, 1000);
        } catch (error) {
          resolve({ success: false, error: `Error checking job status: ${error}` });
        }
      };

      checkJob();
    });
  }

  /**
   * Get queue statistics
   * Used by UI for monitoring dashboard
   */
  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    return llmJobQueueService.getQueueStats();
  }

  /**
   * Get failed jobs for error monitoring
   */
  async getFailedJobs(limit = 20): Promise<Array<{
    id: string;
    name: string;
    error: string | null;
    stacktrace: string | null;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    finishedOn: Date | null;
  }>> {
    return llmJobQueueService.getFailedJobs(limit);
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<void> {
    return llmJobQueueService.retryJob(jobId);
  }

  /**
   * Cancel a waiting or delayed job
   */
  async cancelJob(jobId: string): Promise<void> {
    return llmJobQueueService.cancelJob(jobId);
  }

  /**
   * Register a job completion handler
   * Used for real-time UI updates
   */
  onJobCompletion(handler: (event: JobCompletionEvent) => void): void {
    this.jobCompletionHandlers.push(handler);
  }

  /**
   * Register a job progress handler
   * Used for real-time progress updates
   */
  onJobProgress(handler: (update: JobProgressUpdate) => void): void {
    this.jobProgressHandlers.push(handler);
  }

  /**
   * Remove a job completion handler
   */
  removeJobCompletionHandler(handler: (event: JobCompletionEvent) => void): void {
    const index = this.jobCompletionHandlers.indexOf(handler);
    if (index > -1) {
      this.jobCompletionHandlers.splice(index, 1);
    }
  }

  /**
   * Remove a job progress handler
   */
  removeJobProgressHandler(handler: (update: JobProgressUpdate) => void): void {
    const index = this.jobProgressHandlers.indexOf(handler);
    if (index > -1) {
      this.jobProgressHandlers.splice(index, 1);
    }
  }

  /**
   * Emit job completion event to all handlers
   */
  private emitJobCompletion(event: JobCompletionEvent): void {
    for (const handler of this.jobCompletionHandlers) {
      try {
        handler(event);
      } catch (error) {
        console.error("Error in job completion handler:", error);
      }
    }
  }

  /**
   * Emit job progress event to all handlers
   * Currently unused but available for future progress updates
   */
  emitJobProgress(update: JobProgressUpdate): void {
    for (const handler of this.jobProgressHandlers) {
      try {
        handler(update);
      } catch (error) {
        console.error("Error in job progress handler:", error);
      }
    }
  }
}

// Export singleton instance
export const llmJobResultHandlerService = new LLMJobResultHandlerService();