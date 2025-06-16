// src/core/domain/services/worker.service.ts

import { IQueueRepository } from '../../ports/repositories/queue.interface';
import { IJobRepository } from '../../ports/repositories/job.interface';
// import { IProcessor } from '../../ports/queue/processor.interface'; // No longer used
import { Job } from '../entities/jobs/job.entity';
import { Queue } from '../entities/queue/queue.entity';
import { JobStatusType } from '../entities/jobs/job-status';
import { GenericAgentExecutor, AgentExecutorResult } from '../../agents/generic-agent-executor'; // AgentExecutorResultStatus not used directly here
import { AgentPersonaTemplate } from '../entities/agent/persona-template.types';
import { toolRegistry, ToolRegistry } from '../../../infrastructure/tools/tool-registry';


export class WorkerService { // Removed <PInput, POutput>
  private queueRepository: IQueueRepository;
  private jobRepository: IJobRepository;
  // private processor: IProcessor<PInput, POutput>; // Remove this
  private agentPersonaTemplate: AgentPersonaTemplate;
  private agentExecutor: GenericAgentExecutor;
  private isRunning: boolean = false;
  private activeJobs: number = 0;
  private queueConfig: Queue | null = null;
  private pollInterval: NodeJS.Timeout | null = null;
  private readonly pollFrequencyMs: number = 5000; // Check for new jobs every 5 seconds

  constructor(
    queueRepository: IQueueRepository,
    jobRepository: IJobRepository,
    // processor: IProcessor<PInput, POutput>, // Remove this parameter
    agentPersonaTemplate: AgentPersonaTemplate, // Add this
    toolReg: ToolRegistry = toolRegistry, // Add this, with default
    options?: { pollFrequencyMs?: number }
  ) {
    this.queueRepository = queueRepository;
    this.jobRepository = jobRepository;
    this.agentPersonaTemplate = agentPersonaTemplate; // Store this
    this.agentExecutor = new GenericAgentExecutor(this.agentPersonaTemplate, toolReg); // Instantiate executor
    if (options?.pollFrequencyMs) {
      this.pollFrequencyMs = options.pollFrequencyMs;
    }
    console.log(`WorkerService initialized for Agent Role: ${this.agentPersonaTemplate.role}`);
  }

  public async start(queueName: string): Promise<void> {
    if (this.isRunning) {
      console.warn(`WorkerService for queue ${queueName} is already running.`);
      return;
    }

    this.queueConfig = await this.queueRepository.findByName(queueName);
    if (!this.queueConfig) {
      const errMsg = `Queue with name ${queueName} not found. WorkerService cannot start.`;
      console.error(errMsg);
      throw new Error(errMsg);
    }

    this.isRunning = true;
    this.activeJobs = 0;
    console.log(`WorkerService started for queue: ${this.queueConfig.name} (ID: ${this.queueConfig.id}) with concurrency ${this.queueConfig.concurrency}`);

    this.pollInterval = setInterval(() => this.poll(), this.pollFrequencyMs);
    this.poll();
  }

  public stop(): void {
    if (!this.isRunning) {
      console.warn('WorkerService is not running.');
      return;
    }
    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    console.log(`WorkerService stopped for queue: ${this.queueConfig?.name}`);
  }

  private async poll(): Promise<void> {
    if (!this.isRunning || !this.queueConfig) {
      if (!this.queueConfig && this.isRunning) {
          console.error("WorkerService polling without queue configuration.");
          this.stop();
      }
      return;
    }

    if (this.activeJobs >= this.queueConfig.concurrency) {
      return;
    }

    try {
      const availableSlots = this.queueConfig.concurrency - this.activeJobs;
      if (availableSlots <= 0) return;

      const pendingJobs = await this.jobRepository.findPending(this.queueConfig.id, availableSlots);

      if (pendingJobs.length === 0) {
        return;
      }

      for (const job of pendingJobs) {
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
      console.log(`WorkerService: Processing job ${job.id} for agent role ${this.agentPersonaTemplate.role}. Attempt: ${job.attempts + 1}`);

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
