import { eq, and, asc, desc, lt } from "drizzle-orm";

import { createDatabaseConnection } from "@/shared/config/database";
import { getLogger } from "@/shared/services/logger/config";

import { jobsTable, type Job } from "@/main/schemas/job.schema";

const { getDatabase } = createDatabaseConnection(true);

export interface WorkerOptions {
  concurrency?: number;
  pollInterval?: number;
}

export interface ProcessorFunction<T = any, R = any> {
  (job: { id: string; data: T }): Promise<R>;
}

// Complete BullMQ-style Worker
export class Worker<T = any, R = any> {
  private logger = getLogger("worker");
  private running = false;
  private processor: ProcessorFunction<T, R>;
  private options: Required<WorkerOptions>;

  constructor(
    public readonly queueName: string,
    processor: ProcessorFunction<T, R>,
    opts: WorkerOptions = {}
  ) {
    this.processor = processor;
    this.options = {
      concurrency: opts.concurrency || 1,
      pollInterval: opts.pollInterval || 5000,
    };
    
    this.logger.debug(`Worker created for queue: ${queueName}`);
  }

  // Start worker
  async run(): Promise<void> {
    if (this.running) {
      this.logger.warn(`Worker for ${this.queueName} already running`);
      return;
    }

    this.running = true;
    this.logger.info(`Starting worker for queue: ${this.queueName}`);

    while (this.running) {
      try {
        // Process delayed jobs first
        await this.processDelayedJobs();
        
        // Get next job
        const job = await this.getNextJob();
        
        if (job) {
          await this.processJob(job);
        } else {
          // No jobs, wait before polling again
          await this.delay(this.options.pollInterval);
        }
      } catch (error) {
        this.logger.error("Worker polling error:", error);
        await this.delay(this.options.pollInterval);
      }
    }
  }

  // Stop worker
  async close(): Promise<void> {
    this.logger.info(`Stopping worker for queue: ${this.queueName}`);
    this.running = false;
  }

  // Get next job to process
  private async getNextJob(): Promise<Job | null> {
    const db = getDatabase();

    const [job] = await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.queueName),
          eq(jobsTable.status, "waiting")
        )
      )
      .orderBy(desc(jobsTable.priority), asc(jobsTable.createdAt))
      .limit(1);

    return job || null;
  }

  // Process delayed jobs (move to waiting if delay expired)
  private async processDelayedJobs(): Promise<void> {
    const db = getDatabase();
    const now = Date.now();

    await db
      .update(jobsTable)
      .set({ status: "waiting" })
      .where(
        and(
          eq(jobsTable.queueName, this.queueName),
          eq(jobsTable.status, "delayed"),
          lt(jobsTable.delay, now)
        )
      );
  }

  // Process a single job
  private async processJob(job: Job): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Mark job as active
      await this.markJobActive(job.id);
      
      this.logger.debug(`Processing job ${job.id}`);
      
      // Parse job data
      const jobData = JSON.parse(job.data);
      
      // Call processor function
      const result = await this.processor({
        id: job.id,
        data: jobData,
      });
      
      // Mark job as completed
      await this.markJobCompleted(job.id, result, Date.now() - startTime);
      
      this.logger.debug(`Job ${job.id} completed successfully`);
      
    } catch (error) {
      this.logger.error(`Job ${job.id} failed:`, error);
      await this.markJobFailed(job.id, error as Error, Date.now() - startTime);
    }
  }

  // Mark job as active
  private async markJobActive(jobId: string): Promise<void> {
    const db = getDatabase();
    
    await db
      .update(jobsTable)
      .set({
        status: "active",
        processedOn: new Date(Date.now()),
      })
      .where(eq(jobsTable.id, jobId));
  }

  // Mark job as completed
  private async markJobCompleted(
    jobId: string,
    result: any,
    _duration: number
  ): Promise<void> {
    const db = getDatabase();
    
    await db
      .update(jobsTable)
      .set({
        status: "completed",
        result: JSON.stringify(result),
        finishedOn: new Date(Date.now()),
      })
      .where(eq(jobsTable.id, jobId));
  }

  // Mark job as failed
  private async markJobFailed(
    jobId: string,
    error: Error,
    _duration: number
  ): Promise<void> {
    const db = getDatabase();
    
    // Get current job to check retry logic
    const [currentJob] = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.id, jobId))
      .limit(1);

    if (!currentJob) return;

    const newAttempts = currentJob.attempts + 1;
    const shouldRetry = newAttempts < currentJob.maxAttempts;

    if (shouldRetry) {
      // Retry with exponential backoff
      const retryDelay = Math.min(1000 * Math.pow(2, newAttempts), 30000);
      
      await db
        .update(jobsTable)
        .set({
          status: "delayed",
          attempts: newAttempts,
          delay: Date.now() + retryDelay,
          failureReason: error.message,
        })
        .where(eq(jobsTable.id, jobId));
        
      this.logger.debug(`Job ${jobId} will retry in ${retryDelay}ms (attempt ${newAttempts})`);
    } else {
      // Mark as permanently failed
      await db
        .update(jobsTable)
        .set({
          status: "failed",
          attempts: newAttempts,
          failureReason: error.message,
          finishedOn: new Date(Date.now()),
        })
        .where(eq(jobsTable.id, jobId));
        
      this.logger.warn(`Job ${jobId} failed permanently after ${newAttempts} attempts`);
    }
  }

  // Simple delay utility
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}