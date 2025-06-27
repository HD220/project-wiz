// src_refactored/core/application/use-cases/job/cancel-job.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';

import { DomainError, NotFoundError } from '@/application/common/errors'; // Or @/domain/common/errors

import { IJobQueue } from '@/core/ports/adapters/job-queue.interface'; // Unresolved path likely

import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobId } from '@/domain/job/value-objects/job-id.vo';
import { JobName } from '@/domain/job/value-objects/job-name.vo'; // Unresolved path likely
import { JobStatus, JobStatusType } from '@/domain/job/value-objects/job-status.vo';

import { ok, error } from '@/shared/result';

import { CancelJobUseCaseInput } from './cancel-job.schema';
import { CancelJobUseCase } from './cancel-job.use-case';

// Mocks
const mockJobRepository: IJobRepository = {
  findById: vi.fn(),
  save: vi.fn(),
  // Fill other required methods from IJobRepository if not already present from other tests
  findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), findPendingJobsWithNoDependencies: vi.fn(), findActiveJobsByWorker: vi.fn(), findJobsByStatus: vi.fn(), findStaleActiveJobs: vi.fn(),
};
const mockJobQueue: IJobQueue = { // Mock IJobQueue, though not heavily used yet
  add: vi.fn(), getNext: vi.fn(), complete: vi.fn(), fail: vi.fn(), delay: vi.fn(), getJobById: vi.fn(),
};

describe('CancelJobUseCase', () => {
  let useCase: CancelJobUseCase;
  const testJobId = JobId.generate();
  let jobToCancel: Job;

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new CancelJobUseCase(mockJobRepository, mockJobQueue);

    jobToCancel = Job.create({ // A job in a cancellable state (e.g., PENDING)
      id: testJobId,
      name: JobName.create('Cancellable Job'),
      payload: {},
      status: JobStatus.pending(), // Explicitly set to PENDING
    });
  });

  it('should successfully cancel a job that is in a cancellable state', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToCancel));
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined));

    const input: CancelJobUseCaseInput = { jobId: testJobId.value(), reason: 'User request' };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(true);
      expect(result.value.jobId).toBe(testJobId.value());
      expect(result.value.finalStatus).toBe(JobStatusType.CANCELLED);
    }
    expect(mockJobRepository.save).toHaveBeenCalledTimes(1);
    const savedJob = (mockJobRepository.save as vi.Mock).mock.calls[0][0] as Job;
    expect(savedJob.status().is(JobStatusType.CANCELLED)).toBe(true);
  });

  it('should return success:false if job is already in a terminal state (e.g., COMPLETED)', async () => {
    const completedJob = Job.create({ id: testJobId, name: JobName.create('Completed Job'), payload: {} });
    completedJob.moveToCompleted({ result: 'done' }); // Move to COMPLETED
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(completedJob));

    const input: CancelJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(false);
      expect(result.value.jobId).toBe(testJobId.value());
      expect(result.value.finalStatus).toBe(JobStatusType.COMPLETED);
      expect(result.value.message).toContain('already in a terminal state');
    }
    expect(mockJobRepository.save).not.toHaveBeenCalled();
  });

  it('should return success:false if job is already CANCELLED', async () => {
    jobToCancel.moveToCancelled(); // Pre-cancel it
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToCancel));

    const input: CancelJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.success).toBe(false);
      expect(result.value.finalStatus).toBe(JobStatusType.CANCELLED);
    }
    expect(mockJobRepository.save).not.toHaveBeenCalled();
  });


  it('should return NotFoundError if job to cancel is not found', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(null));
    const input: CancelJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value).toBeInstanceOf(NotFoundError);
      expect(result.value.message).toContain('not found for cancellation');
    }
  });

  it('should return ZodError for invalid jobId format', async () => {
    const input: CancelJobUseCaseInput = { jobId: 'not-a-uuid' };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(ZodError);
  });

  it('should return DomainError if repository findById fails', async () => {
    const repoError = new DomainError('DB find error');
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(error(repoError));
    const input: CancelJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value.message).toContain('Failed to fetch job for cancellation');
    }
  });

  it('should return DomainError if repository save fails after successful cancellation logic', async () => {
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(jobToCancel));
    const repoSaveError = new DomainError('DB save error');
    (mockJobRepository.save as vi.Mock).mockResolvedValue(error(repoSaveError));

    const input: CancelJobUseCaseInput = { jobId: testJobId.value() };
    const result = await useCase.execute(input);

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.value.message).toContain('Failed to save cancelled job status');
    }
  });
});
