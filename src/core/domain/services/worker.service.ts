// src/core/domain/services/worker.service.ts

import { IQueueRepository } from '../../ports/repositories/queue.interface';
import { IJobRepository } from '../../ports/repositories/job.interface';
// import { IProcessor } from '../../ports/queue/processor.interface'; // No longer used
import { Job } from '../entities/jobs/job.entity';
import { Queue } from '../entities/queue/queue.entity';
import { JobStatusType } from '../entities/jobs/job-status';
import { IAgentExecutor, AgentExecutorResult } from '../../ports/agent/agent-executor.interface';
// import { AgentPersonaTemplate } from '../entities/agent/persona-template.types'; // No longer directly stored
// import { toolRegistry, ToolRegistry } from '../../../infrastructure/tools/tool-registry'; // No longer used for construction


export class WorkerService { // Removed <PInput, POutput>
  private queueRepository: IQueueRepository;
  private jobRepository: IJobRepository;
  // private processor: IProcessor<PInput, POutput>; // Remove this
  private agentExecutor: IAgentExecutor; // Change to interface
  private handlesRole: string; // Add this
  private isRunning: boolean = false;
  private activeJobs: number = 0;
  private queueConfig: Queue | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private readonly pollFrequencyMs: number = 5000; // Check for new jobs every 5 seconds

  constructor(
    queueRepository: IQueueRepository,
    jobRepository: IJobRepository,
    agentExecutor: IAgentExecutor, // Inject the interface
    handlesRole: string,          // Specify which role this worker instance handles
    options?: { pollFrequencyMs?: number }
  ) {
    this.queueRepository = queueRepository;
    this.jobRepository = jobRepository;
    this.agentExecutor = agentExecutor; // Store the injected executor
    this.handlesRole = handlesRole;     // Store the role it handles
    if (options?.pollFrequencyMs) {
      this.pollFrequencyMs = options.pollFrequencyMs;
    }
    console.log(`WorkerService initialized to handle role: ${this.handlesRole}`);
  }

  /**
   * Inicia o worker para processar jobs continuamente
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.logger.info("WorkerService started", {
      pollInterval: this.options.pollInterval,
      maxRetries: this.options.maxRetries,
    });

    while (this.isRunning) {
      try {
        await this.processNextJob();
      } catch (error) {
        console.error("Error in worker loop:", error);
      }

      // Intervalo entre verificações de novos jobs
      await new Promise((resolve) =>
        setTimeout(resolve, this.options.pollInterval)
      );
    }
  }

  /**
   * Para o worker graciosamente
   */
  stop(): void {
    this.isRunning = false;
    this.logger.info("WorkerService stopping...", {
      activeJobs: this.currentJobs.size,
    });
  }

  /**
   * Processa o próximo job disponível na fila
   */
  private async processNextJob(): Promise<void> {
    // O repositório já retorna o job com maior prioridade
    const jobResult = await this.queueRepository.getNextJob();
    if (!jobResult.success) {
      this.logger.error("Failed to get next job", {
        error: jobResult.error,
      });
      return;
    }

    if (!jobResult.data || !this.isRunning) {
      return;
    }

    try {
      const availableSlots = this.queueConfig.concurrency - this.activeJobs;
      if (availableSlots <= 0) return;

      const jobsForThisWorker = await this.jobRepository.findPendingByRole(
        this.queueConfig.id,
        this.handlesRole,
        availableSlots
      );

      if (jobsForThisWorker.length === 0) {
        // console.log(`WorkerService (${this.handlesRole}): No jobs found for role ${this.handlesRole} in this poll.`);
        return;
      }
      // console.log(`WorkerService (${this.handlesRole}): Found ${jobsForThisWorker.length} jobs for role ${this.handlesRole}.`);


      for (const job of jobsForThisWorker) {
        if (this.activeJobs < this.queueConfig.concurrency) {
          this.activeJobs++;
          // Non-blocking call to processJob
          this.processJob(job).catch(err => {
            console.error(`Unhandled error from processJob promise (ID: ${job.id}):`, err);
          });
        } else {
          break;
        }
      }
    } catch (error) {
      console.error(`Error during polling for queue ${this.queueConfig.name}:`, error);
    }
  }

