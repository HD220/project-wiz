// src_refactored/core/application/use-cases/job/update-job.use-case.ts
import { ZodError } from 'zod';

import { DomainError, NotFoundError, ValueError } from '@/domain/common/errors';
import { Job } from '@/domain/job/job.entity'; // Keep Job as it's used
import { IJobRepository } from '@/domain/job/ports/job-repository.interface';
import { AttemptCountVO } from '@/domain/job/value-objects/attempt-count.vo';
import { JobIdVO } from '@/domain/job/value-objects/job-id.vo';
import { JobNameVO } from '@/domain/job/value-objects/job-name.vo';
import { JobPriorityVO } from '@/domain/job/value-objects/job-priority.vo';
import { BackoffTypeEnum, NoRetryPolicyVO, RetryPolicyVO } from '@/domain/job/value-objects/retry-policy.vo';
import { TargetAgentRoleVO } from '@/domain/job/value-objects/target-agent-role.vo';
import { IUseCase } from '@/application/common/ports/use-case.interface';
import { Result, ok, error } from '@/shared/result';
import { ILogger } from '@/core/common/services/i-logger.service'; // Added ILogger

import {
  UpdateJobUseCaseInput,
  UpdateJobUseCaseInputSchema,
  UpdateJobUseCaseOutput,
} from './update-job.schema';

export class UpdateJobUseCase
  implements
    IUseCase<
      UpdateJobUseCaseInput,
      UpdateJobUseCaseOutput,
      DomainError | ZodError | ValueError | NotFoundError
    >
{
  constructor(
    private readonly jobRepository: IJobRepository,
    private readonly logger: ILogger, // Added logger
  ) {}

  async execute(
    input: UpdateJobUseCaseInput,
  ): Promise<Result<UpdateJobUseCaseOutput, DomainError | ZodError | ValueError | NotFoundError>> {
    const validationResult = UpdateJobUseCaseInputSchema.safeParse(input);
    if (!validationResult.success) {
      return error(validationResult.error);
    }
    const validInput = validationResult.data;

    try {
      const jobIdVo = JobIdVO.fromString(validInput.jobId); // Use JobIdVO

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
        const newNameVo = JobNameVO.create(validInput.name); // Use JobNameVO
        if (!jobEntity.name().equals(newNameVo)) {
          jobEntity = jobEntity.changeName(newNameVo);
          updated = true;
        }
      }

      if (Object.prototype.hasOwnProperty.call(validInput, 'payload')) { // Check if payload was explicitly passed (even if null)
        jobEntity = jobEntity.updatePayload(validInput.payload); // updatePayload should handle null correctly
        updated = true;
      }

      if (validInput.priority !== undefined) {
        const newPriorityVo = JobPriorityVO.create(validInput.priority); // Use JobPriorityVO
        if (!jobEntity.priority().equals(newPriorityVo)) {
          jobEntity = jobEntity.changePriority(newPriorityVo);
          updated = true;
        }
      }

      if (validInput.targetAgentRole !== undefined) {
        const newRoleVo = validInput.targetAgentRole
            ? TargetAgentRoleVO.create(validInput.targetAgentRole) // Use TargetAgentRoleVO
            : undefined;
        if (!jobEntity.targetAgentRole()?.equals(newRoleVo) && (jobEntity.targetAgentRole() || newRoleVo)) {
            jobEntity = jobEntity.changeTargetAgentRole(newRoleVo);
            updated = true;
        }
      }

      if (validInput.retryPolicy !== undefined) {
        let newRetryPolicyVo: RetryPolicyVO | NoRetryPolicyVO; // Corrected type
        if (validInput.retryPolicy.maxAttempts === undefined || validInput.retryPolicy.maxAttempts <= 1) {
          newRetryPolicyVo = NoRetryPolicyVO.create(); // Use NoRetryPolicyVO
        } else {
          newRetryPolicyVo = RetryPolicyVO.create({ // Use RetryPolicyVO
            maxAttempts: AttemptCountVO.create(validInput.retryPolicy.maxAttempts), // Use AttemptCountVO
            initialDelayMs: (validInput.retryPolicy.initialDelaySeconds || 0) * 1000,
            backoffType: validInput.retryPolicy.backoffType || BackoffTypeEnum.FIXED, // Use BackoffTypeEnum
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
        return ok({ jobId: jobEntity.id().value(), updatedAt: jobEntity.updatedAt().toISOString() });
      }

      return ok({ jobId: jobEntity.id().value(), updatedAt: jobEntity.updatedAt().toISOString() });
    } catch (e: unknown) { // Changed err: any to e: unknown
      if (e instanceof ZodError || e instanceof NotFoundError || e instanceof DomainError || e instanceof ValueError) {
        return error(e);
      }
      const message = e instanceof Error ? e.message : String(e);
      this.logger.error(`[UpdateJobUseCase] Unexpected error for job ID ${input.jobId}: ${message}`, { error: e }); // Added logger
      return error(new DomainError(`Unexpected error updating job: ${message}`));
    }
  }
}
