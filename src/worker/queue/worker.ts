import { and, eq, desc, asc } from "drizzle-orm";

import { jobsTable, type SelectJob } from "@/worker/schemas/job.schema";

import { createDatabaseConnection } from "@/shared/config/database";
import { getLogger } from "@/shared/services/logger/config";

import type {
  JobExecutionResult,
  ProcessorConfig,
  JobFunction,
} from "./job.types";

const { getDatabase } = createDatabaseConnection(true);

export class Worker {
  private running = false;
  private config: ProcessorConfig = {
    pollInterval: 500, // 500ms to reduce database load
    maxConcurrentJobs: 1, // Sequential processing
    retryDelay: 1000, // 1 second retry delay
  };
  private queueName: string;
  private jobFunction: JobFunction;
  private logger = getLogger("worker-queue");

  constructor(
    queueName: string,
    jobFunction: JobFunction,
    config?: Partial<ProcessorConfig>,
  ) {
    this.queueName = queueName;
    this.jobFunction = jobFunction;
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  async start(): Promise<void> {
    this.running = true;
    this.logger.info("🔄 Job processor started with config:", this.config);

    while (this.running) {
      try {
        const job = await this.getNextJob();
        if (job) {
          // Process job sequentially - one at a time
          await this.processJob(job);
        } else {
          // No jobs found - wait before next poll
          await this.delay(this.config.pollInterval);
        }
      } catch (error) {
        this.logger.error("💥 Job processing error:", error);
        await this.delay(this.config.pollInterval);
      }
    }
  }

  async stop(): Promise<void> {
    this.logger.info("🛑 Stopping job processor...");
    this.running = false;
  }

  private async getNextJob(): Promise<SelectJob | null> {
    const db = getDatabase();

    // Get waiting jobs or delayed jobs that are ready to be processed
    const job = await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.name, this.queueName), // Filter by queue name
          eq(jobsTable.dependencyCount, 0),
          eq(jobsTable.status, "waiting"), // Only get waiting jobs
        ),
      )
      .orderBy(desc(jobsTable.priority), asc(jobsTable.createdAt))
      .limit(1)
      .get();

    // Job is already filtered to be "waiting" status, so just return it
    return job || null;
  }

  private async processJob(job: SelectJob): Promise<void> {
    const startTime = Date.now();
    this.logger.debug(`🔄 Processing job ${job.id} (${job.name})`);

    try {
      // Mark job as active
      await this.markJobActive(job.id);

      // Execute the job based on its type
      const result = await this.executeJob(job);

      // Mark job as completed
      await this.markJobCompleted(job.id, result, Date.now() - startTime);

      this.logger.info(`✅ Job ${job.id} completed successfully`);
    } catch (error) {
      this.logger.error(`❌ Job ${job.id} failed:`, error);
      await this.markJobFailed(job.id, error as Error, Date.now() - startTime);
    }
  }

  private async executeJob(job: SelectJob): Promise<JobExecutionResult> {
    try {
      const jobForProcessor = {
        id: job.id,
        name: job.name,
        data: JSON.parse(job.data),
        opts: job.opts ? JSON.parse(job.opts) : undefined,
      };

      const result = await this.jobFunction(jobForProcessor);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

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

  private async markJobCompleted(
    jobId: string,
    result: JobExecutionResult,
    _duration: number,
  ): Promise<void> {
    const db = getDatabase();
    await db
      .update(jobsTable)
      .set({
        status: "completed",
        result: JSON.stringify(result),
        finishedOn: new Date(Date.now()),
        progress: 100,
      })
      .where(eq(jobsTable.id, jobId));

    // Update dependent jobs (decrease dependency count)
    await this.updateDependentJobs(jobId);
  }

  private async markJobFailed(
    jobId: string,
    error: Error,
    _duration: number,
  ): Promise<void> {
    const db = getDatabase();
    // First, get the current job to check retry attempts
    const job = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.id, jobId))
      .get();

    if (!job) {
      this.logger.error(`Job ${jobId} not found when marking as failed`);
      return;
    }

    const newAttempts = job.attempts + 1;
    const shouldRetry = newAttempts < job.maxAttempts;

    if (shouldRetry) {
      this.logger.info(
        `🔄 Retrying job ${jobId} (attempt ${newAttempts}/${job.maxAttempts})`,
      );

      // Mark as waiting for retry with backoff delay
      const retryDelay = this.calculateRetryDelay(newAttempts);
      await db
        .update(jobsTable)
        .set({
          status: "delayed",
          attempts: newAttempts,
          delay: retryDelay,
          failureReason: error.message, // Keep last error for debugging
          processedOn: new Date(Date.now() + retryDelay), // Set when job should become available
        })
        .where(eq(jobsTable.id, jobId));

      this.logger.info(`⏰ Job ${jobId} will retry in ${retryDelay}ms`);
    } else {
      this.logger.warn(
        `❌ Job ${jobId} exhausted all retry attempts (${newAttempts}/${job.maxAttempts})`,
      );

      // Mark as permanently failed
      await db
        .update(jobsTable)
        .set({
          status: "failed",
          attempts: newAttempts,
          failureReason: error.message,
          stacktrace: error.stack,
          finishedOn: new Date(Date.now()),
        })
        .where(eq(jobsTable.id, jobId));
    }
  }

  private async updateDependentJobs(completedJobId: string): Promise<void> {
    const db = getDatabase();
    // Find all jobs that depend on this completed job
    const dependentJobs = await db
      .select()
      .from(jobsTable)
      .where(eq(jobsTable.parentJobId, completedJobId));

    // Decrease dependency count for each dependent job
    for (const job of dependentJobs) {
      const newDependencyCount = Math.max(0, job.dependencyCount - 1);

      await db
        .update(jobsTable)
        .set({
          dependencyCount: newDependencyCount,
        })
        .where(eq(jobsTable.id, job.id));
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay for retries
   * Uses exponential backoff: base * (2 ^ attempts) with jitter
   */
  private calculateRetryDelay(attempts: number): number {
    const baseDelay = 1000; // 1 second base delay
    const maxDelay = 30000; // 30 seconds max delay

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (capped)
    const exponentialDelay = baseDelay * Math.pow(2, attempts - 1);

    // Add jitter (±25%) to prevent thundering herd
    const jitter = 0.25;
    const jitterFactor = 1 + (Math.random() - 0.5) * jitter;

    const finalDelay = Math.min(exponentialDelay * jitterFactor, maxDelay);

    return Math.floor(finalDelay);
  }
}
