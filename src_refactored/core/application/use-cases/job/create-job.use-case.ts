// src_refactored/core/application/use-cases/job/create-job.use-case.ts
import { ZodError } from 'zod';

import { DomainError, ValueError } from '@/domain/common/errors';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { AttemptCountVO } from '@/domain/job/value-objects/attempt-count.vo'; // Corrected: MaxAttempts to AttemptCountVO
import { JobDependsOnVO } from '@/domain/job/value-objects/job-depends-on.vo'; // Corrected: JobDependsOn to JobDependsOnVO
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo'; // Corrected: JobId to JobIdVO
import { JobNameVO } from '@/domain/job/value-objects/job-name.vo'; // Corrected: JobName to JobNameVO
import { JobPriorityVO } from '@/domain/job/value-objects/job-priority.vo'; // Corrected: JobPriority to JobPriorityVO
import {
  BackoffTypeEnum, // Corrected: BackoffType to BackoffTypeEnum
  NoRetryPolicyVO, // Corrected: NoRetryPolicy to NoRetryPolicyVO
  // RetryDelayVO, // Corrected: RetryDelay to RetryDelayVO - Not directly used, part of RetryPolicyVO logic
  RetryPolicyVO, // Corrected: RetryPolicy to RetryPolicyVO
} from '@/domain/job/value-objects/retry-policy.vo';
// import { JobStatusEnum } from '@/domain/job/value-objects/job-status.vo'; // Corrected: JobStatusType to JobStatusEnum - Not directly used
// import { JobTimestampVO } from '@/domain/job/value-objects/job-timestamp.vo'; // Corrected: JobTimestamp to JobTimestampVO - Not directly used
import { TargetAgentRoleVO } from '@/domain/job/value-objects/target-agent-role.vo'; // Corrected: TargetAgentRole to TargetAgentRoleVO
import { IJobQueue } from '@/core/ports/adapters/job-queue.interface';
import { IUseCase } from '@/application/common/ports/use-case.interface';
import { Result, ok, error } from '@/shared/result';
import { ILogger } from '@/core/common/services/i-logger.service'; // Added ILogger

import {
  CreateJobUseCaseInput,
  CreateJobUseCaseInputSchema,
  CreateJobUseCaseOutput,
} from './create-job.schema';

export class CreateJobUseCase
  implements
    IUseCase<
      CreateJobUseCaseInput,
      CreateJobUseCaseOutput,
      DomainError | ZodError | ValueError
    >
{
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly jobQueue: IJobQueue,
    private readonly logger: ILogger, // Added logger
  ) {}

  async execute(
    input: CreateJobUseCaseInput,
  ): Promise<Result<CreateJobUseCaseOutput, DomainError | ZodError | ValueError>> {
    const validationResult = CreateJobUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const nameVo = JobNameVO.create(validInput.name); // Use JobNameVO
      const targetAgentRoleVo = validInput.targetAgentRole
        ? TargetAgentRoleVO.create(validInput.targetAgentRole) // Use TargetAgentRoleVO
        : undefined;

      const priorityVo = validInput.priority !== undefined
        ? JobPriorityVO.create(validInput.priority) // Use JobPriorityVO
        : JobPriorityVO.default();

      const dependsOnJobIdsVo = validInput.dependsOnJobIds
        ? JobDependsOnVO.create(validInput.dependsOnJobIds.map(id => JobIdVO.fromString(id))) // Use JobDependsOnVO, JobIdVO
        : JobDependsOnVO.create([]);

      let retryPolicyVo: RetryPolicyVO | NoRetryPolicyVO; // Corrected type
      if (!validInput.retryPolicy || validInput.retryPolicy.maxAttempts === undefined || validInput.retryPolicy.maxAttempts <= 1) {
        retryPolicyVo = NoRetryPolicyVO.create(); // Use NoRetryPolicyVO
      } else {
        const maxAttemptsVo = AttemptCountVO.create(validInput.retryPolicy.maxAttempts); // Use AttemptCountVO
        const initialDelayMs = (validInput.retryPolicy.initialDelaySeconds || 0) * 1000;
        const backoffType = validInput.retryPolicy.backoffType || BackoffTypeEnum.FIXED; // Use BackoffTypeEnum
        const maxDelayMs = validInput.retryPolicy.maxDelaySeconds !== undefined
          ? validInput.retryPolicy.maxDelaySeconds * 1000
          : undefined;

        retryPolicyVo = RetryPolicyVO.create({ // Use RetryPolicyVO
          maxAttempts: maxAttemptsVo,
          backoffType, // Use corrected enum
          initialDelayMs,
          maxDelayMs,
        });
      }

      const jobEntity = Job.create({
        name: nameVo,
        payload: validInput.payload || {},
        targetAgentRole: targetAgentRoleVo,
        priority: priorityVo,
        dependsOn: dependsOnJobIdsVo,
        retryPolicy: retryPolicyVo,
      });

      const saveResult = await this.jobRepository.save(jobEntity);
      if (saveResult.isError()) {
        return error(new DomainError(`Failed to save job: ${saveResult.value.message}`, saveResult.value));
      }

      const enqueueResult = await this.jobQueue.add(jobEntity);
      if (enqueueResult.isError()) {
        return error(new DomainError(`Failed to enqueue job after saving: ${enqueueResult.value.message}`, enqueueResult.value));
      }

      return ok({ jobId: jobEntity.id().value() });
    } catch (e: unknown) { // Changed err: any to e: unknown
      if (e instanceof ZodError) {
        return error(e);
      }
      if (e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[CreateJobUseCase] Unexpected error: ${message}`, { error: e }); // Added logger
      return error(
        new DomainError(
          `An unexpected error occurred while preparing the job: ${message}`,
        ),
      );
    }
  }
}
