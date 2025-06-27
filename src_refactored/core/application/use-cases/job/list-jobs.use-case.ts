// src_refactored/core/application/use-cases/job/list-jobs.use-case.ts
import { ZodError } from 'zod';

import { ILogger } from '@/core/common/services/i-logger.service'; // Added ILogger

import { DomainError, ValueError } from '@/domain/common/errors';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { JobSearchFilters, PaginationOptions } from '@/domain/job/ports/job-repository.types';
import { TargetAgentRoleVO } from '@/domain/job/value-objects/target-agent-role.vo'; // Corrected: TargetAgentRole to TargetAgentRoleVO

import { IUseCase } from '@/application/common/ports/use-case.interface';

import { Result, ok, error } from '@/shared/result';

import {
  ListJobsUseCaseInput,
  ListJobsUseCaseInputSchema,
  ListJobsUseCaseOutput,
  JobListItem,
} from './list-jobs.schema';

export class ListJobsUseCase
  implements
    IUseCase<
      ListJobsUseCaseInput,
      ListJobsUseCaseOutput,
      DomainError | ZodError | ValueError
    >
{
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly logger: ILogger, // Added logger
  ) {}

  async execute(
    input: ListJobsUseCaseInput,
  ): Promise<Result<ListJobsUseCaseOutput, DomainError | ZodError | ValueError>> {
    const validationResult = ListJobsUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const filters: Partial<JobSearchFilters> = {};
      if (validInput.status && validInput.status.length > 0) {
        filters.status = validInput.status;
      }
      if (validInput.targetAgentRole) {
        filters.targetAgentRole = TargetAgentRoleVO.create(validInput.targetAgentRole); // Use TargetAgentRoleVO
      }
      if (validInput.nameContains) {
        filters.nameContains = validInput.nameContains;
      }

      const pagination: PaginationOptions = {
        page: validInput.page,
        pageSize: validInput.pageSize,
      };

      const searchResult = await this.jobRepository.search(filters, pagination);
      if (searchResult.isError()) {
        return error(new DomainError(`Failed to list jobs: ${searchResult.value.message}`, searchResult.value));
      }

      const paginatedData = searchResult.value;

      const jobListItems: JobListItem[] = paginatedData.jobs.map((jobEntity: Job<unknown, unknown>) => ({ // Specify Job generic type
        id: jobEntity.id().value(),
        name: jobEntity.name().value(),
        status: jobEntity.status().value(),
        targetAgentRole: jobEntity.targetAgentRole()?.value() || null,
        priority: jobEntity.priority().value(),
        createdAt: jobEntity.createdAt().toISOString(),
        updatedAt: jobEntity.updatedAt().toISOString(),
        executeAfter: jobEntity.executeAfter()?.toISOString() || null,
      }));

      return ok({
        jobs: jobListItems,
        totalCount: paginatedData.totalCount,
        page: paginatedData.page,
        pageSize: paginatedData.pageSize,
        totalPages: paginatedData.totalPages,
      });
    } catch (e: unknown) { // Changed err: any to e: unknown
      if (e instanceof ZodError || e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[ListJobsUseCase] Unexpected error: ${message}`, { error: e }); // Added logger
      return error(new DomainError(`Unexpected error listing jobs: ${message}`));
    }
  }
}
