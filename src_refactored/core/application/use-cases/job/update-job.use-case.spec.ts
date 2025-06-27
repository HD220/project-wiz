// src_refactored/core/application/use-cases/job/update-job.use-case.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZodError } from 'zod';

import { DomainError, NotFoundError, ValueError } from '@/application/common/errors'; // Or @/domain/common/errors

import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { MaxAttempts } from '@/domain/job/value-objects/attempt-count.vo'; // Unresolved
import { JobId } from '@/domain/job/value-objects/job-id.vo';
import { JobName } from '@/domain/job/value-objects/job-name.vo'; // Unresolved
import { JobPriority } from '@/domain/job/value-objects/job-priority.vo';
import { RetryPolicy, NoRetryPolicy, BackoffType } from '@/domain/job/value-objects/retry-policy.vo'; // Unresolved
import { TargetAgentRole } from '@/domain/job/value-objects/target-agent-role.vo';

import { ok, error } from '@/shared/result';

import { UpdateJobUseCaseInput } from './update-job.schema';
import { UpdateJobUseCase } from './update-job.use-case';

const mockJobRepository: IJobRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findPendingJobsWithNoDependencies: vi.fn(),
  findActiveJobsByWorker: vi.fn(),
  findJobsByStatus: vi.fn(),
  findStaleActiveJobs: vi.fn(),
};

describe('UpdateJobUseCase', () => {
  let useCase: UpdateJobUseCase;
  const testJobId = JobId.generate();
  let existingJob: Job;

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new UpdateJobUseCase(mockJobRepository);

    // Create a base job entity for tests
    existingJob = Job.create({
      id: testJobId,
      name: JobName.create('Original Job Name'),
      payload: { originalData: 'value' },
      priority: JobPriority.create(JobPriority.NORMAL),
      targetAgentRole: TargetAgentRole.create('general_worker'),
      retryPolicy: NoRetryPolicy.create(),
    });
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(existingJob));
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined)); // Assume save is void or returns the entity
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully update job name', async () => {
    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), name: 'Updated Job Name' };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job;
    expect(savedJob.name().value()).toBe('Updated Job Name');
    if (result.isOk()) expect(result.value.updatedAt).not.toBe(existingJob.updatedAt().toISOString());
  });

  it('should successfully update job payload', async () => {
    const newPayload = { newData: 'new value' };
    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), payload: newPayload };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job;
    expect(savedJob.payload()).toEqual(newPayload);
  });

  it('should successfully update job priority', async () => {
    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), priority: JobPriority.HIGH };
    const result = await useCase.execute(input);
    expect(result.isOk()).toBe(true);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job;
    expect(savedJob.priority().value()).toBe(JobPriority.HIGH);
  });

  it('should successfully update targetAgentRole', async () => {
    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), targetAgentRole: 'special_worker' };
    const result = await useCase.execute(input);
    expect(result.isOk()).toBe(true);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job;
    expect(savedJob.targetAgentRole()?.value()).toBe('special_worker');
  });

  it('should successfully update retryPolicy', async () => {
    const newRetryPolicyInput = { maxAttempts: 5, initialDelaySeconds: 30, backoffType: BackoffType.EXPONENTIAL };
    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), retryPolicy: newRetryPolicyInput };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job;
    expect(savedJob.retryPolicy().maxAttempts().value()).toBe(5);
    // Further checks on retry policy details if needed
  });

  it('should not call save if no actual changes are made', async () => {
    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), name: existingJob.name().value() };
    const result = await useCase.execute(input);
    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).not.toHaveBeenCalled();
    if (result.isOk()) expect(result.value.updatedAt).toBe(existingJob.updatedAt().toISOString());
  });

  it('should return NotFoundError if job to update is not found', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(null));
    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), name: 'New Name' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it('should return ZodError for invalid input (e.g., invalid jobId)', async () => {
    const input = { jobId: 'not-a-uuid', name: 'New Name' };
    const result = await useCase.execute(input as any); // Cast to bypass TS error for test
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(ZodError);
  });

  it('should return DomainError if repository findById fails', async () => {
    const repoError = new DomainError('DB find error');
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(error(repoError));
    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), name: 'New Name' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value.message).toContain('Failed to fetch job for update');
    }
  });

  it('should return DomainError if repository save fails', async () => {
    const repoError = new DomainError('DB save error');
    (mockJobRepository.save as vi.Mock).mockResolvedValue(error(repoError));
    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), name: 'New Name' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value.message).toContain('Failed to save updated job');
    }
  });

  it('should return ValueError if a VO creation fails during update', async () => {
    const originalJobNameCreate = JobName.create;
    JobName.create = vi.fn().mockImplementation(() => { throw new ValueError("Mocked JobName error"); });

    const input: UpdateJobUseCaseInput = { jobId: testJobId.value(), name: "Trigger VO Error" };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value).toBeInstanceOf(ValueError);
        expect(result.value.message).toBe("Mocked JobName error");
    }
    JobName.create = originalJobNameCreate; // Restore
  });
});
