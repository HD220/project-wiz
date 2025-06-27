// src_refactored/core/application/use-cases/job/update-job.use-case.spec.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ZodError } from 'zod';

import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
// import { AttemptCountVO } from '@/domain/job/value-objects/attempt-count.vo'; // MaxAttempts not used directly here
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';
import { JobNameVO } from '@/domain/job/value-objects/job-name.vo';
import { JobPriorityVO } from '@/domain/job/value-objects/job-priority.vo';
import { NoRetryPolicyVO, BackoffTypeEnum } from '@/domain/job/value-objects/retry-policy.vo'; // RetryPolicyVO might be needed if testing updates to it
import { TargetAgentRoleVO } from '@/domain/job/value-objects/target-agent-role.vo';

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
  const testJobIdVo = JobIdVO.generate(); // Use JobIdVO
  let existingJob: Job<unknown, unknown>; // Specify Job generic types

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new UpdateJobUseCase(mockJobRepository);

    existingJob = Job.create({
      id: testJobIdVo,
      name: JobNameVO.create('Original Job Name').unwrap(), // Use JobNameVO
      payload: { originalData: 'value' },
      priority: JobPriorityVO.create(JobPriorityVO.NORMAL).unwrap(), // Use JobPriorityVO
      targetAgentRole: TargetAgentRoleVO.create('general_worker').unwrap(), // Use TargetAgentRoleVO
      retryPolicy: NoRetryPolicyVO.create().unwrap(), // Use NoRetryPolicyVO
    }).unwrap();
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(existingJob));
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully update job name', async () => {
    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, name: 'Updated Job Name' };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.name().value).toBe('Updated Job Name'); // Access .value for VOs
    if (result.isOk()) expect(result.value.updatedAt).not.toBe(existingJob.updatedAt().toISOString());
  });

  it('should successfully update job payload', async () => {
    const newPayload = { newData: 'new value' };
    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, payload: newPayload };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.payload()).toEqual(newPayload);
  });

  it('should successfully update job priority', async () => {
    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, priority: JobPriorityVO.HIGH }; // Use JobPriorityVO
    const result = await useCase.execute(input);
    expect(result.isOk()).toBe(true);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.priority().value).toBe(JobPriorityVO.HIGH); // Access .value
  });

  it('should successfully update targetAgentRole', async () => {
    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, targetAgentRole: 'special_worker' };
    const result = await useCase.execute(input);
    expect(result.isOk()).toBe(true);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.targetAgentRole()?.value).toBe('special_worker'); // Access .value
  });

  it('should successfully update retryPolicy', async () => {
    const newRetryPolicyInput = { maxAttempts: 5, initialDelaySeconds: 30, backoffType: BackoffTypeEnum.EXPONENTIAL }; // Use BackoffTypeEnum
    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, retryPolicy: newRetryPolicyInput };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job<unknown, unknown>;
    expect(savedJob.retryPolicy().maxAttempts().value).toBe(5); // Access .value
  });

  it('should not call save if no actual changes are made', async () => {
    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, name: existingJob.name().value }; // Access .value
    const result = await useCase.execute(input);
    expect(result.isOk()).toBe(true);
    expect(mockJobRepository.save).not.toHaveBeenCalled();
    if (result.isOk()) expect(result.value.updatedAt).toBe(existingJob.updatedAt().toISOString());
  });

  it('should return NotFoundError if job to update is not found', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(null));
    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, name: 'New Name' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(NotFoundError);
  });

  it('should return ZodError for invalid input (e.g., invalid jobId)', async () => {
    const input = { jobId: 'not-a-uuid', name: 'New Name' };
    const result = await useCase.execute(input as UpdateJobUseCaseInput); // Cast
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(ZodError);
  });

  it('should return DomainError if repository findById fails', async () => {
    const repoError = new DomainError('DB find error');
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(error(repoError as Error)); // Cast
    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, name: 'New Name' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value.message).toContain('Failed to fetch job for update');
    }
  });

  it('should return DomainError if repository save fails', async () => {
    const repoError = new DomainError('DB save error');
    (mockJobRepository.save as vi.Mock).mockResolvedValue(error(repoError as Error)); // Cast
    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, name: 'New Name' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value.message).toContain('Failed to save updated job');
    }
  });

  it('should return ValueError if a VO creation fails during update', async () => {
    const originalJobNameCreate = JobNameVO.create; // Use JobNameVO
    JobNameVO.create = vi.fn().mockImplementation(() => { throw new ValueError("Mocked JobName error"); }); // Use JobNameVO

    const input: UpdateJobUseCaseInput = { jobId: testJobIdVo.value, name: "Trigger VO Error" };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value).toBeInstanceOf(ValueError);
        expect(result.value.message).toBe("Mocked JobName error");
    }
    JobNameVO.create = originalJobNameCreate; // Restore with JobNameVO
  });
});
