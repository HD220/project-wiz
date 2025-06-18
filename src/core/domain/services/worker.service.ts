// src/core/domain/services/worker.service.ts

import { IQueueRepository } from '../../ports/repositories/queue.interface';
import { IJobRepository } from '../../ports/repositories/job.interface';
// import { IProcessor } from '../../ports/queue/processor.interface'; // No longer used
import { Job } from '../entities/jobs/job.entity';
import { Queue } from '../entities/queue/queue.entity';
import { JobStatusType } from '../entities/jobs/job-status';
import { JobRuntimeData } from '../entities/jobs/job-runtime-data.interface'; // Updated import path
import { IAgentExecutor, AgentExecutorResult } from '../../ports/agent/agent-executor.interface';
import { ConfigurationError, NotFoundError, LLMError, ToolExecutionError, JobProcessingError, CoreError } from '../common/errors';
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

  public async start(queueName: string): Promise<void> {
    if (this.isRunning) {
      console.warn(`WorkerService for queue ${queueName} is already running.`);
      return;
    }

    this.queueConfig = await this.queueRepository.findByName(queueName);
    if (!this.queueConfig) {
      const errMsg = `Queue with name ${queueName} not found. WorkerService cannot start.`;
      throw new NotFoundError(errMsg, 'Queue', queueName);
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

      const finalizedJob = this._finalizeJobState(job, executorResult);
      await this.jobRepository.save(finalizedJob);

    } catch (error: any) {
      // Ensure error is an instance of Error for consistent message/stack access
      const currentError: Error = error instanceof Error ? error : new Error(String(error));
      let jobFailureMessage = currentError.message; // Default message

      // Log with more context based on error type
      if (currentError instanceof ConfigurationError) {
        console.error(`WorkerService: ConfigurationError processing job ${job.id}: ${currentError.message}`, currentError);
        jobFailureMessage = `Configuration Error: ${currentError.message}`;
      } else if (currentError instanceof LLMError) {
        console.error(`WorkerService: LLMError processing job ${job.id} (Model: ${currentError.modelName}): ${currentError.message}`, currentError.originalError || currentError);
        jobFailureMessage = `LLM Error: ${currentError.message}`;
      } else if (currentError instanceof ToolExecutionError) {
        console.error(`WorkerService: ToolExecutionError processing job ${job.id} (Tool: ${currentError.toolName}): ${currentError.message}`, currentError.originalError || currentError);
        jobFailureMessage = `Tool Error (${currentError.toolName || 'unknown'}): ${currentError.message}`;
      } else if (currentError instanceof JobProcessingError) { // If AgentExecutor throws this
        console.error(`WorkerService: JobProcessingError for job ${job.id} (Agent: ${currentError.agentRole}): ${currentError.message}`, currentError);
        jobFailureMessage = `Job Processing Error: ${currentError.message}`;
      } else { // Generic or unknown error
        console.error(`WorkerService: Generic error processing job ${job.id}:`, currentError);
        // jobFailureMessage remains currentError.message
      }

      // Store more detailed error info in job.data.error if possible
      const errorForJobData = {
        name: currentError.name,
        message: currentError.message,
        stack: currentError.stack,
        // Add custom properties if available
        ...(currentError instanceof LLMError && { modelName: currentError.modelName, provider: currentError.provider }),
        ...(currentError instanceof ToolExecutionError && { toolName: currentError.toolName }),
        ...(currentError instanceof JobProcessingError && { jobId: currentError.jobId, agentRole: currentError.agentRole }),
        ...(currentError instanceof NotFoundError && { resourceType: currentError.resourceType, resourceId: currentError.resourceId }),
      };

      // Update job state (retry or fail)
      if (job.status.is(JobStatusType.ACTIVE)) {
          if (job.attempts < job.maxAttempts) {
              const nextRetryDelay = job.calculateNextRetryDelay();
              job.moveToDelayed(nextRetryDelay);
              job.setData({ ...(job.data || {}), error: errorForJobData, lastFailureSummary: jobFailureMessage });
              console.log(`Job ${job.id} failed. Will retry in ${nextRetryDelay}ms. Attempt ${job.attempts}/${job.maxAttempts}. Error: ${jobFailureMessage}`);
          } else {
              job.moveToFailed(jobFailureMessage);
              job.setData({ ...(job.data || {}), error: errorForJobData, lastFailureSummary: jobFailureMessage });
              console.log(`Job ${job.id} failed after ${job.maxAttempts} attempts. Error: ${jobFailureMessage}`);
          }
          await this.jobRepository.save(job);
      } else {
          console.error(`Job ${job.id} was not in ACTIVE state when error occurred in worker. Current status: ${job.status.value}. Error: ${jobFailureMessage}`);
      }
    } finally {
      this.activeJobs--;
    }
  }

  private _finalizeJobState(job: Job<any, any>, executorResult: AgentExecutorResult): Job<any, any> {
    // IMPORTANT: GenericAgentExecutor modifies job.data directly.
    // This method receives the job potentially already modified by agentExecutor,
    // and further modifies its status and other properties based on executorResult.

    switch (executorResult.status) {
      case 'COMPLETED':
        job.moveToCompleted(executorResult.output || { message: executorResult.message });
        console.log(`WorkerService: Job ${job.id} COMPLETED by agent. Message: ${executorResult.message}`);
        // REMOVE: await this.jobRepository.save(job);
        break;
      case 'FAILED':
        job.moveToFailed(executorResult.message);
        console.log(`WorkerService: Job ${job.id} FAILED execution by agent. Message: ${executorResult.message}`);
        // REMOVE: await this.jobRepository.save(job);
        break;
      case 'CONTINUE_PROCESSING':
        // AgentExecutor has updated job.data with new agentState.
        // WorkerService needs to save this job, and it should be picked up again.
        // Move to WAITING to be picked up immediately in next poll cycle, or DELAYED for a short pause.
        job.moveToWaiting(); // Or job.moveToDelayed(500); // e.g., 0.5 second delay
        console.log(`WorkerService: Job ${job.id} requires CONTINUATION. Message: ${executorResult.message}. Job status updated.`);
        // REMOVE: await this.jobRepository.save(job);
        break;
      default:
        console.error(`WorkerService: Unknown status from AgentExecutor for job ${job.id}: ${executorResult.status}`);
        job.moveToFailed(\`Unknown executor status: \${executorResult.status}\`);
        // REMOVE: await this.jobRepository.save(job);
    }
    return job; // Return the modified job
  }
}
