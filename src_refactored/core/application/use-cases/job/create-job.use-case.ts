// src_refactored/core/application/use-cases/job/create-job.use-case.ts
import { ZodError } from 'zod';

import { IUseCase } from '@/application/common/ports/use-case.interface'; // Standardized
import { DomainError, ValueError } from '@/domain/common/errors';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { MaxAttempts } from '@/domain/job/value-objects/attempt-count.vo';
import { JobDependsOn } from '@/domain/job/value-objects/job-depends-on.vo';
import { JobId } from '@/domain/job/value-objects/job-id.vo';
import { JobName } from '@/domain/job/value-objects/job-name.vo';
import { JobPriority } from '@/domain/job/value-objects/job-priority.vo';
import {
  BackoffType,
  NoRetryPolicy,
  RetryDelay,
  RetryPolicy,
} from '@/domain/job/value-objects/retry-policy.vo';
import { JobStatusType } from '@/domain/job/value-objects/job-status.vo';
import { JobTimestamp } from '@/domain/job/value-objects/job-timestamp.vo';
import { TargetAgentRole } from '@/domain/job/value-objects/target-agent-role.vo';
import { IJobQueue } from '@/core/ports/adapters/job-queue.interface'; // This path might still be an issue
import { Result, ok, error } from '@/shared/result';

import {
  CreateJobUseCaseInput,
  CreateJobUseCaseInputSchema,
  CreateJobUseCaseOutput,
} from './create-job.schema';

export class CreateJobUseCase
  implements
    IUseCase< // Standardized
      CreateJobUseCaseInput,
      CreateJobUseCaseOutput,
      DomainError | ZodError | ValueError
    >
{
  private jobRepository: IJobRepository;
  private jobQueue: IJobQueue;

  constructor(
    jobRepository: IJobRepository,
    jobQueue: IJobQueue,
  ) {
    this.jobRepository = jobRepository;
    this.jobQueue = jobQueue;
  }

  async execute(
    input: CreateJobUseCaseInput,
  ): Promise<Result<CreateJobUseCaseOutput, DomainError | ZodError | ValueError>> {
    const validationResult = CreateJobUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const nameVo = JobName.create(validInput.name);
      const targetAgentRoleVo = validInput.targetAgentRole
        ? TargetAgentRole.create(validInput.targetAgentRole)
        : undefined;

      const priorityVo = validInput.priority !== undefined
        ? JobPriority.create(validInput.priority)
        : JobPriority.default();

      const dependsOnJobIdsVo = validInput.dependsOnJobIds
        ? JobDependsOn.create(validInput.dependsOnJobIds.map(id => JobId.fromString(id)))
        : JobDependsOn.create([]);

      let retryPolicyVo: RetryPolicy;
      if (!validInput.retryPolicy || validInput.retryPolicy.maxAttempts === undefined || validInput.retryPolicy.maxAttempts <= 1) {
        retryPolicyVo = NoRetryPolicy.create();
      } else {
        const maxAttemptsVo = MaxAttempts.create(validInput.retryPolicy.maxAttempts);
        const initialDelayMs = (validInput.retryPolicy.initialDelaySeconds || 0) * 1000;
        const backoffType = validInput.retryPolicy.backoffType || BackoffType.FIXED;
        const maxDelayMs = validInput.retryPolicy.maxDelaySeconds !== undefined
          ? validInput.retryPolicy.maxDelaySeconds * 1000
          : undefined;

        retryPolicyVo = RetryPolicy.create({
          maxAttempts: maxAttemptsVo,
          backoffType: backoffType,
          initialDelayMs: initialDelayMs,
          maxDelayMs: maxDelayMs,
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

    } catch (err: any) {
      if (err instanceof ZodError) {
        return error(err);
      }
      if (err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error('[CreateJobUseCase] Unexpected error:', err);
      return error(
        new DomainError(
          `An unexpected error occurred while preparing the job: ${err.message || err}`,
        ),
      );
    }
  }
}
