// src_refactored/core/application/use-cases/job/update-job.use-case.ts
import { ZodError } from 'zod';

import { Executable } from '@/core/common/executable';
import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { Job } from '@/domain/job/job.entity';
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { MaxAttempts } from '@/domain/job/value-objects/attempt-count.vo';
import { JobId } from '@/domain/job/value-objects/job-id.vo';
import { JobName } from '@/domain/job/value-objects/job-name.vo';
import { JobPriority } from '@/domain/job/value-objects/job-priority.vo';
import { BackoffType, NoRetryPolicy, RetryPolicy } from '@/domain/job/value-objects/retry-policy.vo';
import { TargetAgentRole } from '@/domain/job/value-objects/target-agent-role.vo';
import { Result, ok, error } from '@/shared/result';

import {
  UpdateJobUseCaseInput,
  UpdateJobUseCaseInputSchema,
  UpdateJobUseCaseOutput,
} from './update-job.schema';

export class UpdateJobUseCase
  implements
    Executable<
      UpdateJobUseCaseInput,
      UpdateJobUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(private jobRepository: IJobRepository) {}

  async execute(
    input: UpdateJobUseCaseInput,
  ): Promise<Result<UpdateJobUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = UpdateJobUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const jobIdVo = JobId.fromString(validInput.jobId);

      const jobResult = await this.jobRepository.findById(jobIdVo);
      if (jobResult.isError()) {
        return error(new DomainError(`Failed to fetch job for update: ${jobResult.value.message}`, jobResult.value));
      }
      let jobEntity = jobResult.value;
      if (!jobEntity) {
        return error(new NotFoundError(`Job with ID ${validInput.jobId} not found for update.`));
      }

      let updated = false;

      if (validInput.name !== undefined) {
        const newNameVo = JobName.create(validInput.name);
        if (!jobEntity.name().equals(newNameVo)) {
          jobEntity = jobEntity.changeName(newNameVo);
          updated = true;
        }
      }

      if (validInput.payload !== undefined) { // Allows setting payload to null
        // updatePayload should handle deep comparison or always update if called
        jobEntity = jobEntity.updatePayload(validInput.payload);
        updated = true; // Assume payload update always changes state for simplicity, or add deep equals to entity
      }

      if (validInput.priority !== undefined) {
        const newPriorityVo = JobPriority.create(validInput.priority);
        if (!jobEntity.priority().equals(newPriorityVo)) {
          jobEntity = jobEntity.changePriority(newPriorityVo);
          updated = true;
        }
      }

      if (validInput.targetAgentRole !== undefined) {
        const newRoleVo = validInput.targetAgentRole
            ? TargetAgentRole.create(validInput.targetAgentRole)
            : undefined; // Allow clearing if schema permitted null and VO handled it. Schema requires string if present.
        if (!jobEntity.targetAgentRole()?.equals(newRoleVo) && (jobEntity.targetAgentRole() || newRoleVo)) {
            jobEntity = jobEntity.changeTargetAgentRole(newRoleVo);
            updated = true;
        }
      }

      if (validInput.retryPolicy !== undefined) {
        let newRetryPolicyVo: RetryPolicy;
        if (validInput.retryPolicy.maxAttempts === undefined || validInput.retryPolicy.maxAttempts <= 1) {
          newRetryPolicyVo = NoRetryPolicy.create();
        } else {
          newRetryPolicyVo = RetryPolicy.create({
            maxAttempts: MaxAttempts.create(validInput.retryPolicy.maxAttempts),
            initialDelayMs: (validInput.retryPolicy.initialDelaySeconds || 0) * 1000,
            backoffType: validInput.retryPolicy.backoffType || BackoffType.FIXED,
            maxDelayMs: validInput.retryPolicy.maxDelaySeconds !== undefined
              ? validInput.retryPolicy.maxDelaySeconds * 1000
              : undefined,
          });
        }
        if (!jobEntity.retryPolicy().equals(newRetryPolicyVo)) {
            jobEntity = jobEntity.updateRetryPolicy(newRetryPolicyVo);
            updated = true;
        }
      }

      if (updated) {
        const saveResult = await this.jobRepository.save(jobEntity);
        if (saveResult.isError()) {
          return error(new DomainError(`Failed to save updated job: ${saveResult.value.message}`, saveResult.value));
        }
      } else {
        // No actual changes were made to the job entity based on input
        // Still return ok, but with the original updatedAt timestamp
        return ok({ jobId: jobEntity.id().value(), updatedAt: jobEntity.updatedAt().toISOString() });
      }

      return ok({ jobId: jobEntity.id().value(), updatedAt: jobEntity.updatedAt().toISOString() });

    } catch (err: any) {
      if (err instanceof ZodError || err instanceof NotFoundError || err instanceof DomainError || err instanceof ValueError) {
        return error(err);
      }
      console.error(`[UpdateJobUseCase] Unexpected error for job ID ${input.jobId}:`, err);
      return error(new DomainError(`Unexpected error updating job: ${err.message || err}`));
    }
  }
}
