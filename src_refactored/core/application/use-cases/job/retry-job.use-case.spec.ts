// src_refactored/core/application/use-cases/job/retry-job.use-case.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZodError } from 'zod';

import { RetryJobUseCase } from './retry-job.use-case';
import { RetryJobUseCaseInput } from './retry-job.schema';

import { DomainError, NotFoundError } from '@/application/common/errors'; // Or @/domain/common/errors
import { IJobQueue } from '@/core/ports/adapters/job-queue.interface';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { MaxAttempts, AttemptCount } from '@/domain/job/value-objects/attempt-count.vo';
import { JobId } from '@/domain/job/value-objects/job-id.vo';
import { JobName } from '@/domain/job/value-objects/job-name.vo';
import { RetryPolicy, BackoffType } from '@/domain/job/value-objects/retry-policy.vo';
import { JobStatus, JobStatusType } from '@/domain/job/value-objects/job-status.vo';
import { JobTimestamp } from '@/domain/job/value-objects/job-timestamp.vo';
import { ok, error } from '@/shared/result';

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
  const testJobId = JobId.generate();
  let jobToRetry: Job;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers(); // Control time for executeAfter calculations
    useCase = new RetryJobUseCase(mockJobRepository, mockJobQueue);

    // Default job setup: FAILED and can be retried
    const retryPolicy = RetryPolicy.create({
      maxAttempts: MaxAttempts.create(3),
      initialDelayMs: 1000, // 1s
      backoffType: BackoffType.FIXED,
    });
    jobToRetry = Job.create({
      id: testJobId,
      name: JobName.create('Retryable Job'),
      payload: {},
      retryPolicy: retryPolicy,
    });
    // Simulate it having failed once
    jobToRetry.moveToActive(); // Increments attempts to 1
    jobToRetry.moveToFailed('First failure'); // Status FAILED, attempts 1

    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(ok(undefined as any)); // Assuming Job or void
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully retry a FAILED job that can be retried (moves to DELAYED)', async () => {
    vi.setSystemTime(new Date(2024, 0, 1, 12, 0, 0)); // Fix current time
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));

    const input: RetryJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(true);
      expect(result.value.jobId).toBe(testJobId.value());
      expect(result.value.newStatus).toBe(JobStatusType.DELAYED); // Due to fixed 1s delay
      expect(new Date(result.value.executeAfter!)).toEqual(new Date(Date.now() + 1000));
    }
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job;
    expect(savedJob.status().is(JobStatusType.DELAYED)).toBe(true);
    expect(savedJob.attempts().value()).toBe(1); // Attempts not incremented by retry use case itself
    expect(mockJobQueue.add).toHaveBeenCalledWith(savedJob);
  });

  it('should retry a FAILED job and move to PENDING if delay is 0', async () => {
    const noDelayRetryPolicy = RetryPolicy.create({
      maxAttempts: MaxAttempts.create(3),
      initialDelayMs: 0,
      backoffType: BackoffType.FIXED,
    });
    jobToRetry = Job.create({ id: testJobId, name: JobName.create('No Delay Retry Job'), payload: {}, retryPolicy: noDelayRetryPolicy });
    jobToRetry.moveToActive(); jobToRetry.moveToFailed('Failure');
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));

    const input: RetryJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(true);
      expect(result.value.newStatus).toBe(JobStatusType.PENDING);
      expect(result.value.executeAfter).toBeNull(); // or a date very close to now if entity sets it
    }
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job;
    expect(savedJob.status().is(JobStatusType.PENDING)).toBe(true);
  });

  it('should return success:false if job is not in FAILED or ACTIVE state', async () => {
    jobToRetry.moveToPending(); // Change to a non-retryable state for this test
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));
    const input: RetryJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(false);
      expect(result.value.newStatus).toBe(JobStatusType.PENDING);
      expect(result.value.message).toContain('not in a FAILED or ACTIVE state');
    }
    expect(mockJobRepository.save).not.toHaveBeenCalled();
  });

  it('should return success:false if job has reached max attempts', async () => {
    const jobMaxedRetries = Job.create({
      id: testJobId, name: JobName.create('Maxed Retries Job'), payload: {},
      retryPolicy: RetryPolicy.create({ maxAttempts: MaxAttempts.create(1), initialDelayMs: 0, backoffType: BackoffType.FIXED })
    });
    jobMaxedRetries.moveToActive(); // Attempt 1
    jobMaxedRetries.moveToFailed('Failure 1'); // Status FAILED, attempts 1, maxAttempts 1
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobMaxedRetries));

    const input: RetryJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(false);
      expect(result.value.newStatus).toBe(JobStatusType.FAILED);
      expect(result.value.message).toContain('maximum retry attempts');
    }
  });

  it('should return NotFoundError if job to retry is not found', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(null));
    const input: RetryJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it('should return DomainError if repository save fails', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));
    (mockJobRepository.save as vi.Mock).mockResolvedValue(error(new DomainError('DB save error')));
    const input: RetryJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value.message).toContain('Failed to save job state for retry');
  });

  it('should return DomainError if jobQueue.add fails', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToRetry));
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined));
    (mockJobQueue.add as vi.Mock).mockResolvedValue(error(new DomainError('Queue add error')));
    const input: RetryJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value.message).toContain('Failed to re-enqueue job');
  });
});
