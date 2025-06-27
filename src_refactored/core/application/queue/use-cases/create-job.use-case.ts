// src_refactored/core/application/queue/use-cases/create-job.use-case.ts
import { ValueError } from '@/domain/common/errors'; // Corrected path
import { JobEntity, JobEntityConstructionProps } from '@/domain/job/job.entity';
import { IJobRepository, IJobRepository as JobRepositorySymbol } from '@/domain/job/ports/job-repository.interface';

import { IUseCase } from '@/application/common/ports/use-case.interface';
// import { Inject, Injectable } from '@/application/common/ioc/dependency-injection.decorators'; // Assuming an IoC container might be used

import { Result, ok as Ok, error as Err } from '@/shared/result'; // Use exported ok and error

import { CreateJobRequestDTO, CreateJobResponseDTO } from '../dtos'; // This relative path might be okay or could use an alias if dtos are central


// @Injectable() // Decorator if an IoC container like InversifyJS is used
export class CreateJobUseCase<TData = any, TResult = any>
  implements IUseCase<CreateJobRequestDTO<TData>, CreateJobResponseDTO<TData, TResult>> {

  private readonly jobRepository: IJobRepository;

  constructor(
    // @Inject(JobRepositorySymbol) // Example if Symbol is used as token
    jobRepository: IJobRepository
  ) {
    this.jobRepository = jobRepository;
  }

  async execute(
    request: CreateJobRequestDTO<TData>,
  ): Promise<CreateJobResponseDTO<TData, TResult>> {
    try {
      const jobEntityConstructionProps: JobEntityConstructionProps<TData> = {
        queueName: request.queueName,
        jobName: request.jobName,
        payload: request.payload,
        opts: request.opts,
      };

      // Create the job entity. JobEntity.create might throw ValueError.
      const jobEntity = JobEntity.create<TData, TResult>(jobEntityConstructionProps);

      // Persist the job entity
      const saveResult = await this.jobRepository.save(jobEntity);

      if (saveResult.success === false) { // Check using success property
        // Propagate repository error
        return Err(saveResult.error);
      }

      return Ok(jobEntity);
    } catch (err: any) {
      // Catch errors from JobEntity.create() or other unexpected issues
      if (err instanceof ValueError) {
         return Err(err); // Propagate ValueError
      }
      // For other errors, wrap them in a generic Error or a specific AppError if defined
      return Err(new Error(`An unexpected error occurred while creating the job: ${err.message}`));
    }
  }
}
