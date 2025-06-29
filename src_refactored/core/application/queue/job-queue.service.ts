// src_refactored/core/application/queue/job-queue.service.ts
import { injectable, inject } from 'inversify';

import { IJobEventEmitter, JOB_EVENT_EMITTER_TOKEN } from '@/core/application/ports/events/i-job-event-emitter.interface'; // Using actual renamed Symbol
import { ValueError } from '@/core/domain/common/errors'; // Corrected path
import { JobEntity } from '@/core/domain/job/job.entity';
import { IJobRepository, JOB_REPOSITORY_TOKEN } from '@/core/domain/job/ports/job-repository.interface';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';

import { Result, Ok } from '@/shared/result'; // Err removed


import { CreateJobRequestDTO } from './dtos/create-job.dto';
import { GetJobRequestDTO } from './dtos/get-job.dto';
import { JobEventType, JobEventPayloadMap } from './events/job-event.types';
import { CreateJobUseCase } from './use-cases/create-job.use-case';
import { GetJobUseCase } from './use-cases/get-job.use-case';


// Type for listeners that are specific to this queue instance
type QueueSpecificListener<K extends JobEventType> = (payload: Omit<JobEventPayloadMap[K], 'queueName'>) => void;


@injectable()
export class JobQueueService<DefaultJobData = unknown, DefaultJobResult = unknown> {
  private readonly createJobUseCase: CreateJobUseCase<DefaultJobData, DefaultJobResult>;
  private readonly getJobUseCase: GetJobUseCase<DefaultJobData, DefaultJobResult>;

  constructor(
    public readonly name: string, // Queue name
    @inject(JOB_REPOSITORY_TOKEN) private readonly jobRepository: IJobRepository,
    @inject(JOB_EVENT_EMITTER_TOKEN) private readonly jobEventEmitter: IJobEventEmitter, // Use renamed token
  ) {
    if (!name || name.trim() === '') {
      throw new ValueError('JobQueueService requires a queue name.');
    }
    // Use cases can be instantiated here directly, or injected if they have their own complex dependencies.
    // For now, direct instantiation seems fine as they primarily take repository and event emitter.
    this.createJobUseCase = new CreateJobUseCase<DefaultJobData, DefaultJobResult>(jobRepository, jobEventEmitter);
    this.getJobUseCase = new GetJobUseCase<DefaultJobData, DefaultJobResult>(jobRepository);
  }

  async add<TData = DefaultJobData, TResult = DefaultJobResult>(
    jobName: string,
    data: TData,
    opts?: IJobOptions,
  ): Promise<Result<JobEntity<TData, TResult>, Error>> {
    const request: CreateJobRequestDTO<TData> = {
      queueName: this.name,
      jobName,
      payload: data,
      opts,
    };
    // The use case is CreateJobUseCase<DefaultJobData, DefaultJobResult>
    // DefaultJobData is unknown, so CreateJobRequestDTO<TData> should be assignable
    // if TData is also unknown or a subtype.
    const result = await this.createJobUseCase.execute(request as CreateJobRequestDTO<unknown>);
    if (result.success) {
        // This cast is still potentially unsafe if TData/TResult are more specific than DefaultJobData/Result
        return Ok(result.value as JobEntity<TData, TResult>);
    }
    return result as Result<JobEntity<TData, TResult>, Error>;
  }

  async getJob<TData = DefaultJobData, TResult = DefaultJobResult>(
    jobId: string | JobIdVO,
  ): Promise<Result<JobEntity<TData, TResult> | null, Error>> {
    const jobIdValue = jobId instanceof JobIdVO ? jobId.value : jobId;
    const request: GetJobRequestDTO = { jobId: jobIdValue };

    const result = await this.getJobUseCase.execute(request);
    if (result.success) {
        return Ok(result.value as JobEntity<TData, TResult> | null);
    }
    return result as Result<JobEntity<TData, TResult> | null, Error>;
  }

  // Event handling: subscribe to global emitter but filter for this queue
  on<K extends JobEventType>(
    event: K,
    listener: QueueSpecificListener<K>
  ): this {
    const wrappedListener = (payload: JobEventPayloadMap[K]) => {
      // Check if the event is for this queue
      // All payloads in JobEventPayloadMap are expected to have queueName
      if ('queueName' in payload && payload.queueName === this.name) {
        const { queueName: _qn, ...restOfPayload } = payload; // Destructure, _qn is unused
        listener(restOfPayload as Omit<JobEventPayloadMap[K], 'queueName'>); // Cast to expected type
      }
      // The else-if block was removed as QueuePausedPayload and QueueResumedPayload
      // are expected to have queueName as per JobEventPayloadMap,
      // making them covered by the first if.
    };
    this.jobEventEmitter.on(event, wrappedListener);
    // TODO: Store wrappedListener to be able to remove it correctly in `off` method
    return this;
  }

  // TODO: Implement `off` method that correctly removes wrapped listeners.
  // TODO: Implement other Queue API methods: addBulk, getJobs, getJobCounts, removeJob, clean, empty, pause, resume, close.

  // Example for close (needs to be expanded)
  async close(): Promise<void> {
    this.jobEventEmitter.removeAllListeners(); // This is too broad, should only remove listeners for this queue instance
    // Or manage listeners added by this instance and remove them specifically.
  }
}
