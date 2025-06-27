// src_refactored/core/application/use-cases/job/list-jobs.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';

import { DomainError } from '@/domain/common/errors';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobSearchFilters, PaginatedJobsResult } from '@/domain/job/ports/job-repository.types';
// import { PaginationOptions } from '@/domain/job/ports/job-repository.types'; // Not directly used in spec
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';
import { JobNameVO } from '@/domain/job/value-objects/job-name.vo';
import { JobPriorityVO } from '@/domain/job/value-objects/job-priority.vo';
import { JobStatusVO, JobStatusEnum } from '@/domain/job/value-objects/job-status.vo';
import { JobTimestampVO } from '@/domain/job/value-objects/job-timestamp.vo';
import { TargetAgentRoleVO } from '@/domain/job/value-objects/target-agent-role.vo';

import { ok, error } from '@/shared/result';

import { ListJobsUseCaseInput } from './list-jobs.schema';
import { ListJobsUseCase } from './list-jobs.use-case';

const mockJobRepository: IJobRepository = {
  search: vi.fn(),
  // Fill other methods from IJobRepository
  save: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), findPendingJobsWithNoDependencies: vi.fn(), findActiveJobsByWorker: vi.fn(), findJobsByStatus: vi.fn(), findStaleActiveJobs: vi.fn(), findProcessableJobs: vi.fn(),
};

describe('ListJobsUseCase', () => {
  let useCase: ListJobsUseCase;
  const now = new Date();
  const jobEntity1 = Job.create({
    id: JobIdVO.generate(), name: JobNameVO.create('Job One').unwrap(), payload: {},
    status: JobStatusVO.pending(), priority: JobPriorityVO.default(),
    createdAt: JobTimestampVO.create(now).unwrap(), updatedAt: JobTimestampVO.create(now).unwrap(),
  }).unwrap();
  const jobEntity2 = Job.create({
    id: JobIdVO.generate(), name: JobNameVO.create('Job Two (coder)').unwrap(), payload: {},
    status: JobStatusVO.active(), targetAgentRole: TargetAgentRoleVO.create('coder_agent').unwrap(),
    priority: JobPriorityVO.create(JobPriorityVO.HIGH).unwrap(),
    createdAt: JobTimestampVO.create(now).unwrap(), updatedAt: JobTimestampVO.create(now).unwrap(),
  }).unwrap();

  beforeEach(() => {
    vi.resetAllMocks();
    useCase = new ListJobsUseCase(mockJobRepository);
  });

  it('should successfully list jobs with default pagination and no filters', async () => {
    const paginatedResult: PaginatedJobsResult = {
      jobs: [jobEntity1, jobEntity2], totalCount: 2, page: 1, pageSize: 20, totalPages: 1,
    };
    (mockJobRepository.search as vi.Mock).mockResolvedValue(ok(paginatedResult));
    const input: ListJobsUseCaseInput = {}; // Uses defaults for page and pageSize
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const output = result.value;
      expect(output.jobs).toHaveLength(2);
      expect(output.jobs[0].id).toBe(jobEntity1.id().value());
      expect(output.jobs[1].name).toBe('Job Two (coder)');
      expect(output.totalCount).toBe(2);
      expect(output.page).toBe(1);
      expect(output.pageSize).toBe(20); // Default from schema
      expect(output.totalPages).toBe(1);
    }
    expect(mockJobRepository.search).toHaveBeenCalledWith(
      {}, // Empty filters
      { page: 1, pageSize: 20 } // Default pagination
    );
  });

  it('should pass filters and pagination to repository search method', async () => {
    const paginatedResult: PaginatedJobsResult = {
      jobs: [jobEntity2], totalCount: 1, page: 2, pageSize: 10, totalPages: 1,
    };
    (mockJobRepository.search as vi.Mock).mockResolvedValue(ok(paginatedResult));
    const input: ListJobsUseCaseInput = {
      status: [JobStatusEnum.ACTIVE], // Use JobStatusEnum
      targetAgentRole: 'coder_agent',
      nameContains: 'Two',
      page: 2,
      pageSize: 10,
    };
    await useCase.execute(input);

    expect(mockJobRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [JobStatusEnum.ACTIVE], // Use JobStatusEnum
        targetAgentRole: expect.any(TargetAgentRoleVO), // Use TargetAgentRoleVO
        nameContains: 'Two',
      }),
      { page: 2, pageSize: 10 },
    );
    const calledFilters = (mockJobRepository.search as vi.Mock).mock.calls[0][0] as JobSearchFilters;
    expect(calledFilters.targetAgentRole?.value).toBe('coder_agent');
  });

  it('should return ZodError for invalid input (e.g., negative page size)', async () => {
    const input = { pageSize: -5 };
    const result = await useCase.execute(input as ListJobsUseCaseInput); // Cast to expected type
    expect(result.isError()).toBe(true);
    if (result.isError()) expect(result.value).toBeInstanceOf(ZodError);
  });

  it('should return DomainError if repository search fails', async () => {
    const repoError = new DomainError('DB search failed');
    (mockJobRepository.search as vi.Mock).mockResolvedValue(error(repoError as Error)); // Cast to Error
    const input: ListJobsUseCaseInput = {};
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if (result.isError()) {
        expect(result.value).toBeInstanceOf(DomainError);
        expect(result.value.message).toContain('Failed to list jobs');
    }
  });

  it('should handle empty result from repository correctly', async () => {
    const paginatedResult: PaginatedJobsResult = {
      jobs: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0,
    };
    (mockJobRepository.search as vi.Mock).mockResolvedValue(ok(paginatedResult));
    const input: ListJobsUseCaseInput = {};
    const result = await useCase.execute(input);

    expect(result.isOk()).toBe(true);
    if(result.isOk()){
        expect(result.value.jobs).toEqual([]);
        expect(result.value.totalCount).toBe(0);
        expect(result.value.totalPages).toBe(0);
    }
  });
});
