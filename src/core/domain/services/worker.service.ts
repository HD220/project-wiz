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
import { logger } from '../../../infrastructure/services/logging';
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
    logger.info(`WorkerService initialized`, { handlesRole: this.handlesRole });
  }

  public async start(queueName: string): Promise<void> {
    if (this.isRunning) {
      logger.warn(`WorkerService for queue already running`, { queueName, handlesRole: this.handlesRole });
      return;
    }

    this.queueConfig = await this.queueRepository.findByName(queueName);
    if (!this.queueConfig) {
      const errMsg = `Queue with name ${queueName} not found. WorkerService cannot start.`;
      throw new NotFoundError(errMsg, 'Queue', queueName);
    }

    this.isRunning = true;
    this.activeJobs = 0;
    logger.info(`WorkerService started`, { queueName: this.queueConfig.name, queueId: this.queueConfig.id, concurrency: this.queueConfig.concurrency, handlesRole: this.handlesRole });

    this.pollInterval = setInterval(() => this.poll(), this.pollFrequencyMs);
    this.poll();
  }

  public stop(): void {
    if (!this.isRunning) {
      logger.warn('WorkerService is not running.', { queueName: this.queueConfig?.name, handlesRole: this.handlesRole });
      return;
    }
    this.isRunning = false;
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    logger.info(`WorkerService stopped`, { queueName: this.queueConfig?.name, handlesRole: this.handlesRole });
  }

  private async poll(): Promise<void> {
    if (!this.isRunning || !this.queueConfig) {
      if (!this.queueConfig && this.isRunning) {
          logger.error("WorkerService polling without queue configuration", undefined, { handlesRole: this.handlesRole });
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
          this.processJob(job).catch(err => { // err is already an Error object or string
            logger.error(`Unhandled error from processJob promise for job ID: ${job.id}`, err instanceof Error ? err : new Error(String(err)), { jobId: job.id, handlesRole: this.handlesRole });
          });
        } else {
          break;
        }
      }
    } catch (error: any) {
      logger.error(`Error during polling for queue`, error, { queueName: this.queueConfig?.name, handlesRole: this.handlesRole });
    }
  }

  private async processJob(job: Job<any, any>): Promise<void> {
    const jobContext: LogContext = { jobId: job.id, jobName: job.name, handledRole: this.handlesRole, attempt: job.attempts + 1 };
    try {
      logger.info("Processing job", jobContext);

      if (!job.status.is(JobStatusType.WAITING) && !job.status.is(JobStatusType.DELAYED)) {
          logger.warn("Job not in processable state. Skipping.", { ...jobContext, currentStatus: job.status.value });
          this.activeJobs--;
          return;
      }

      if (!job.moveToActive()) {
        logger.warn("Job could not be moved to ACTIVE.", { ...jobContext, currentStatus: job.status.value });
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
        logger.error(\`ConfigurationError processing job: \${currentError.message}\`, currentError, jobContext);
        jobFailureMessage = `Configuration Error: ${currentError.message}`;
      } else if (currentError instanceof LLMError) {
        logger.error(\`LLMError processing job (Model: \${currentError.modelName}): \${currentError.message}\`, currentError.originalError || currentError, { ...jobContext, modelName: currentError.modelName, provider: currentError.provider });
        jobFailureMessage = `LLM Error: ${currentError.message}`;
      } else if (currentError instanceof ToolExecutionError) {
        logger.error(\`ToolExecutionError processing job (Tool: \${currentError.toolName}): \${currentError.message}\`, currentError.originalError || currentError, { ...jobContext, toolName: currentError.toolName });
        jobFailureMessage = `Tool Error (${currentError.toolName || 'unknown'}): ${currentError.message}`;
      } else if (currentError instanceof JobProcessingError) {
        logger.error(\`JobProcessingError for job (Agent: \${currentError.agentRole}): \${currentError.message}\`, currentError, { ...jobContext, agentRoleError: currentError.agentRole });
        jobFailureMessage = `Job Processing Error: ${currentError.message}`;
      } else { // Generic or unknown error
        logger.error("Generic error processing job.", currentError, jobContext);
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
              logger.info(\`Job failed, will retry\`, { ...jobContext, retryDelay: nextRetryDelay, error: jobFailureMessage });
          } else {
              job.moveToFailed(jobFailureMessage);
              job.setData({ ...(job.data || {}), error: errorForJobData, lastFailureSummary: jobFailureMessage });
              logger.warn(\`Job failed after max attempts\`, { ...jobContext, error: jobFailureMessage });
          }
          await this.jobRepository.save(job);
      } else {
          logger.error(\`Job was not in ACTIVE state when error occurred in worker.\`, currentError, { ...jobContext, currentStatus: job.status.value, originalErrorMsg: jobFailureMessage });
      }
    } finally {
      this.activeJobs--;
    }
  }

  private _finalizeJobState(job: Job<any, any>, executorResult: AgentExecutorResult): Job<any, any> {
    // IMPORTANT: GenericAgentExecutor modifies job.data directly.
    // This method receives the job potentially already modified by agentExecutor,
    // and further modifies its status and other properties based on executorResult.

    const jobContext = { jobId: job.id, agentRole: this.handlesRole };
    switch (executorResult.status) {
      case 'COMPLETED':
        job.moveToCompleted(executorResult.output || { message: executorResult.message });
        logger.info("Job COMPLETED by agent.", { ...jobContext, message: executorResult.message });
        break;
      case 'FAILED':
        job.moveToFailed(executorResult.message);
        logger.warn("Job FAILED execution by agent.", { ...jobContext, message: executorResult.message });
        break;
      case 'CONTINUE_PROCESSING':
        job.moveToWaiting(); // Or job.moveToDelayed(500);
        logger.info("Job requires CONTINUATION. Status updated.", { ...jobContext, message: executorResult.message });
        break;
      default:
        logger.error(\`Unknown status from AgentExecutor for job\`, undefined, { ...jobContext, executorStatus: executorResult.status });
        job.moveToFailed(\`Unknown executor status: \${executorResult.status}\`);
    }
    return job; // Return the modified job
  }
}
