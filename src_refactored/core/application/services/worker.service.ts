// src_refactored/core/application/services/worker.service.ts
import { ILogger } from '@/core/common/services/i-logger.service';
import { Agent } from '@/domain/agent/entities/agent.entity'; // Added for type hint
import { IAgentRepository } from '@/domain/agent/ports/i-agent-repository.interface';
import { AgentIdVO } from '@/domain/agent/value-objects/agent-id.vo';
import { Job } from '@/domain/job/entities/job.entity'; // Needed for type hint in _processNextJobCycle
import { IJobRepository } from '@/domain/job/ports/i-job.repository';
import { JobStatusVO } from '@/domain/job/value-objects/job-status.vo';
import { TargetAgentRoleVO } from '@/domain/job/value-objects/target-agent-role.vo';

import { IAgentExecutor } from '../ports/services/i-agent-executor.interface';
import { IWorkerService } from '../ports/services/i-worker.service';
// import { JobIdVO } from '@/domain/job/value-objects/job-id.vo'; // Not directly used yet


// Using NodeJS.Timeout for type, adjust if in a different environment (e.g., browser)
// For Node.js, it's better to import Timeout type directly:
// import { Timeout } from 'node:timers'; -> This would be ideal if 'node:' imports are allowed by lint/tsconfig
// type Timer = ReturnType<typeof setInterval>; // No longer using setInterval

