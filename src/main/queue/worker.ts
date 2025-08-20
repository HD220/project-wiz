import { EventEmitter } from "events";

import { eq, and, lt, sql } from "drizzle-orm";

import { jobsTable, type Job } from "@/main/schemas/job.schema";

import { createDatabaseConnection } from "@/shared/config/database";
import { getLogger } from "@/shared/services/logger/config";

const { getDatabase } = createDatabaseConnection(true);

export interface WorkerOptions {
  concurrency?: number; // Max 15 for our use case
  minPollInterval?: number; // Minimum poll interval (1s)
  maxPollInterval?: number; // Maximum poll interval (15s)
  stuckJobTimeout?: number; // Time before considering a job stuck
  heartbeatInterval?: number; // How often to update job heartbeat
}

import { JobInstance, MoveToDelayedError, MoveToFailedError } from "./job";

export interface ProcessorFunction<R = unknown> {
  (job: JobInstance): Promise<R>;
}

export interface WorkerEvents {
  active: (job: { id: string; data: unknown }) => void;
  completed: (job: { id: string; result: unknown; duration: number }) => void;
  failed: (job: { id: string; error: string; duration: number }) => void;
  stalled: (job: { id: string }) => void;
}

// Optimized Worker for single instance with 15 concurrent jobs
export class Worker<R = unknown> extends EventEmitter {
  private logger = getLogger("worker");
  private running = false;
  private processor: ProcessorFunction<R>;
  private options: Required<WorkerOptions>;
  private workerId: string;
  private activeJobs = new Map<
    string,
    {
      job: JobInstance;
      heartbeatTimer: NodeJS.Timeout;
    }
  >();
  private processingPromises = new Set<Promise<void>>();

  // Backoff exponential properties
  private currentPollInterval: number;
  private consecutiveEmptyPolls = 0;
  private backoffMultiplier = 1.5;

  constructor(
    public readonly queueName: string,
    processor: ProcessorFunction<R>,
    opts: WorkerOptions = {},
  ) {
    super();
    this.processor = processor;
    this.options = {
      concurrency: Math.min(opts.concurrency || 15, 15), // Max 15 jobs
      minPollInterval: opts.minPollInterval || 1000, // 1s minimum
      maxPollInterval: opts.maxPollInterval || 15000, // 15s maximum
      stuckJobTimeout: opts.stuckJobTimeout || 30000, // 30s timeout
      heartbeatInterval: opts.heartbeatInterval || 10000, // 10s heartbeat
    };

    // Initialize with minimum poll interval
    this.currentPollInterval = this.options.minPollInterval;

    this.workerId = `worker-${crypto.randomUUID()}`;
    this.logger.debug(
      `Worker created for queue: ${queueName} (${this.workerId})`,
    );
  }

  // Start worker with real concurrency
  async run(): Promise<void> {
    if (this.running) {
      this.logger.warn(`Worker for ${this.queueName} already running`);
      return;
    }

    this.running = true;
    this.logger.info(
      `Starting worker for queue: ${this.queueName} (concurrency: ${this.options.concurrency})`,
    );

    // No global heartbeat needed - each job has its own timer

    // Main polling loop
    while (this.running) {
      try {
        // 1. Atomic UPDATE: Recover stuck jobs (active -> delayed)
        await this.recoverStuckJobs();

        // 2. Atomic UPDATE: Process delayed jobs (delayed -> waiting)
        await this.processDelayedJobs();

        // 3. Atomic UPDATE: Get new jobs if we have capacity
        const availableSlots = this.options.concurrency - this.activeJobs.size;

        if (availableSlots > 0) {
          const newJobs = await this.getAndLockJobs(availableSlots);

          if (newJobs.length > 0) {
            // Reset backoff - we found jobs!
            this.resetBackoff();

            // Start processing jobs (no excess handling needed - LIMIT takes care of it)
            for (const jobRecord of newJobs) {
              const jobInstance = new JobInstance(jobRecord);
              this.startJobProcessing(jobInstance);
            }

            this.logger.debug(`Started processing ${newJobs.length} jobs`);
          } else {
            // No jobs found - apply backoff
            this.applyBackoff();
          }
        } else {
          // Worker at capacity - keep minimum interval
          this.currentPollInterval = this.options.minPollInterval;
        }

        // Clean up completed promises
        await this.cleanupCompletedPromises();

        // Wait with dynamic interval (1s-15s based on workload)
        await this.delay(this.currentPollInterval);
      } catch (error) {
        this.logger.error("Worker polling error:", error);
        await this.delay(this.currentPollInterval);
      }
    }

    // Cleanup
    await this.waitForAllJobs();
  }

