// src_refactored/core/application/use-cases/job/list-jobs.use-case.ts
import { ZodError } from 'zod';
import { Executable } from '../../../common/executable';
import {
  ListJobsUseCaseInput,
  ListJobsUseCaseInputSchema,
  ListJobsUseCaseOutput,
  JobListItem,
} from './list-jobs.schema';
import { IJobRepository } from '../../../../domain/job/ports/job-repository.interface';
import { JobSearchFilters, PaginationOptions } from '../../../../domain/job/ports/job-repository.types';
import { TargetAgentRole } from '../../../../domain/job/value-objects/target-agent-role.vo';
import { Job } from '../../../../domain/job/job.entity';
import { Result, ok, error } from '../../../../../shared/result';
import { DomainError, ValueError } from '../../../../common/errors';

export class ListJobsUseCase
  implements
    Executable<
      ListJobsUseCaseInput,
      ListJobsUseCaseOutput,
      DomainError | ZodError | ValueError
    >
{
  constructor(private jobRepository: IJobRepository) {}

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
        filters.targetAgentRole = TargetAgentRole.create(validInput.targetAgentRole);
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

      const jobListItems: JobListItem[] = paginatedData.jobs.map((jobEntity: Job) => ({
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

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[ListJobsUseCase] Unexpected error:`, err);
      return error(new DomainError(`Unexpected error listing jobs: ${err.message || err}`));
    }
  }
}
