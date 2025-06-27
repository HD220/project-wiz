// src_refactored/core/application/queue/use-cases/get-job.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ValueError } from '@/domain/common/errors';
import { JobEntity, JobEntityProps } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobExecutionLogsVO } from '@/domain/job/value-objects/job-execution-logs.vo';
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';
import { JobOptionsVO } from '@/domain/job/value-objects/job-options.vo';
import { JobPriorityVO } from '@/domain/job/value-objects/job-priority.vo';
import { JobProgressVO } from '@/domain/job/value-objects/job-progress.vo';
import { JobStatusVO } from '@/domain/job/value-objects/job-status.vo';

import { ok, error } from '@/shared/result';

import { GetJobRequestDTO } from '../dtos';

import { GetJobUseCase } from './get-job.use-case';

describe('GetJobUseCase', () => {
  let mockJobRepository: IJobRepository;
  let getJobUseCase: GetJobUseCase;

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
    getJobUseCase = new GetJobUseCase(mockJobRepository);
    vi.clearAllMocks();
  });

  it('should successfully return a job if found', async () => {
    const request: GetJobRequestDTO = { jobId: mockJobId.value };
    const mockJobEntity = new (JobEntity as any)(mockDefaultJobProps) as JobEntity;
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(mockJobEntity));

    const result = await getJobUseCase.execute(request);

    expect(mockJobRepository.findById).toHaveBeenCalledWith(expect.any(JobIdVO));
    expect(mockJobRepository.findById).toHaveBeenCalledWith(expect.objectContaining({ value: mockJobId.value }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(mockJobEntity);
    }
  });

  it('should return null if job is not found', async () => {
    const request: GetJobRequestDTO = { jobId: mockJobId.value };
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(ok(null));

    const result = await getJobUseCase.execute(request);

    expect(mockJobRepository.findById).toHaveBeenCalledWith(expect.objectContaining({ value: mockJobId.value }));
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBeNull();
    }
  });

  it('should return an error if JobIdVO.create fails for invalid ID format', async () => {
    const request: GetJobRequestDTO = { jobId: 'invalid-id-format' };
    // JobIdVO.create will throw ValueError directly

    const result = await getJobUseCase.execute(request);

    expect(mockJobRepository.findById).not.toHaveBeenCalled();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(ValueError);
      expect(result.error.message).toContain('Invalid Job ID format');
    }
  });

  it('should return an error if jobRepository.findById fails', async () => {
    const request: GetJobRequestDTO = { jobId: mockJobId.value };
    const repoError = new Error('Database connection error');
    (mockJobRepository.findById as vi.Mock).mockResolvedValue(error(repoError as Error));

    const result = await getJobUseCase.execute(request);

    expect(mockJobRepository.findById).toHaveBeenCalledWith(expect.objectContaining({ value: mockJobId.value }));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(repoError);
    }
  });
});
