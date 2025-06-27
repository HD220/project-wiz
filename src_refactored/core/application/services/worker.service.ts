// src_refactored/core/application/services/worker.service.ts
import { ILogger } from '@/core/common/services/i-logger.service';
import { IAgentRepository } from '@/domain/agent/ports/agent-repository.interface';
import { AgentIdVO } from '@/domain/agent/value-objects/agent-id.vo';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobStatusVO } from '@/domain/job/value-objects/job-status.vo';
import { TargetAgentRoleVO } from '@/domain/job/value-objects/target-agent-role.vo';

import { IAgentExecutor } from '../ports/services/i-agent-executor.interface';
import { IWorkerService } from '../ports/services/i-worker.service';

export class WorkerService implements IWorkerService {
  private targetAgentRole?: TargetAgentRoleVO;
  private isCurrentlyRunning: boolean = false;
  private readonly loopIntervalMs: number = 10000;
  private continueProcessing: boolean = false;

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
      return;
    }
    this.targetAgentRole = role;
    this.isCurrentlyRunning = true;
    this.logger.info(`WorkerService starting for role: ${this.targetAgentRole.value}`);
    this.continueProcessing = true;
    this._runProcessingLoop(); // Fire-and-forget
    this.logger.info(`WorkerService for role ${this.targetAgentRole.value} started. Polling interval: ${this.loopIntervalMs}ms.`);
  }

  private async _runProcessingLoop(): Promise<void> {
    this.logger.info(`WorkerService (role: ${this.targetAgentRole?.value}) processing loop initiated.`);
    while (this.continueProcessing) {
      try {
        await this._processNextJobCycle();
      } catch (loopError) {
        this.logger.error(`WorkerService (role: ${this.targetAgentRole?.value}) - Unhandled error in processing loop:`, loopError);
      }
      if (this.continueProcessing) {
        await new Promise(resolve => setTimeout(resolve, this.loopIntervalMs));
      }
    }
    this.logger.info(`WorkerService (role: ${this.targetAgentRole?.value}) processing loop terminated.`);
  }

  public async stop(): Promise<void> {
    if (!this.isCurrentlyRunning) {
      this.logger.warn(`WorkerService (role: ${this.targetAgentRole?.value || 'unassigned'}) is not running or already stopping.`);
      return;
    }
    this.logger.info(`WorkerService for role ${this.targetAgentRole?.value || 'unassigned'} stopping...`);
    this.continueProcessing = false;
    this.isCurrentlyRunning = false;
  }

  public isRunning(): boolean {
    return this.isCurrentlyRunning;
  }

  private async _processNextJobCycle(): Promise<void> {
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

    const agentIdForRole = job.targetAgentRole().value;
    const agentIdVO = AgentIdVO.create(agentIdForRole);

    if (agentIdVO.isErr()) {
      this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - Invalid Agent ID derived from role for job ${job.id.value}. Error: ${agentIdVO.error.message}`);
      return;
    }
    const agentResult = await this.agentRepository.findById(agentIdVO.value);

    if (agentResult.isErr()) {
      this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - error fetching agent for job ${job.id.value}:`, agentResult.error);
      return;
    }
    const agent = agentResult.value;
    if (!agent) {
      this.logger.warn(`WorkerService (role: ${this.targetAgentRole.value}) - no agent found for role associated with job ${job.id.value}. Marking job as failed.`);
      job.setStatus(JobStatusVO.failed()); // Direct update for simplicity in this flow
      job.updateLastFailureSummary(`Agent not found for role: ${job.targetAgentRole().value}`);
      try {
        await this.jobRepository.save(job);
      } catch (e) { this.logger.error(`Failed to save job ${job.id.value} after agent not found.`, e); }
      return;
    }
    this.logger.info(`WorkerService (role: ${this.targetAgentRole.value}) - retrieved agent ${agent.id.value} for job ${job.id.value}. Proceeding to execution.`);

    try {
      const executionResult = await this.agentExecutor.executeJob(job, agent);
      job.setExecutionResult(executionResult.unwrapOr({
        status: 'FAILURE_INTERNAL', message: 'AgentExecutor failed to return a standard result.', jobId: job.id.value,
      }));

      if (executionResult.isOk()) {
        const agentResult = executionResult.value;
        this.logger.info(`WorkerService (role: ${this.targetAgentRole.value}) - Job ${job.id.value} executed by agent. Result status: ${agentResult.status}`);
        if (agentResult.status === 'SUCCESS') {
          job.setStatus(JobStatusVO.completed());
        } else {
          this._handleJobExecutionFailure(job, agentResultData.message);
        }
      } else {
        const errorMessage = `AgentExecutor critical failure: ${executionResult.error.message}`;
        this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - AgentExecutor.executeJob failed for job ${job.id.value}:`, executionResult.error);
        this._handleJobExecutionFailure(job, errorMessage);
      }
    } catch (e: unknown) {
      const execError = e instanceof Error ? e : new Error(String(e));
      const errorMessage = `Unhandled exception during execution: ${execError.message}`;
      this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - Unhandled exception during agentExecutor.executeJob for job ${job.id.value}:`, execError);
      this._handleJobExecutionFailure(job, errorMessage);
      job.setExecutionResult({
        status: 'FAILURE_INTERNAL', message: `Unhandled exception: ${execError.message}`, jobId: job.id.value,
      });
    }

    try {
      const saveResult = await this.jobRepository.save(job);
      if (saveResult.isErr()) {
        this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - Failed to save final state for job ${job.id.value}:`, saveResult.error);
      } else {
        this.logger.info(`WorkerService (role: ${this.targetAgentRole.value}) - Job ${job.id.value} final state (status: ${job.status().value}) saved.`);
      }
    } catch (saveError) {
      this.logger.error(`WorkerService (role: ${this.targetAgentRole.value}) - Exception during final save of job ${job.id.value}:`, saveError);
    }
  }

  private _handleJobExecutionFailure(job: Job<unknown, unknown>, failureSummary: string): void {
    const retryPolicy = job.retryPolicy();
    const currentAttempts = job.attempts().value();

    if (retryPolicy.shouldRetry(currentAttempts)) {
      const newAttempts = job.incrementAttempts();
      const delayMs = retryPolicy.calculateBackoffMs(newAttempts.value());
      const nextExecutionTime = new Date(Date.now() + delayMs);
      job.setExecuteAfter(nextExecutionTime);
      job.setStatus(JobStatusVO.delayed());
      job.updateLastFailureSummary(`Job failed: ${failureSummary}. Retrying (#${newAttempts.value()}) at ${nextExecutionTime.toISOString()}.`);
      this.logger.warn(`WorkerService (role: ${this.targetAgentRole?.value}) - Job ${job.id.value} failed. Scheduling retry ${newAttempts.value()}/${retryPolicy.maxAttempts()}. Next attempt at: ${nextExecutionTime.toISOString()}`, { jobId: job.id.value, failureSummary });
    } else {
      job.setStatus(JobStatusVO.failed());
      job.updateLastFailureSummary(`Job failed permanently: ${failureSummary}. Max retries (${retryPolicy.maxAttempts()}) reached or no retry policy.`);
      this.logger.error(`WorkerService (role: ${this.targetAgentRole?.value}) - Job ${job.id.value} failed permanently. Summary: ${failureSummary}`, { jobId: job.id.value });
    }
  }
}