  // Stop worker gracefully
  async close(): Promise<void> {
    this.logger.info(`Stopping worker for queue: ${this.queueName}`);
    this.running = false;

    // Wait for active jobs to finish (timers will be cleaned up automatically)
    await this.waitForAllJobs();

    this.logger.info(`Worker stopped for queue: ${this.queueName}`);
  }

  // UPDATE: Move stuck jobs from active to delayed (retry)
  private async recoverStuckJobs(): Promise<number> {
    const db = getDatabase();
    const now = Date.now();
    const stuckThreshold = new Date(now - this.options.stuckJobTimeout);

    const result = await db
      .update(jobsTable)
      .set({
        status: "delayed",
        workerId: null,
        processedOn: null,
        updatedAt: new Date(now),
        attempts: sql`${jobsTable.attempts} + 1`,
        scheduledFor: new Date(now + 5000), // 5s delay for stuck jobs
        failureReason: "Job stuck - worker timeout",
      })
      .where(
        and(
          eq(jobsTable.queueName, this.queueName),
          eq(jobsTable.status, "active"),
          lt(jobsTable.updatedAt, stuckThreshold),
        ),
      );

    const recoveredCount = result.changes || 0;
    if (recoveredCount > 0) {
      this.logger.warn(`Recovered ${recoveredCount} stuck jobs`);
    }

    return recoveredCount;
  }

  // UPDATE: Move delayed jobs to waiting (ready to process)
  private async processDelayedJobs(): Promise<number> {
    const db = getDatabase();
    const now = Date.now();

    const result = await db
      .update(jobsTable)
      .set({
        status: "waiting",
        updatedAt: new Date(now),
      })
      .where(
        and(
          eq(jobsTable.queueName, this.queueName),
          eq(jobsTable.status, "delayed"),
          lt(jobsTable.scheduledFor, new Date(now)),
          lt(jobsTable.attempts, jobsTable.maxAttempts),
        ),
      );

    const processedCount = result.changes || 0;
    if (processedCount > 0) {
      this.logger.debug(`Moved ${processedCount} delayed jobs to waiting`);
    }

    return processedCount;
  }

  // UPDATE: Get and lock waiting jobs atomically with LIMIT
  private async getAndLockJobs(maxJobs: number): Promise<Job[]> {
    const db = getDatabase();
    const now = Date.now();

    // Use rowid with MIN to get exactly maxJobs in priority order
    const jobs = await db
      .update(jobsTable)
      .set({
        status: "active",
        processedOn: new Date(now),
        updatedAt: new Date(now),
        workerId: this.workerId,
      })
      .where(
        sql`rowid IN (
          SELECT rowid FROM ${jobsTable} 
          WHERE queue_name = ${this.queueName} 
            AND status = 'waiting'
          ORDER BY priority DESC, created_at ASC
          LIMIT ${maxJobs}
        )`,
      )
      .returning();

    if (jobs.length > 0) {
      this.logger.debug(`Locked ${jobs.length} jobs for processing`);
    }

    return jobs;
  }

  // Reset backoff to minimum interval
  private resetBackoff(): void {
    this.consecutiveEmptyPolls = 0;
    this.currentPollInterval = this.options.minPollInterval;
    this.logger.debug("Backoff reset - jobs found");
  }

  // Apply exponential backoff
  private applyBackoff(): void {
    this.consecutiveEmptyPolls++;

    if (this.consecutiveEmptyPolls > 2) {
      // After 3 empty polls, start backing off
      const newInterval = Math.min(
        this.currentPollInterval * this.backoffMultiplier,
        this.options.maxPollInterval,
      );

      if (newInterval !== this.currentPollInterval) {
        this.currentPollInterval = newInterval;
        this.logger.debug(
          `Backoff applied: ${this.currentPollInterval}ms (${this.consecutiveEmptyPolls} empty polls)`,
        );
      }
    }
  }

  // Start processing a job (non-blocking)
  private startJobProcessing(job: JobInstance): void {
    // Create individual heartbeat timer for this job
    const heartbeatTimer = setInterval(async () => {
      job.alive(); // Mark as alive in memory
      await this.persistJobState(job); // Persist heartbeat
    }, this.options.heartbeatInterval);

    // Add to active jobs map with timer
    this.activeJobs.set(job.id, { job, heartbeatTimer });

    const processingPromise = this.processJob(job).finally(async () => {
      // Cleanup: cancel timer, persist final state, remove from active jobs
      clearInterval(heartbeatTimer);
      await this.persistJobState(job); // Final persist
      this.activeJobs.delete(job.id);
    });

    this.processingPromises.add(processingPromise);
  }

