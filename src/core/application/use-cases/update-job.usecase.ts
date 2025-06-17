import { Executable } from "../../../shared/executable";
import { Result, ok, error, Ok } from "../../../shared/result";
import {
  UpdateJobUseCaseInput,
  UpdateJobUseCaseOutput,
  UpdateJobInputSchema,
} from "./update-job.schema";
import { JobRepository } from "../ports/job-repository.interface";
import { JobQueue } from "../ports/job-queue.interface";
import { JobBuilder } from "../../domain/entities/job/job-builder";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { RetryPolicy } from "../../domain/entities/job/value-objects/retry-policy.vo";
import { ActivityType } from "../../domain/entities/job/value-objects/activity-type.vo";
import { ActivityContext } from "../../domain/entities/job/value-objects/activity-context.vo";
import { ActivityHistoryEntry } from "../../domain/entities/job/value-objects/activity-history-entry.vo";
import { ActivityHistory } from "../../domain/entities/job/value-objects/activity-history.vo";
import { ActivityNotes } from "../../domain/entities/job/value-objects/activity-notes.vo";
import { Job } from "../../domain/entities/job/job.entity"; // Importar Job para o tipo de updatedJob
import { RelatedActivityIds } from "../../domain/entities/job/value-objects/related-activity-ids.vo";

export class UpdateJobUseCase
  implements Executable<UpdateJobUseCaseInput, Result<UpdateJobUseCaseOutput>>
{
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly jobQueue: JobQueue
  ) {}

  async execute(
    input: UpdateJobUseCaseInput
  ): Promise<Result<UpdateJobUseCaseOutput>> {
    try {
      const validation = UpdateJobInputSchema.safeParse(input);
      if (!validation.success) {
        return error(validation.error.message);
      }

      const jobId = new JobId(input.id);
      const existingJobResult = await this.jobRepository.findById(jobId);
      if (existingJobResult.isError()) {
        return error("Job not found");
      }

      const builder = new JobBuilder(existingJobResult.value);

      this.applyUpdatesToBuilder(builder, input);

      const updatedJob = builder.build();

      await this.jobRepository.update(updatedJob);

      // Atualizar fila apenas se o status mudou para PENDING
      if (input.status && updatedJob.status.value === "PENDING") {
        await this.jobQueue.addJob(updatedJob);
      }

      return ok({
        id: updatedJob.id.value,
        name: updatedJob.name,
        status: updatedJob.status.value,
        createdAt: updatedJob.createdAt,
        updatedAt: updatedJob.updatedAt || new Date(),
      });
    } catch (err) {
      return error(this.formatErrorMessage("update job", err));
    }
  }

  private applyUpdatesToBuilder(
    builder: JobBuilder,
    input: UpdateJobUseCaseInput
  ): void {
    if (input.status) {
      builder.withStatus(JobStatus.create(input.status));
    }

    if (input.retryPolicy) {
      builder.withRetryPolicy(
        new RetryPolicy({
          maxAttempts: input.retryPolicy.maxRetries,
          delayBetweenAttempts: input.retryPolicy.delay,
        })
      );
    }

    builder.withUpdatedAt(new Date());

    if (input.activityType) {
      builder.withActivityType(
        (ActivityType.create(input.activityType) as Ok<ActivityType>).value
      );
    }

    if (input.context) {
      builder.withContext(
        ActivityContext.create({
          ...input.context,
          activityHistory: ActivityHistory.create(
            input.context.activityHistory?.map((entry) =>
              ActivityHistoryEntry.create(
                entry.role,
                entry.content,
                new Date(entry.timestamp)
              )
            ) ?? []
          ),
          activityNotes: input.context.activityNotes
            ? ActivityNotes.create(input.context.activityNotes)
            : undefined,
        })
      );
    }

    if (input.parentId) {
      builder.withParentId(new JobId(input.parentId));
    }

    if (input.relatedActivityIds) {
      builder.withRelatedActivityIds(
        input.relatedActivityIds
          ? RelatedActivityIds.create(
              input.relatedActivityIds.map((id) => new JobId(id))
            )
          : undefined
      );
    }
  }
  private formatErrorMessage(operation: string, err: unknown): string {
    return `Failed to ${operation}: ${err instanceof Error ? err.message : String(err)}`;
  }
}