export class WorkerService implements IWorkerService {
  private targetAgentRole?: TargetAgentRoleVO;
  private isCurrentlyRunning: boolean = false;
  // private processingLoopInterval: Timer | null = null; // Replaced by while loop
  private readonly loopIntervalMs: number = 10000; // Default to 10 seconds
  private continueProcessing: boolean = false; // To control the while loop externally via stop()

  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly agentRepository: IAgentRepository,
    private readonly agentExecutor: IAgentExecutor,
    private readonly logger: ILogger,
  ) {
    this.logger.info('WorkerService instantiated');
  }

  public async start(role: TargetAgentRoleVO): Promise<void> {
    if (this.isCurrentlyRunning) {
      this.logger.warn(`WorkerService for role ${role.value} is already running.`);
      // Consider throwing an error or returning a specific result
      return;
    }

    this.targetAgentRole = role;
    this.isCurrentlyRunning = true;
    this.logger.info(`WorkerService starting for role: ${this.targetAgentRole.value}`);

    // Start the processing loop
    this.continueProcessing = true;
    this.runProcessingLoop(); // Fire-and-forget the loop runner

    this.logger.info(`WorkerService for role ${this.targetAgentRole.value} started. Polling interval: ${this.loopIntervalMs}ms.`);
  }

  private async runProcessingLoop(): Promise<void> {
    this.logger.info(`WorkerService (role: ${this.targetAgentRole?.value}) processing loop initiated.`);
    while (this.continueProcessing) {
      try {
        await this._processNextJobCycle();
      } catch (loopError) {
        this.logger.error(`WorkerService (role: ${this.targetAgentRole?.value}) - Unhandled error in processing loop:`, loopError);
        // Avoid tight loop on unhandled errors; still pause.
      }
      if (this.continueProcessing) { // Check again before sleeping
        await new Promise(resolve => setTimeout(resolve, this.loopIntervalMs));
      }
    }
    this.logger.info(`WorkerService (role: ${this.targetAgentRole?.value}) processing loop terminated.`);
  }

  public async stop(): Promise<void> {
    if (!this.isCurrentlyRunning) { // isCurrentlyRunning still reflects the public state
      this.logger.warn(`WorkerService (role: ${this.targetAgentRole?.value || 'unassigned'}) is not running or already stopping.`);
      return;
    }

    this.logger.info(`WorkerService for role ${this.targetAgentRole?.value || 'unassigned'} stopping...`);
    this.continueProcessing = false; // Signal the loop to stop
    this.isCurrentlyRunning = false; // Update public state
    // The loop will exit on its next check of this.continueProcessing
    // No interval to clear directly with this while-loop pattern
  }

  public isRunning(): boolean {
    return this.isCurrentlyRunning;
  }

  private async _processNextJobCycle(): Promise<void> {
    // Renamed isCurrentlyRunning to a local variable to avoid confusion with the class member that stop() sets.
    // The loop itself is controlled by this.continueProcessing.
    // The method _processNextJobCycle should only execute if continueProcessing is true.
    if (!this.targetAgentRole) {
        this.logger.error('WorkerService - _processNextJobCycle called without targetAgentRole configured.');
        return;
    }

    this.logger.debug(`WorkerService (role: ${this.targetAgentRole.value}) - checking for next job.`);

    const jobResult = await this.jobRepository.findNextProcessableByRole(this.targetAgentRole);

    if (jobResult.isErr()) {
      this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - error fetching next job:`, jobResult.error);
      return;
    }

    const job = jobResult.value;
    if (!job) {
      this.logger.debug(`WorkerService (role: ${this.targetAgentRole.value}) - no pending jobs found.`);
      return;
    }

    this.logger.info(`WorkerService (role: ${this.targetAgentRole.value}) - found job ${job.id.value}. Attempting to retrieve agent.`);

    // TODO: APP-PORT-003 might need to define how Agent is identified.
    // Assuming Agent is identified by the job's targetAgentRole.
    // The IAgentRepository might need a findByRole method, or we fetch an Agent pre-configured for this worker's role.
    // For now, let's assume a findByRole method or similar exists on IAgentRepository.
    // If an Agent entity is directly tied to a role, or if the worker is configured with a specific AgentId for its role.

    // const agentResult = await this.agentRepository.findByRole(job.targetAgentRole()); // Ideal
    // Or, if WorkerService is configured with a specific Agent instance or AgentId for its role upon start:
    // For this iteration, let's assume we need to fetch the Agent based on the role.
    // This implies IAgentRepository needs a method like findFirstByRole or findDedicatedForRole.
    // Let's use a placeholder findById for now, assuming the role maps to a known agent ID or a default.
    // This part will need refinement based on actual IAgentRepository capabilities.
    // For now, we'll simulate fetching an agent. This logic is highly dependent on how Agents are mapped to roles.

    // Placeholder: Fetching agent logic - to be refined based on IAgentRepository
    // This is a simplified approach. A real system might have a more robust way to map roles to agents.
    // For now, we assume there's an agent whose ID matches the role's value for simplicity of this step.
    // This is a known simplification and will be addressed if IAgentRepository lacks findByRole.
    const agentIdForRole = job.targetAgentRole().value; // This is a string, AgentIdVO needs to be created
    const agentIdVO = AgentIdVO.create(agentIdForRole); // Assuming AgentIdVO can be created from string

    if(agentIdVO.isErr()) {
        this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - Invalid Agent ID derived from role for job ${job.id.value}. Error: ${agentIdVO.error.message}`);
        // Mark job as failed? Or handle differently? For now, log and return.
        // This indicates a setup/configuration issue.
        return;
    }

    const agentResult = await this.agentRepository.findById(agentIdVO.value);


    if (agentResult.isErr()) {
        this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - error fetching agent for job ${job.id.value}:`, agentResult.error);
        // Potentially mark job as failed if agent retrieval is an unrecoverable issue for this job.
        // For now, just log and return.
        return;
    }

    const agent = agentResult.value;
    if (!agent) {
      this.logger.warn(`WorkerService (role: ${this.targetAgentRole.value}) - no agent found for role associated with job ${job.id.value}. Marking job as failed.`);
      job.status = JobStatusVO.failed(); // Assuming direct status update, though Job entity methods are preferred
      job.updateLastFailureSummary(`Agent not found for role: ${job.targetAgentRole().value}`);
      try {
        await this.jobRepository.save(job);
      } catch(e) { this.logger.error(`Failed to save job ${job.id.value} after agent not found.`, e); }
      return;
    }

    this.logger.info(`WorkerService (role: ${this.targetAgentRole.value}) - retrieved agent ${agent.id.value} for job ${job.id.value}. Proceeding to execution.`);

    try {
      const executionResult = await this.agentExecutor.executeJob(job, agent);
      job.setExecutionResult(executionResult.unwrapOr({ // unwrapOr to handle potential error from executeJob itself, though plan assumes it returns AgentExecutorResult
            status: 'FAILURE_INTERNAL',
            message: 'AgentExecutor failed to return a standard result.',
            jobId: job.id.value,
      }));

      if (executionResult.isOk()) {
        const agentResult = executionResult.value;
        this.logger.info(`WorkerService (role: ${this.targetAgentRole.value}) - Job ${job.id.value} executed by agent. Result status: ${agentResult.status}`);

        if (agentResult.status === 'SUCCESS') {
          job.setStatus(JobStatusVO.completed());
          // job.setResult(agentResult.output);
        } else { // Handle FAILURE_LLM, FAILURE_TOOL, FAILURE_MAX_ITERATIONS, FAILURE_INTERNAL
          this.handleJobExecutionFailure(job, agentResult.message); // Pass agentResult message for summary
        }
      } else {
        // Error from executeJob call itself
        const errorMessage = `AgentExecutor critical failure: ${executionResult.error.message}`;
        this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - AgentExecutor.executeJob failed for job ${job.id.value}:`, executionResult.error);
        this.handleJobExecutionFailure(job, errorMessage);
      }
    } catch (execError) {
      const errorMessage = `Unhandled exception during execution: ${(execError instanceof Error) ? execError.message : String(execError)}`;
      this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - Unhandled exception during agentExecutor.executeJob for job ${job.id.value}:`, execError);
      this.handleJobExecutionFailure(job, errorMessage);
      // Ensure executionResult is set even for unhandled exceptions before finalizeExecution
      job.setExecutionResult({
            status: 'FAILURE_INTERNAL',
            message: `Unhandled exception: ${(execError instanceof Error) ? execError.message : String(execError)}`,
            jobId: job.id.value,
      });
    }

    // Save the job with its final status and execution result
    try {
      const saveResult = await this.jobRepository.save(job);
      if (saveResult.isErr()) {
        this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - Failed to save final state for job ${job.id.value}:`, saveResult.error);
      } else {
        this.logger.info(`WorkerService (role: ${this.targetAgentRole.value}) - Job ${job.id.value} final state (status: ${job.status().value()}) saved.`);
      }
    } catch (saveError) {
        this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - Exception during final save of job ${job.id.value}:`, saveError);
    }
  }

  private handleJobExecutionFailure(job: Job, failureSummary: string): void {
    const retryPolicy = job.retryPolicy(); // Assume Job entity has this method returning RetryPolicyVO
    const currentAttempts = job.attempts().value(); // Assume Job entity has this method returning AttemptCountVO

    if (retryPolicy.shouldRetry(currentAttempts)) {
      const newAttempts = job.incrementAttempts(); // Assume this increments and returns new AttemptCountVO
      const delayMs = retryPolicy.calculateBackoffMs(newAttempts.value());
      const nextExecutionTime = new Date(Date.now() + delayMs);

      job.setExecuteAfter(nextExecutionTime); // Assume Job entity has this method
      job.setStatus(JobStatusVO.delayed()); // Assumes JobStatusVO.delayed() exists
      job.updateLastFailureSummary(`Job failed: ${failureSummary}. Retrying (#${newAttempts.value()}) at ${nextExecutionTime.toISOString()}.`);

      this.logger.warn(
        `WorkerService (role: ${this.targetAgentRole?.value}) - Job ${job.id.value} failed. Scheduling retry ${newAttempts.value()}/${retryPolicy.maxAttempts()}. Next attempt at: ${nextExecutionTime.toISOString()}`,
        { jobId: job.id.value, failureSummary }
      );
    } else {
      job.setStatus(JobStatusVO.failed());
      job.updateLastFailureSummary(`Job failed permanently: ${failureSummary}. Max retries (${retryPolicy.maxAttempts()}) reached or no retry policy.`);
      this.logger.error(
        `WorkerService (role: ${this.targetAgentRole?.value}) - Job ${job.id.value} failed permanently. Summary: ${failureSummary}`,
        { jobId: job.id.value }
      );
    }
  }
}
