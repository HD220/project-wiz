import { Executable } from "../../../shared/executable";
import { Result, ok, error, Ok } from "../../../shared/result";
import {
  CreateJobUseCaseInput,
  CreateJobUseCaseOutput,
  CreateJobInputSchema,
} from "./create-job.schema";
import { JobRepository } from "../ports/job-repository.interface";
import { JobQueue } from "../ports/job-queue.interface";
import { JobBuilder } from "../../domain/entities/job/job-builder"; // Corrigido o caminho do import
import { Job } from "@/core/domain/entities/job/job.entity";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { RetryPolicy } from "../../domain/entities/job/value-objects/retry-policy.vo";
import { ActivityType } from "../../domain/entities/job/value-objects/activity-type.vo";
import { ActivityContext } from "../../domain/entities/job/value-objects/activity-context.vo";
import { ActivityHistoryEntry } from "../../domain/entities/job/value-objects/activity-history-entry.vo";
import { ActivityHistory } from "../../domain/entities/job/value-objects/activity-history.vo";
import { ActivityNotes } from "../../domain/entities/job/value-objects/activity-notes.vo";
import { RelatedActivityIds } from "../../domain/entities/job/value-objects/related-activity-ids.vo";

export class CreateJobUseCase
  implements Executable<CreateJobUseCaseInput, Result<CreateJobUseCaseOutput>>
{
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly jobQueue: JobQueue
  ) {}

  async execute(
    input: CreateJobUseCaseInput
  ): Promise<Result<CreateJobUseCaseOutput>> {
    try {
      const validation = CreateJobInputSchema.safeParse(input);
      if (!validation.success) {
        return error(validation.error.message);
      }

      const job = this.buildJobFromInput(input);

      await this.jobRepository.create(job);
      await this.jobQueue.addJob(job);

      return ok({
        id: job.id.value,
        name: job.name,
        status: job.status.value, // Corrigido para acessar o valor do JobStatus
        createdAt: job.createdAt,
      });
    } catch (err) {
      return error(this.formatErrorMessage("create job", err));
    }
  }
  private buildJobFromInput(input: CreateJobUseCaseInput): Job {
    const jobId = new JobId(Date.now().toString());
    const jobStatus = JobStatus.createInitial();

    const retryPolicyInput = input.retryPolicy
      ? {
          maxAttempts: input.retryPolicy.maxRetries,
          delayBetweenAttempts: input.retryPolicy.delay,
        }
      : undefined;

    const retryPolicy = new RetryPolicy(retryPolicyInput);

    return new JobBuilder()
      .withId(jobId)
      .withName(input.name)
      .withStatus(jobStatus)
      .withCreatedAt(new Date())
      .withPayload(input.payload ?? {})
      .withRetryPolicy(retryPolicy)
      .withActivityType(
        input.activityType
          ? (ActivityType.create(input.activityType) as Ok<ActivityType>).value
          : undefined
      )
      .withContext(
        input.context
          ? ActivityContext.create({
              ...input.context,
              activityHistory: ActivityHistory.create(
                input.context.activityHistory.map((entry) =>
                  ActivityHistoryEntry.create(
                    entry.role,
                    entry.content,
                    entry.timestamp
                  )
                )
              ),
              activityNotes: input.context.activityNotes
                ? ActivityNotes.create(input.context.activityNotes)
                : undefined,
            })
          : undefined
      )
      .withParentId(input.parentId ? new JobId(input.parentId) : undefined)
      .withRelatedActivityIds(
        input.relatedActivityIds
          ? RelatedActivityIds.create(
              input.relatedActivityIds.map((id) => new JobId(id))
            )
          : undefined
      )
      .build();
  }

  private formatErrorMessage(operation: string, err: unknown): string {
    return `Failed to ${operation}: ${err instanceof Error ? err.message : String(err)}`;
  }
}
