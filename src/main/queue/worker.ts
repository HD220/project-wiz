import { eq, and, asc, desc, lt } from "drizzle-orm";
import { EventEmitter } from "events";

import { createDatabaseConnection } from "@/shared/config/database";
import { getLogger } from "@/shared/services/logger/config";

import { jobsTable, type Job } from "@/main/schemas/job.schema";

const { getDatabase } = createDatabaseConnection(true);

export interface WorkerOptions {
  concurrency?: number; // Max 15 for our use case
  pollInterval?: number;
  stuckJobTimeout?: number; // Time before considering a job stuck
}

export interface ProcessorFunction<T = any, R = any> {
  (job: { id: string; data: T }): Promise<R>;
}

export interface WorkerEvents {
  active: (job: { id: string; data: any }) => void;
  completed: (job: { id: string; result: any; duration: number }) => void;
  failed: (job: { id: string; error: string; duration: number }) => void;
  stalled: (job: { id: string }) => void;
}

// Optimized Worker for single instance with 15 concurrent jobs
export class Worker<T = any, R = any> extends EventEmitter {
  private logger = getLogger("worker");
  private running = false;
  private processor: ProcessorFunction<T, R>;
  private options: Required<WorkerOptions>;
  private workerId: string;
  private activeJobs = new Set<string>();
  private processingPromises = new Set<Promise<void>>();

  constructor(
    public readonly queueName: string,
    processor: ProcessorFunction<T, R>,
    opts: WorkerOptions = {}
  ) {
    super();
    this.processor = processor;
    this.options = {
      concurrency: Math.min(opts.concurrency || 15, 15), // Max 15 jobs
      pollInterval: opts.pollInterval || 1000, // Faster polling for responsiveness
      stuckJobTimeout: opts.stuckJobTimeout || 30000, // 30s timeout
    };
    
    this.workerId = `worker-${crypto.randomUUID()}`;
    this.logger.debug(`Worker created for queue: ${queueName} (${this.workerId})`);
  }

  // Start worker with real concurrency
  async run(): Promise<void> {
    if (this.running) {
      this.logger.warn(`Worker for ${this.queueName} already running`);
      return;
    }

    this.running = true;
    this.logger.info(`Starting worker for queue: ${this.queueName} (concurrency: ${this.options.concurrency})`);

    // Main polling loop
    while (this.running) {
      try {
        // Clean up stuck jobs first
        await this.recoverStuckJobs();
        
        // Process delayed jobs (move to waiting if time has come)
        await this.processDelayedJobs();
        
        // If we have capacity, try to start new jobs
        const availableSlots = this.options.concurrency - this.activeJobs.size;
        
        if (availableSlots > 0) {
          // Get and start jobs up to available slots
          for (let i = 0; i < availableSlots; i++) {
            const job = await this.getAndLockNextJob();
            if (job) {
              this.startJobProcessing(job);
            } else {
              break; // No more jobs available
            }
          }
        }

        // Clean up completed promises
        await this.cleanupCompletedPromises();
        
        // Wait before next poll
        await this.delay(this.options.pollInterval);
        
      } catch (error) {
        this.logger.error("Worker polling error:", error);
        await this.delay(this.options.pollInterval);
      }
    }

    // Wait for all active jobs to complete before shutting down
    await this.waitForAllJobs();
  }

  // Stop worker gracefully
  async close(): Promise<void> {
    this.logger.info(`Stopping worker for queue: ${this.queueName}`);
    this.running = false;
    
    // Wait for active jobs to finish
    await this.waitForAllJobs();
    
    this.logger.info(`Worker stopped for queue: ${this.queueName}`);
  }

  // Atomic get and lock next job (for single worker)
  private async getAndLockNextJob(): Promise<Job | null> {
    const db = getDatabase();
    const now = Date.now();

    // Use UPDATE...RETURNING for atomic lock
    const [job] = await db
      .update(jobsTable)
      .set({
        status: "active",
        processedOn: new Date(now),
        updatedAt: new Date(now),
        workerId: this.workerId,
      })
      .where(
        and(
          eq(jobsTable.queueName, this.queueName),
          eq(jobsTable.status, "waiting")
        )
      )
      .orderBy(desc(jobsTable.priority), asc(jobsTable.createdAt))
      .limit(1)
      .returning();

    return job || null;
  }