  // Process a single job with events
  private async processJob(job: JobInstance): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(`Processing job ${job.id}`);

      // Emit active event
      this.emit("active", { id: job.id, data: job.data });

      // Call processor function with JobInstance
      const result = await this.processor(job);

      const duration = Date.now() - startTime;

      // Mark job as completed in memory
      job.markCompleted(result);

      // Emit completed event
      this.emit("completed", { id: job.id, result, duration });

      this.logger.debug(`Job ${job.id} completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;

      // Handle specific job control errors
      if (error instanceof MoveToDelayedError) {
        // Job explicitly requested to be moved to delayed
        job.markDelayed(error.originalError || error, error.customDelay);

        this.logger.debug(
          `Job ${job.id} explicitly moved to delayed: ${error.message} ${error.customDelay ? `(custom delay: ${error.customDelay}ms)` : ""}`,
        );
      } else if (error instanceof MoveToFailedError) {
        // Job explicitly requested to be failed
        job.markFailed(error.originalError || error);

        this.logger.warn(`Job ${job.id} explicitly failed: ${error.message}`);
      } else {
        // Unknown error - follow standard retry logic
        this.logger.error(`Job ${job.id} failed after ${duration}ms:`, error);

        if (job.shouldRetry()) {
          // Mark for retry (delayed)
          job.markDelayed(error as Error);

          this.logger.debug(
            `Job ${job.id} scheduled for retry (attempt ${job.attempts}/${job.maxAttempts})`,
          );
        } else {
          // Mark as finally failed
          job.markFailed(error as Error);

          this.logger.warn(
            `Job ${job.id} failed permanently after ${job.attempts} attempts`,
          );
        }
      }

      // Emit failed event
      this.emit("failed", {
        id: job.id,
        error: (error as Error).message,
        duration,
      });
    }
  }

  // Persist job state to database (single responsibility)
  private async persistJobState(job: JobInstance): Promise<void> {
    if (!job.isDirty) {
      return; // No changes to persist
    }

    const db = getDatabase();
    const jobData = job.getRawRecord();

    await db
      .update(jobsTable)
      .set({
        status: jobData.status,
        result: jobData.result,
        attempts: jobData.attempts,
        delayMs: jobData.delayMs,
        scheduledFor: jobData.scheduledFor,
        failureReason: jobData.failureReason,
        finishedOn: jobData.finishedOn,
        updatedAt: jobData.updatedAt,
        workerId: jobData.workerId,
        processedOn: jobData.processedOn,
      })
      .where(eq(jobsTable.id, job.id));

    // Mark as persisted
    job.markPersisted();
  }

  // Clean up completed promises
  private async cleanupCompletedPromises(): Promise<void> {
    const completedPromises: Promise<void>[] = [];

    for (const promise of this.processingPromises) {
      // Check if promise is settled (completed or rejected)
      try {
        type PromiseStatus = { status: "fulfilled" | "rejected" | "pending" };

        const result: PromiseStatus = await Promise.race([
          promise.then(
            (): PromiseStatus => ({ status: "fulfilled" }),
            (): PromiseStatus => ({ status: "rejected" }),
          ),
          new Promise<PromiseStatus>((resolve) =>
            setTimeout(() => resolve({ status: "pending" }), 0),
          ),
        ]);

        if (result.status !== "pending") {
          completedPromises.push(promise);
        }
      } catch {
        // Promise was rejected, add to cleanup
        completedPromises.push(promise);
      }
    }

    // Remove completed promises
    for (const promise of completedPromises) {
      this.processingPromises.delete(promise);
    }
  }

  // Wait for all active jobs to complete
  private async waitForAllJobs(): Promise<void> {
    if (this.processingPromises.size > 0) {
      this.logger.info(
        `Waiting for ${this.processingPromises.size} active jobs to complete...`,
      );
      await Promise.allSettled(Array.from(this.processingPromises));
      this.processingPromises.clear();

      // Clean up any remaining timers (should already be cleaned by finally)
      for (const activeJob of this.activeJobs.values()) {
        clearInterval(activeJob.heartbeatTimer);
      }
      this.activeJobs.clear();
    }
  }

  // Get worker statistics
  getStats() {
    return {
      running: this.running,
      activeJobs: this.activeJobs.size,
      maxConcurrency: this.options.concurrency,
      workerId: this.workerId,
      queueName: this.queueName,
      currentPollInterval: this.currentPollInterval,
      consecutiveEmptyPolls: this.consecutiveEmptyPolls,
      heartbeatActive: this.activeJobs.size > 0, // Individual timers per job
    };
  }

  // Simple delay utility
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
