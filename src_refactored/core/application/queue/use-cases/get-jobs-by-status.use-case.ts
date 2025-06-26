// src_refactored/core/application/queue/use-cases/get-jobs-by-status.use-case.ts
import { IUseCase } from '../../common/ports/use-case.interface';
import { IJobRepository, IJobRepository as JobRepositorySymbol } from '../../../domain/job/ports/job-repository.interface';
import { JobSearchFilters, PaginationOptions, PaginatedJobsResult } from '../../../domain/job/ports/job-repository.types';
import { GetJobsByStatusRequestDTO, GetJobsByStatusResponseDTO } from '../dtos';
import { Result, ok as Ok, error as Err } from '../../../../shared/result';
// import { Inject, Injectable } from '../../common/ioc/dependency-injection.decorators';

// @Injectable()
export class GetJobsByStatusUseCase<TData = any, TResult = any>
  implements IUseCase<GetJobsByStatusRequestDTO, GetJobsByStatusResponseDTO<TData, TResult>> {

  private readonly jobRepository: IJobRepository;

  constructor(
    // @Inject(JobRepositorySymbol)
    jobRepository: IJobRepository
  ) {
    this.jobRepository = jobRepository;
  }

  async execute(
    request: GetJobsByStatusRequestDTO,
  ): Promise<GetJobsByStatusResponseDTO<TData, TResult>> {
    try {
      const filters: JobSearchFilters = {
        queueName: request.queueName,
        status: request.statuses,
        // Other filters can be added here if GetJobsByStatusRequestDTO expands
      };

      const pagination: PaginationOptions = request.paginationOptions || {
        // Default pagination if not provided
        page: 1,
        limit: 20, // Default limit
      };

      const searchResult = await this.jobRepository.search(filters, pagination);

      if (searchResult.success === false) {
        // Propagate repository error
        return Err(searchResult.error);
      }

      // The result from repository search is already PaginatedJobsResult<any, any>
      // We cast it here to the specific TData, TResult of this use case instance.
      // This assumes the underlying data in JobEntity instances within PaginatedJobsResult
      // is compatible or that consumers will handle potential type differences if TData/TResult vary.
      return Ok(searchResult.value as PaginatedJobsResult<TData, TResult>);

    } catch (err: any) {
      // Catch any unexpected errors during filter/pagination setup or if repository.search itself throws
      return Err(new Error(`An unexpected error occurred while getting jobs by status: ${err.message}`));
    }
  }
}
