// src_refactored/core/application/services/worker.service.spec.ts
import { vi, describe, it, expect, beforeEach, afterEach, Mocked } from 'vitest';
import { mock, DeepMockProxy } from 'vitest-mock-extended';
import { WorkerService } from './worker.service';
import { IJobRepository } from '../../../domain/job/ports/i-job.repository';
import { IAgentRepository } from '../../../domain/agent/ports/i-agent-repository.interface';
import { IAgentExecutor } from '../ports/services/i-agent-executor.interface';
import { ILogger } from '../../../common/services/i-logger.service';
import { TargetAgentRoleVO } from '../../../domain/job/value-objects/target-agent-role.vo';
import { Job } from '../../../domain/job/entities/job.entity';
import { Agent } from '../../../domain/agent/entities/agent.entity';
import { JobStatusVO } from '../../../domain/job/value-objects/job-status.vo';
import { AgentExecutorResult } from '../../../domain/job/job-processing.types';
import { ok, error } from '@/refactored/shared/result';
import { JobName } from '../../../domain/job/value-objects/job-name.vo';
import { AgentIdVO } from '../../../domain/agent/value-objects/agent-id.vo';
import { RetryPolicyVO } from '../../../domain/job/value-objects/retry-policy.vo';
import { AttemptCountVO } from '../../../domain/job/value-objects/attempt-count.vo';

