// src_refactored/core/application/queue/use-cases/get-jobs-by-status.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { JobEntity, JobEntityProps } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { PaginatedJobsResult } from '@/domain/job/ports/job-repository.types';
// import { JobSearchFilters, PaginationOptions } from '@/domain/job/ports/job-repository.types'; // Not used directly in this spec
import { JobExecutionLogsVO } from '@/domain/job/value-objects/job-execution-logs.vo';
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';
import { JobOptionsVO } from '@/domain/job/value-objects/job-options.vo';
import { JobPriorityVO } from '@/domain/job/value-objects/job-priority.vo';
import { JobProgressVO } from '@/domain/job/value-objects/job-progress.vo';
import { JobStatusEnum, JobStatusVO } from '@/domain/job/value-objects/job-status.vo';
import { ok, error } from '@/shared/result';

import { GetJobsByStatusRequestDTO } from '../dtos';
import { GetJobsByStatusUseCase } from './get-jobs-by-status.use-case';

describe('GetJobsByStatusUseCase', () => {
  let mockJobRepository: IJobRepository;
  let getJobsByStatusUseCase: GetJobsByStatusUseCase;

  const mockJobId1 = JobIdVO.generate();
  const mockJobId2 = JobIdVO.generate();
  const mockJob1 = new (JobEntity as any)({
    id: mockJobId1,
    queueName: 'q1',
    jobName: 'j1',
    payload: {},
    opts: JobOptionsVO.default(),
    status: JobStatusVO.pending(),
    priority: JobPriorityVO.default(),
    progress: JobProgressVO.initial(),
    attemptsMade: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    executionLogs: JobExecutionLogsVO.empty(),
  } as JobEntityProps) as JobEntity;
  const mockJob2 = new (JobEntity as any)({
    id: mockJobId2,
    queueName: 'q1',
    jobName: 'j2',
    payload: {},
    opts: JobOptionsVO.default(),
    status: JobStatusVO.active(),
    priority: JobPriorityVO.default(),
    progress: JobProgressVO.initial(),
    attemptsMade: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    executionLogs: JobExecutionLogsVO.empty(),
  } as JobEntityProps) as JobEntity;

  beforeEach(() => {
    mockJobRepository = {
      save: vi.fn(), findById: vi.fn(), findByIds: vi.fn(), findAndLockProcessableJobs: vi.fn(),
      findStalledJobs: vi.fn(), findDelayedJobsToPromote: vi.fn(), findJobsByRepeatKey: vi.fn(),
      findJobsByParentId: vi.fn(), getJobCountsByStatus: vi.fn(), delete: vi.fn(),
      removeCompletedJobs: vi.fn(), removeFailedJobs: vi.fn(), search: vi.fn(),
    };
    getJobsByStatusUseCase = new GetJobsByStatusUseCase(mockJobRepository);
    vi.clearAllMocks();
  });

  it('should successfully return jobs matching the status and queue', async () => {
    const request: GetJobsByStatusRequestDTO = {
      queueName: 'q1',
      statuses: [JobStatusEnum.PENDING, JobStatusEnum.ACTIVE],
      paginationOptions: { page: 1, limit: 10 },
    };
    const paginatedResult: PaginatedJobsResult<unknown, unknown> = {
      jobs: [mockJob1, mockJob2],
      totalItems: 2,
      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 10,
    };
    (mockJobRepository.search as vi.Mock).mockResolvedValue(ok(paginatedResult));

    const result = await getJobsByStatusUseCase.execute(request);

    expect(mockJobRepository.search).toHaveBeenCalledWith(
      { queueName: 'q1', status: [JobStatusEnum.PENDING, JobStatusEnum.ACTIVE] },
      { page: 1, limit: 10 },
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toEqual(paginatedResult);
    }
  });

  it('should use default pagination if none provided', async () => {
    const request: GetJobsByStatusRequestDTO = {
      queueName: 'q1',
      statuses: [JobStatusEnum.COMPLETED],
    };
    const paginatedResult: PaginatedJobsResult<unknown, unknown> = {
      jobs: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      itemsPerPage: 20, // Default limit
    };
    (mockJobRepository.search as vi.Mock).mockResolvedValue(ok(paginatedResult));

    await getJobsByStatusUseCase.execute(request);

    expect(mockJobRepository.search).toHaveBeenCalledWith(
      { queueName: 'q1', status: [JobStatusEnum.COMPLETED] },
      { page: 1, limit: 20 }, // Default pagination
    );
  });

  it('should return an error if jobRepository.search fails', async () => {
    const request: GetJobsByStatusRequestDTO = {
      queueName: 'q1',
      statuses: [JobStatusEnum.FAILED],
    };
    const repoError = new Error('Database query failed');
    (mockJobRepository.search as vi.Mock).mockResolvedValue(error(repoError));

    const result = await getJobsByStatusUseCase.execute(request);

    expect(mockJobRepository.search).toHaveBeenCalled();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe(repoError);
    }
  });

   it('should return an empty list if no jobs match', async () => {
    const request: GetJobsByStatusRequestDTO = {
      queueName: 'q1',
      statuses: [JobStatusEnum.DELAYED],
      paginationOptions: { page: 1, limit: 10 },
    };
    const paginatedResult: PaginatedJobsResult = {
      jobs: [], totalItems: 0, totalPages: 0, currentPage: 1, itemsPerPage: 10,
    };
    (mockJobRepository.search as vi.Mock).mockResolvedValue(ok(paginatedResult));

    const result = await getJobsByStatusUseCase.execute(request);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value.jobs).toEqual([]);
      expect(result.value.totalItems).toBe(0);
    }
  });
});