  private async processJob(job: Job<any, any>): Promise<void> { // Input/Output types might be broader now
    try {
      console.log(`WorkerService: Processing job ${job.id} for handled role '${this.handlesRole}'. Attempt: ${job.attempts + 1}`);

      if (!job.status.is(JobStatusType.WAITING) && !job.status.is(JobStatusType.DELAYED)) {
          console.warn(`Job ${job.id} is not in a processable state. Current status: ${job.status.value}. Skipping.`);
          this.activeJobs--;
          return;
      }

      if (!job.moveToActive()) {
        console.warn(`Job ${job.id} could not be moved to ACTIVE. Current status: ${job.status.value}.`);
        this.activeJobs--;
        return;
      }
      // Save job as ACTIVE before processing
      // Note: job.data might have been updated by a previous partial execution by GenericAgentExecutor
      // So, using save() instead of update() to ensure full state persistence if job entity was re-fetched.
      // However, if 'job' is the same instance that GenericAgentExecutor modified, update() is fine.
      // For robustness with the new agentState in job.data, jobRepository.save is better.
      await this.jobRepository.save(job);

      const executorResult: AgentExecutorResult = await this.agentExecutor.processJob(job);

      // IMPORTANT: GenericAgentExecutor modifies job.data directly.
      // Now, WorkerService needs to persist this modified job object.

      switch (executorResult.status) {
        case 'COMPLETED':
          job.moveToCompleted(executorResult.output || { message: executorResult.message });
          console.log(`WorkerService: Job ${job.id} COMPLETED by agent. Message: ${executorResult.message}`);
          await this.jobRepository.save(job); // Save final state
          break;
        case 'FAILED':
          job.moveToFailed(executorResult.message); // Store failure message
          console.log(`WorkerService: Job ${job.id} FAILED execution by agent. Message: ${executorResult.message}`);
          await this.jobRepository.save(job); // Save final state
          break;
        case 'CONTINUE_PROCESSING':
          // AgentExecutor has updated job.data with new agentState.
          // WorkerService needs to save this job, and it should be picked up again.
          // Move to WAITING to be picked up immediately in next poll cycle, or DELAYED for a short pause.
          job.moveToWaiting(); // Or job.moveToDelayed(500); // e.g., 0.5 second delay
          console.log(`WorkerService: Job ${job.id} requires CONTINUATION. Message: ${executorResult.message}. Job saved and re-queued.`);
          await this.jobRepository.save(job); // Persist the updated job.data (with agentState)
          break;
        default:
          console.error(`WorkerService: Unknown status from AgentExecutor for job ${job.id}: ${executorResult.status}`);
          job.moveToFailed(\`Unknown executor status: \${executorResult.status}\`);
          await this.jobRepository.save(job);
      }
    } catch (error: any) { // Catch errors from agentExecutor.processJob or job state transitions
      console.error(`WorkerService: Error processing job ${job.id}:`, error.message);
      // Generic retry logic (could be enhanced)
      if (job.status.is(JobStatusType.ACTIVE)) { // Ensure it was active
          if (job.attempts < job.maxAttempts) {
              const nextRetryDelay = job.calculateNextRetryDelay();
              job.moveToDelayed(nextRetryDelay);
              console.log(`Job ${job.id} failed. Will retry in ${nextRetryDelay}ms. Attempt ${job.attempts}/${job.maxAttempts}.`);
          } else {
              job.moveToFailed(error.message || 'Max attempts reached after worker error');
              console.log(`Job ${job.id} failed after ${job.maxAttempts} attempts.`);
          }
          await this.jobRepository.save(job); // Save updated state
      } else {
          // If it wasn't even active, something went wrong earlier. Log and don't change state further.
          console.error(`Job ${job.id} was not in ACTIVE state when error occurred in worker. Current status: ${job.status.value}`);
      }
    } finally {
      this.activeJobs--;
    }
  }
}
