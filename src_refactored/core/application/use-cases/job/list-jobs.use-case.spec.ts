// src_refactored/core/application/use-cases/job/list-jobs.use-case.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ZodError } from 'zod';
import { ListJobsUseCase } from './list-jobs.use-case';
import { ListJobsUseCaseInput } from './list-jobs.schema';
import { IJobRepository } from '../../../../domain/job/ports/job-repository.interface';
import { JobSearchFilters, PaginationOptions, PaginatedJobsResult } from '../../../../domain/job/ports/job-repository.types';
import { Job } from '../../../../domain/job/job.entity';
import { JobId } from '../../../../domain/job/value-objects/job-id.vo';
import { JobName } from '../../../../domain/job/value-objects/job-name.vo';
import { JobStatus, JobStatusType } from '../../../../domain/job/value-objects/job-status.vo';
import { TargetAgentRole } from '../../../../domain/job/value-objects/target-agent-role.vo';
import { JobPriority } from '../../../../domain/job/value-objects/job-priority.vo';
import { JobTimestamp } from '../../../../domain/job/value-objects/job-timestamp.vo';
import { ok, error } from '../../../../../shared/result';
import { DomainError } from '../../../../common/errors';

const mockJobRepository: IJobRepository = {
  search: vi.fn(),
  // Fill other methods from IJobRepository
  save: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(), delete: vi.fn(), findPendingJobsWithNoDependencies: vi.fn(), findActiveJobsByWorker: vi.fn(), findJobsByStatus: vi.fn(), findStaleActiveJobs: vi.fn(), findProcessableJobs: vi.fn(),
};

describe('ListJobsUseCase', () => {
  let useCase: ListJobsUseCase;
  const now = new Date();
  const jobEntity1 = Job.create({
    id: JobId.generate(), name: JobName.create('Job One'), payload: {},
    status: JobStatus.pending(), priority: JobPriority.default(),
    createdAt: JobTimestamp.create(now), updatedAt: JobTimestamp.create(now)
  });
  const jobEntity2 = Job.create({
    id: JobId.generate(), name: JobName.create('Job Two (coder)'), payload: {},
    status: JobStatus.active(), targetAgentRole: TargetAgentRole.create('coder_agent'),
    priority: JobPriority.create(JobPriority.HIGH),
    createdAt: JobTimestamp.create(now), updatedAt: JobTimestamp.create(now)
  });

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
      status: [JobStatusType.ACTIVE],
      targetAgentRole: 'coder_agent',
      nameContains: 'Two',
      page: 2,
      pageSize: 10,
    };
    await useCase.execute(input);

    expect(mockJobRepository.search).toHaveBeenCalledWith(
      expect.objectContaining({
        status: [JobStatusType.ACTIVE],
        targetAgentRole: expect.any(TargetAgentRole), // Checks if VO is created
        nameContains: 'Two',
      }),
      { page: 2, pageSize: 10 }
    );
    const calledFilters = (mockJobRepository.search as vi.Mock).mock.calls[0][0] as JobSearchFilters;
    expect(calledFilters.targetAgentRole?.value()).toBe('coder_agent');
  });

  it('should return ZodError for invalid input (e.g., negative page size)', async () => {
    const input = { pageSize: -5 };
    const result = await useCase.execute(input as any); // Cast for test
    expect(result.isError()).toBe(true);
    if(result.isError()) expect(result.value).toBeInstanceOf(ZodError);
  });

  it('should return DomainError if repository search fails', async () => {
    const repoError = new DomainError('DB search failed');
    (mockJobRepository.search as vi.Mock).mockResolvedValue(error(repoError));
    const input: ListJobsUseCaseInput = {};
    const result = await useCase.execute(input);
    expect(result.isError()).toBe(true);
    if(result.isError()) {
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
