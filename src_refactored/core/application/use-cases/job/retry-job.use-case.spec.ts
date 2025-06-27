// src_refactored/core/application/use-cases/job/retry-job.use-case.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// import { ZodError } from 'zod'; // Not used directly in this spec

import { DomainError, NotFoundError } from '@/domain/common/errors';
import { IJobQueue } from '@/core/ports/adapters/job-queue.interface';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { AttemptCountVO } from '@/domain/job/value-objects/attempt-count.vo';
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';
import { JobNameVO } from '@/domain/job/value-objects/job-name.vo';
import { RetryPolicyVO, BackoffTypeEnum } from '@/domain/job/value-objects/retry-policy.vo';
import { JobStatusVO, JobStatusEnum } from '@/domain/job/value-objects/job-status.vo';
// import { JobTimestampVO } from '@/domain/job/value-objects/job-timestamp.vo'; // Not used

import { ok, error } from '@/shared/result';

import { RetryJobUseCaseInput } from './retry-job.schema';
import { RetryJobUseCase } from './retry-job.use-case';

const mockJobRepository: IJobRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), findPendingJobsWithNoDependencies: vi.fn(), findActiveJobsByWorker: vi.fn(), findJobsByStatus: vi.fn(), findStaleActiveJobs: vi.fn(),
};
const mockJobQueue: IJobQueue = {
  add: vi.fn(), getNext: vi.fn(), complete: vi.fn(), fail: vi.fn(), delay: vi.fn(), getJobById: vi.fn(),
};

describe('RetryJobUseCase', () => {
  let useCase: RetryJobUseCase;
  const testJobIdVo = JobIdVO.generate(); // Use JobIdVO
  let jobToRetry: Job<unknown, unknown>; // Specify Job generic types

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    useCase = new RetryJobUseCase(mockJobRepository, mockJobQueue);

    const retryPolicy = RetryPolicyVO.create({ // Use RetryPolicyVO
      maxAttempts: AttemptCountVO.create(3).unwrap(), // Use AttemptCountVO
      initialDelayMs: 1000,
      backoffType: BackoffTypeEnum.FIXED, // Use BackoffTypeEnum
    }).unwrap();
    jobToRetry = Job.create({
      id: testJobIdVo,
      name: JobNameVO.create('Retryable Job').unwrap(), // Use JobNameVO
      payload: {},
      retryPolicy,
    }).unwrap();
    jobToRetry.moveToActive();
    jobToRetry.moveToFailed('First failure');

    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as void));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully retry a FAILED job that can be retried (moves to DELAYED)', async () => {
    vi.setSystemTime(new Date(2024, 0, 1, 12, 0, 0));
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));

    const input: RetryJobUseCaseInput = { jobId: testJobIdVo.value };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(true);
      expect(result.value.jobId).toBe(testJobIdVo.value);
      expect(result.value.newStatus).toBe(JobStatusEnum.DELAYED); // Use JobStatusEnum
      expect(new Date(result.value.executeAfter!)).toEqual(new Date(Date.now() + 1000));
    }
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.status().is(JobStatusEnum.DELAYED)).toBe(true); // Use JobStatusEnum
    expect(savedJob.attempts().value).toBe(1); // Job entity handles attempt increment
    expect(mockJobQueue.add).toHaveBeenCalledWith(savedJob);
  });

  it('should retry a FAILED job and move to PENDING if delay is 0', async () => {
    const noDelayRetryPolicy = RetryPolicyVO.create({ // Use RetryPolicyVO
      maxAttempts: AttemptCountVO.create(3).unwrap(), // Use AttemptCountVO
      initialDelayMs: 0,
      backoffType: BackoffTypeEnum.FIXED, // Use BackoffTypeEnum
    }).unwrap();
    jobToRetry = Job.create({
      id: testJobIdVo,
      name: JobNameVO.create('No Delay Retry Job').unwrap(), // Use JobNameVO
      payload: {},
      retryPolicy: noDelayRetryPolicy,
    }).unwrap();
    jobToRetry.moveToActive(); jobToRetry.moveToFailed('Failure');
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));

    const input: RetryJobUseCaseInput = { jobId: testJobIdVo.value };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(true);
      expect(result.value.newStatus).toBe(JobStatusEnum.PENDING); // Use JobStatusEnum
      expect(result.value.executeAfter).toBeNull();
    }
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.status().is(JobStatusEnum.PENDING)).toBe(true); // Use JobStatusEnum
  });

  it('should return success:false if job is not in FAILED or ACTIVE state', async () => {
    jobToRetry.moveToPending();
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));
    const input: RetryJobUseCaseInput = { jobId: testJobIdVo.value };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(false);
      expect(result.value.newStatus).toBe(JobStatusEnum.PENDING); // Use JobStatusEnum
      expect(result.value.message).toContain('not in a FAILED or ACTIVE state');
    }
    expect(mockJobRepository.save).not.toHaveBeenCalled();
  });

  it('should return success:false if job has reached max attempts', async () => {
    const jobMaxedRetries = Job.create({
      id: testJobIdVo,
      name: JobNameVO.create('Maxed Retries Job').unwrap(), // Use JobNameVO
      payload: {},
      retryPolicy: RetryPolicyVO.create({ // Use RetryPolicyVO
        maxAttempts: AttemptCountVO.create(1).unwrap(), // Use AttemptCountVO
        initialDelayMs: 0,
        backoffType: BackoffTypeEnum.FIXED, // Use BackoffTypeEnum
      }).unwrap(),
    }).unwrap();
    jobMaxedRetries.moveToActive();
    jobMaxedRetries.moveToFailed('Failure 1');
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobMaxedRetries));

    const input: RetryJobUseCaseInput = { jobId: testJobIdVo.value };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(false);
      expect(result.value.newStatus).toBe(JobStatusEnum.FAILED); // Use JobStatusEnum
      expect(result.value.message).toContain('maximum retry attempts');
    }
  });

  it('should return NotFoundError if job to retry is not found', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(null));
    const input: RetryJobUseCaseInput = { jobId: testJobIdVo.value };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it('should return DomainError if repository save fails', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));
    (mockJobRepository.save as vi.Mock).mockResolvedValue(error(new DomainError('DB save error') as Error)); // Cast
    const input: RetryJobUseCaseInput = { jobId: testJobIdVo.value };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value.message).toContain('Failed to save job state for retry');
  });

  it('should return DomainError if jobQueue.add fails', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(error(new DomainError('Queue add error') as Error)); // Cast
    const input: RetryJobUseCaseInput = { jobId: testJobIdVo.value };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value.message).toContain('Failed to re-enqueue job');
  });
});
