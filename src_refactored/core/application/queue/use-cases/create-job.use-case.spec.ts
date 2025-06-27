// src_refactored/core/application/queue/use-cases/create-job.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ValueError } from '@/domain/common/errors';
import { JobEntity, JobEntityProps } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobExecutionLogsVO } from '@/domain/job/value-objects/job-execution-logs.vo';
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';
import { JobOptionsVO } from '@/domain/job/value-objects/job-options.vo';
import { JobPriorityVO } from '@/domain/job/value-objects/job-priority.vo';
import { JobProgressVO } from '@/domain/job/value-objects/job-progress.vo';
import { JobStatusVO } from '@/domain/job/value-objects/job-status.vo'; // Keep JobStatusEnum here
import { ok, error } from '@/shared/result';

import { CreateJobRequestDTO } from '../dtos';
import { CreateJobUseCase } from './create-job.use-case';

// Mock JobEntity.create
vi.mock('@/domain/job/job.entity', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/domain/job/job.entity')>();
  return {
    ...actual,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    JobEntity: {
      ...actual.JobEntity,
      create: vi.fn(),
    },
  };
});

describe('CreateJobUseCase', () => {
  let mockJobRepository: IJobRepository;
  let createJobUseCase: CreateJobUseCase;

  const mockJobId = JobIdVO.generate();
  const mockDefaultJobProps: JobEntityProps = {
    id: mockJobId,
    queueName: 'test-queue',
    jobName: 'test-job',
    payload: { data: 'test' },
    opts: JobOptionsVO.default(),
    status: JobStatusVO.pending(),
    priority: JobPriorityVO.default(),
    progress: JobProgressVO.initial(),
    attemptsMade: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    executionLogs: JobExecutionLogsVO.empty(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any; // Cast to any to satisfy the JobEntity constructor in tests

  beforeEach(() => {
    mockJobRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByIds: vi.fn(),
      findAndLockProcessableJobs: vi.fn(),
      findStalledJobs: vi.fn(),
      findDelayedJobsToPromote: vi.fn(),
      findJobsByRepeatKey: vi.fn(),
      findJobsByParentId: vi.fn(),
      getJobCountsByStatus: vi.fn(),
      delete: vi.fn(),
      removeCompletedJobs: vi.fn(),
      removeFailedJobs: vi.fn(),
      search: vi.fn(),
    };
    createJobUseCase = new CreateJobUseCase(mockJobRepository);
    vi.clearAllMocks();
  });

  it('should successfully create and save a job', async () => {
    const request: CreateJobRequestDTO = {
      queueName: 'test-queue',
      jobName: 'test-job',
      payload: { data: 'test' },
      opts: { priority: 3 },
    };

    const mockJobEntity = new (JobEntity as any)(mockDefaultJobProps) as JobEntity;
    (JobEntity.create as vi.Mock).mockReturnValue(mockJobEntity);
    (mockJobRepository.save as vi.Mock).mockResolvedValue(ok(undefined as void));

    const result = await createJobUseCase.execute(request);

    expect(JobEntity.create).toHaveBeenCalledWith({
      queueName: request.queueName,
      jobName: request.jobName,
      payload: request.payload,
      opts: request.opts,
    });
    expect(mockJobRepository.save).toHaveBeenCalledWith(mockJobEntity);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(mockJobEntity);
    }
  });

  it('should return an error if JobEntity.create fails', async () => {
    const request: CreateJobRequestDTO = {
      queueName: '', // Invalid queueName to make JobEntity.create fail
      jobName: 'test-job',
      payload: { data: 'test' },
    };
    const creationError = new ValueError('Job creation requires a queueName.');
    (JobEntity.create as vi.Mock).mockImplementation(() => {
      throw creationError;
    });

    const result = await createJobUseCase.execute(request);

    expect(JobEntity.create).toHaveBeenCalled();
    expect(mockJobRepository.save).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValueError);
      expect(result.error.message).toBe(creationError.message);
    }
  });

  it('should return an error if jobRepository.save fails', async () => {
    const request: CreateJobRequestDTO = {
      queueName: 'test-queue',
      jobName: 'test-job',
      payload: { data: 'test' },
    };
    const mockJobEntity = new (JobEntity as any)(mockDefaultJobProps) as JobEntity;
    (JobEntity.create as vi.Mock).mockReturnValue(mockJobEntity);

    const repoError = new Error('Failed to save job');
    (mockJobRepository.save as vi.Mock).mockResolvedValue(error(repoError as Error));

    const result = await createJobUseCase.execute(request);

    expect(JobEntity.create).toHaveBeenCalled();
    expect(mockJobRepository.save).toHaveBeenCalledWith(mockJobEntity);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(repoError);
    }
  });
});