  // Process delayed jobs (move to waiting if scheduled time has come)
  private async processDelayedJobs(): Promise<void> {
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
          lt(jobsTable.scheduledFor, new Date(now))
        )
      );

    if (result.changes && result.changes > 0) {
      this.logger.debug(`Moved ${result.changes} delayed jobs to waiting`);
    }
  }

  // Recover stuck jobs (jobs that have been active too long)
  private async recoverStuckJobs(): Promise<void> {
    const db = getDatabase();
    const stuckThreshold = new Date(Date.now() - this.options.stuckJobTimeout);

    const stuckJobs = await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueName, this.queueName),
          eq(jobsTable.status, "active"),
          lt(jobsTable.processedOn, stuckThreshold)
        )
      );

    for (const job of stuckJobs) {
      this.logger.warn(`Recovering stuck job: ${job.id}`);
      this.emit("stalled", { id: job.id });
      
      // Move back to waiting for retry
      await db
        .update(jobsTable)
        .set({
          status: "waiting",
          updatedAt: new Date(),
          workerId: null,
          processedOn: null,
        })
        .where(eq(jobsTable.id, job.id));
    }
  }

  // Start processing a job (non-blocking)
  private startJobProcessing(job: Job): void {
    this.activeJobs.add(job.id);
    
    const processingPromise = this.processJob(job)
      .finally(() => {
        this.activeJobs.delete(job.id);
      });
    
    this.processingPromises.add(processingPromise);
  }

  // Process a single job with events
  private async processJob(job: Job): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.logger.debug(`Processing job ${job.id}`);
      
      // Parse job data
      const jobData = JSON.parse(job.data);
      
      // Emit active event
      this.emit("active", { id: job.id, data: jobData });
      
      // Call processor function
      const result = await this.processor({
        id: job.id,
        data: jobData,
      });
      
      const duration = Date.now() - startTime;
      
      // Mark job as completed
      await this.markJobCompleted(job.id, result, duration);
      
      // Emit completed event
      this.emit("completed", { id: job.id, result, duration });
      
      this.logger.debug(`Job ${job.id} completed in ${duration}ms`);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Job ${job.id} failed after ${duration}ms:`, error);
      
      await this.markJobFailed(job.id, error as Error, duration);
      
      // Emit failed event
      this.emit("failed", { id: job.id, error: (error as Error).message, duration });
    }
  }

  // Mark job as completed with better tracking
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
        finishedOn: new Date(),
        updatedAt: new Date(),
        workerId: null, // Release worker claim
      })
      .where(eq(jobsTable.id, jobId));
  }

  // Mark job as failed with improved retry logic
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

    if (!currentJob) {
      this.logger.error(`Failed to find job ${jobId} for failure handling`);
      return;
    }

    const newAttempts = currentJob.attempts + 1;
    const shouldRetry = newAttempts < currentJob.maxAttempts;

    if (shouldRetry) {
      // Exponential backoff with jitter
      const baseDelay = Math.min(1000 * Math.pow(2, newAttempts), 30000);
      const jitter = Math.random() * 1000; // Add up to 1s jitter
      const retryDelayMs = baseDelay + jitter;
      const scheduledFor = Date.now() + retryDelayMs;
      
      await db
        .update(jobsTable)
        .set({
          status: "delayed",
          attempts: newAttempts,
          delayMs: retryDelayMs,
          scheduledFor: new Date(scheduledFor),
          failureReason: error.message,
          updatedAt: new Date(),
          workerId: null, // Release worker claim
        })
        .where(eq(jobsTable.id, jobId));
        
      this.logger.debug(`Job ${jobId} will retry in ${Math.round(retryDelayMs)}ms (attempt ${newAttempts}/${currentJob.maxAttempts})`);
    } else {
      // Mark as permanently failed
      await db
        .update(jobsTable)
        .set({
          status: "failed",
          attempts: newAttempts,
          failureReason: error.message,
          finishedOn: new Date(),
          updatedAt: new Date(),
          workerId: null, // Release worker claim
        })
        .where(eq(jobsTable.id, jobId));
        
      this.logger.warn(`Job ${jobId} failed permanently after ${newAttempts} attempts: ${error.message}`);
    }
  }

  // Clean up completed promises
  private async cleanupCompletedPromises(): Promise<void> {
    const completedPromises: Promise<void>[] = [];
    
    for (const promise of this.processingPromises) {
      // Check if promise is settled (completed or rejected)
      try {
        const result = await Promise.race([
          promise.then(() => ({ status: "fulfilled" })),
          promise.catch(() => ({ status: "rejected" })),
          new Promise(resolve => setTimeout(() => resolve({ status: "pending" }), 0))
        ]);
        
        if ((result as any).status !== "pending") {
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
      this.logger.info(`Waiting for ${this.processingPromises.size} active jobs to complete...`);
      await Promise.allSettled(Array.from(this.processingPromises));
      this.processingPromises.clear();
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
    };
  }

  // Simple delay utility
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}