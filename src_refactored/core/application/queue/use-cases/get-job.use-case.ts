// src_refactored/core/application/queue/use-cases/get-job.use-case.ts
import { IUseCase } from '../../common/ports/use-case.interface';
import { IJobRepository, IJobRepository as JobRepositorySymbol } from '../../../domain/job/ports/job-repository.interface';
import { JobEntity } from '../../../domain/job/job.entity';
import { JobIdVO } from '../../../domain/job/value-objects/job-id.vo';
import { GetJobRequestDTO, GetJobResponseDTO } from '../dtos';
import { Result, ok as Ok, error as Err } from '../../../../shared/result';
import { ValueError } from '../../../domain/common/errors';
// import { Inject, Injectable } from '../../common/ioc/dependency-injection.decorators';

// @Injectable()
export class GetJobUseCase<TData = any, TResult = any>
  implements IUseCase<GetJobRequestDTO, GetJobResponseDTO<TData, TResult>> {

  private readonly jobRepository: IJobRepository;

  constructor(
    // @Inject(JobRepositorySymbol)
    jobRepository: IJobRepository
  ) {
    this.jobRepository = jobRepository;
  }

  async execute(
    request: GetJobRequestDTO,
  ): Promise<GetJobResponseDTO<TData, TResult>> {
    try {
      const jobIdVO = JobIdVO.create(request.jobId); // Can throw ValueError if ID is invalid

      const findResult = await this.jobRepository.findById(jobIdVO);

      if (findResult.success === false) {
        // Propagate repository error
        return Err(findResult.error);
      }
      // findResult.value will be JobEntity | null
      return Ok(findResult.value as JobEntity<TData, TResult> | null);

    } catch (err: any) {
      if (err instanceof ValueError) {
        return Err(err); // From JobIdVO.create()
      }
      return Err(new Error(`An unexpected error occurred while getting the job: ${err.message}`));
    }
  }
}