describe('WorkerService', () => {
  let workerService: WorkerService;
  let mockJobRepository: DeepMockProxy<IJobRepository>;
  let mockAgentRepository: DeepMockProxy<IAgentRepository>;
  let mockAgentExecutor: DeepMockProxy<IAgentExecutor>;
  let mockLogger: DeepMockProxy<ILogger>;

  let sampleJob: DeepMockProxy<Job>;
  let sampleAgent: DeepMockProxy<Agent>;
  let sampleRole: TargetAgentRoleVO;

  beforeEach(() => {
    vi.useFakeTimers();
    mockJobRepository = mock<IJobRepository>();
    mockAgentRepository = mock<IAgentRepository>();
    mockAgentExecutor = mock<IAgentExecutor>();
    mockLogger = mock<ILogger>();

    // Mock logger methods to prevent actual console output during tests
    mockLogger.info.mockReturnValue();
    mockLogger.warn.mockReturnValue();
    mockLogger.error.mockReturnValue();
    mockLogger.debug.mockReturnValue();

    workerService = new WorkerService(
      mockJobRepository,
      mockAgentRepository,
      mockAgentExecutor,
      mockLogger,
    );

    sampleRole = TargetAgentRoleVO.create('test-role').unwrap();

    // Create mock Job and Agent with spies/mocks for their methods
    sampleJob = mock<Job>();
    sampleJob.id = JobName.create('test-job-id').unwrap() as any; // Simplified ID for mocking
    sampleJob.name = JobName.create('Test Job').unwrap();
    sampleJob.targetAgentRole.mockReturnValue(sampleRole);
    sampleJob.status.mockReturnValue(JobStatusVO.pending());
    sampleJob.attempts.mockReturnValue(AttemptCountVO.create(0).unwrap());
    sampleJob.retryPolicy.mockReturnValue(RetryPolicyVO.default()); // Non-retryable by default for simple failure test
    sampleJob.setExecutionResult.mockReturnThis();
    sampleJob.setStatus.mockReturnThis();
    sampleJob.updateLastFailureSummary.mockReturnThis();


    sampleAgent = mock<Agent>();
    sampleAgent.id = AgentIdVO.create('test-agent-id').unwrap();


    mockJobRepository.findNextProcessableByRole.mockResolvedValue(ok(null)); // Default: no job
    mockJobRepository.save.mockResolvedValue(ok(sampleJob as Job));
    mockAgentRepository.findById.mockResolvedValue(ok(sampleAgent as Agent));
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    workerService.stop(); // Ensure worker stops after each test
  });

  it('should initialize correctly', () => {
    expect(workerService).toBeInstanceOf(WorkerService);
    expect(workerService.isRunning()).toBe(false);
  });

  it('start() should set role, mark as running, and start processing loop', async () => {
    const role = TargetAgentRoleVO.create('test-role').unwrap();
    await workerService.start(role);
    expect(workerService.isRunning()).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`WorkerService starting for role: ${role.value}`));
    // Further loop testing will be indirect via _processNextJobCycle tests
  });

  it('stop() should mark as not running and log stop', async () => {
    const role = TargetAgentRoleVO.create('test-role').unwrap();
    await workerService.start(role);
    await workerService.stop();
    expect(workerService.isRunning()).toBe(false);
    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`WorkerService for role ${role.value} stopped.`));
  });

  it('isRunning() should reflect the current running state', async () => {
    expect(workerService.isRunning()).toBe(false);
    const role = TargetAgentRoleVO.create('test-role').unwrap();
    await workerService.start(role);
    expect(workerService.isRunning()).toBe(true);
    await workerService.stop();
    expect(workerService.isRunning()).toBe(false);
  });

  describe('_processNextJobCycle (via start)', () => {
    it('should do nothing if no job is found', async () => {
      mockJobRepository.findNextProcessableByRole.mockResolvedValue(ok(null));
      await workerService.start(sampleRole);
      await vi.advanceTimersByTimeAsync(10000); // Advance past one loop interval

      expect(mockJobRepository.findNextProcessableByRole).toHaveBeenCalledWith(sampleRole);
      expect(mockAgentRepository.findById).not.toHaveBeenCalled();
      expect(mockAgentExecutor.executeJob).not.toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('no pending jobs found'));
    });

    it('should mark job as FAILED if agent is not found', async () => {
      mockJobRepository.findNextProcessableByRole.mockResolvedValue(ok(sampleJob as Job));
      mockAgentRepository.findById.mockResolvedValue(ok(null)); // Agent not found

      await workerService.start(sampleRole);
      await vi.advanceTimersByTimeAsync(10000);

      expect(mockAgentRepository.findById).toHaveBeenCalled();
      expect(sampleJob.setStatus).toHaveBeenCalledWith(JobStatusVO.failed());
      expect(sampleJob.updateLastFailureSummary).toHaveBeenCalledWith(expect.stringContaining('Agent not found'));
      expect(mockJobRepository.save).toHaveBeenCalledWith(sampleJob);
      expect(mockAgentExecutor.executeJob).not.toHaveBeenCalled();
    });

    it('should process job successfully if agent and job found and executor succeeds', async () => {
      mockJobRepository.findNextProcessableByRole.mockResolvedValue(ok(sampleJob as Job));
      mockAgentRepository.findById.mockResolvedValue(ok(sampleAgent as Agent));
      const successResult: AgentExecutorResult = { jobId: sampleJob.id.value, status: 'SUCCESS', message: 'Job done', output: { detail: 'details' }};
      mockAgentExecutor.executeJob.mockResolvedValue(ok(successResult));

      await workerService.start(sampleRole);
      await vi.advanceTimersByTimeAsync(10000);

      expect(mockAgentExecutor.executeJob).toHaveBeenCalledWith(sampleJob, sampleAgent);
      expect(sampleJob.setExecutionResult).toHaveBeenCalledWith(successResult);
      expect(sampleJob.setStatus).toHaveBeenCalledWith(JobStatusVO.completed());
      expect(mockJobRepository.save).toHaveBeenCalledWith(sampleJob);
      expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining(`Job ${sampleJob.id.value} final state (status: COMPLETED) saved.`));
    });

    it('should mark job as FAILED if executor returns failure (non-retryable)', async () => {
      // Ensure retry policy for this test case is non-retryable
      const nonRetryablePolicy = mock<RetryPolicyVO>();
      nonRetryablePolicy.shouldRetry.mockReturnValue(false);
      nonRetryablePolicy.maxAttempts.mockReturnValue(0); // For logging consistency
      sampleJob.retryPolicy.mockReturnValue(nonRetryablePolicy);

      mockJobRepository.findNextProcessableByRole.mockResolvedValue(ok(sampleJob as Job));
      mockAgentRepository.findById.mockResolvedValue(ok(sampleAgent as Agent));
      const failureResult: AgentExecutorResult = { jobId: sampleJob.id.value, status: 'FAILURE_LLM', message: 'LLM error', errors: [{type: 'llm_error', message: 'LLM error'}]};
      mockAgentExecutor.executeJob.mockResolvedValue(ok(failureResult));

      await workerService.start(sampleRole);
      await vi.advanceTimersByTimeAsync(10000);

      expect(mockAgentExecutor.executeJob).toHaveBeenCalledWith(sampleJob, sampleAgent);
      expect(sampleJob.setExecutionResult).toHaveBeenCalledWith(failureResult);
      expect(sampleJob.setStatus).toHaveBeenCalledWith(JobStatusVO.failed());
      expect(sampleJob.updateLastFailureSummary).toHaveBeenCalledWith(expect.stringContaining(`Job failed permanently: ${failureResult.message}`));
      expect(mockJobRepository.save).toHaveBeenCalledWith(sampleJob);
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(`Job ${sampleJob.id.value} failed permanently. Summary: ${failureResult.message}`));
    });

    it('should schedule a retry if executor fails and retry policy allows', async () => {
      const retryablePolicy = mock<RetryPolicyVO>();
      retryablePolicy.shouldRetry.mockReturnValue(true);
      retryablePolicy.calculateBackoffMs.mockReturnValue(5000); // 5s backoff
      retryablePolicy.maxAttempts.mockReturnValue(3);

      sampleJob.retryPolicy.mockReturnValue(retryablePolicy);
      sampleJob.attempts.mockReturnValue(AttemptCountVO.create(0).unwrap()); // First attempt
      // Mock incrementAttempts to return the next attempt count
      const nextAttemptCount = AttemptCountVO.create(1).unwrap();
      sampleJob.incrementAttempts.mockReturnValue(nextAttemptCount);


      mockJobRepository.findNextProcessableByRole.mockResolvedValue(ok(sampleJob as Job));
      mockAgentRepository.findById.mockResolvedValue(ok(sampleAgent as Agent));
      const failureResult: AgentExecutorResult = { jobId: sampleJob.id.value, status: 'FAILURE_LLM', message: 'LLM error for retry test'};
      mockAgentExecutor.executeJob.mockResolvedValue(ok(failureResult));

      await workerService.start(sampleRole);
      await vi.advanceTimersByTimeAsync(10000);

      expect(mockAgentExecutor.executeJob).toHaveBeenCalledWith(sampleJob, sampleAgent);
      expect(sampleJob.incrementAttempts).toHaveBeenCalled();
      expect(sampleJob.setExecuteAfter).toHaveBeenCalledWith(expect.any(Date)); // Check if date is roughly now + 5s
      expect(sampleJob.setStatus).toHaveBeenCalledWith(JobStatusVO.delayed());
      expect(sampleJob.updateLastFailureSummary).toHaveBeenCalledWith(expect.stringContaining(`Job failed: ${failureResult.message}. Retrying (#1) at`));
      expect(mockJobRepository.save).toHaveBeenCalledWith(sampleJob);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining(`Job ${sampleJob.id.value} failed. Scheduling retry 1/3. Next attempt at:`),
        expect.anything()
      );
    });

    it('should mark job as FAILED if executor fails and max retries are reached', async () => {
      const retryablePolicy = mock<RetryPolicyVO>();
      retryablePolicy.shouldRetry.mockReturnValue(false); // Simulate that max attempts reached
      retryablePolicy.maxAttempts.mockReturnValue(1); // Total 1 attempt allowed

      sampleJob.retryPolicy.mockReturnValue(retryablePolicy);
      sampleJob.attempts.mockReturnValue(AttemptCountVO.create(1).unwrap()); // Already attempted once

      mockJobRepository.findNextProcessableByRole.mockResolvedValue(ok(sampleJob as Job));
      mockAgentRepository.findById.mockResolvedValue(ok(sampleAgent as Agent));
      const failureResult: AgentExecutorResult = { jobId: sampleJob.id.value, status: 'FAILURE_LLM', message: 'LLM error, max retries'};
      mockAgentExecutor.executeJob.mockResolvedValue(ok(failureResult));

      await workerService.start(sampleRole);
      await vi.advanceTimersByTimeAsync(10000);

      expect(mockAgentExecutor.executeJob).toHaveBeenCalledWith(sampleJob, sampleAgent);
      expect(sampleJob.incrementAttempts).not.toHaveBeenCalled(); // Should not increment if shouldRetry is false
      expect(sampleJob.setStatus).toHaveBeenCalledWith(JobStatusVO.failed());
      expect(sampleJob.updateLastFailureSummary).toHaveBeenCalledWith(expect.stringContaining(`Job failed permanently: ${failureResult.message}. Max retries (1) reached or no retry policy.`));
      expect(mockJobRepository.save).toHaveBeenCalledWith(sampleJob);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining(`Job ${sampleJob.id.value} failed permanently. Summary: ${failureResult.message}`),
        expect.anything()
      );
    });
  });
});
