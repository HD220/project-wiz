import { Executable } from "../../../shared/executable";
import { Executable } from "../../../shared/executable";
import { Result, ok, error } from "../../../shared/result";
import {
  UpdateJobUseCaseInput,
  UpdateJobUseCaseOutput,
  UpdateJobInputSchema,
  ActivityContextInputSchema, // For typing context input
} from "./update-job.schema";
import { IJobRepository } from "../ports/job-repository.interface"; // Use interface
import { IJobQueue } from "../ports/job-queue.interface"; // Use interface
import { Job } from "../../domain/entities/job/job.entity";
import { JobBuilder } from "../../domain/entities/job/job-builder";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { JobTimestamp } from "../../domain/entities/job/value-objects/job-timestamp.vo"; // Import VO
import { RetryPolicy } from "../../domain/entities/job/value-objects/retry-policy.vo";
// NoRetryPolicy might not be needed here if we only update existing or use provided
import { ActivityType } from "../../domain/entities/job/value-objects/activity-type.vo";
import { ActivityContext } from "../../domain/entities/job/value-objects/activity-context.vo";
import { ActivityHistoryEntry } from "../../domain/entities/job/value-objects/activity-history-entry.vo";
import { ActivityHistory } from "../../domain/entities/job/value-objects/activity-history.vo";
import { ActivityNotes } from "../../domain/entities/job/value-objects/activity-notes.vo";
import { RelatedActivityIds } from "../../domain/entities/job/value-objects/related-activity-ids.vo";
import { DomainError } from "../../../core/common/errors";
import { z } from "zod"; // For inferring type from Zod schema

// Infer the type for contextInput from the Zod schema
type ValidatedContextInput = z.infer<typeof ActivityContextInputSchema>;
type ValidatedUpdateJobInput = z.output<typeof UpdateJobInputSchema>;


export class UpdateJobUseCase
  implements Executable<UpdateJobUseCaseInput, Result<UpdateJobUseCaseOutput>>
{
  constructor(
    private readonly jobRepository: IJobRepository, // Use interface
    private readonly jobQueue: IJobQueue // Use interface
  ) {}

  async execute(
    input: UpdateJobUseCaseInput
  ): Promise<Result<UpdateJobUseCaseOutput>> {
    try {
      const validation = UpdateJobInputSchema.safeParse(input);
      if (!validation.success) {
        return error(validation.error.flatten().fieldErrors as any); // Cast for simplicity
      }
      const validInput = validation.data;

      const jobIdVo = JobId.create(validInput.id); // Create VO from validated ID

      const existingJobResult = await this.jobRepository.load(jobIdVo);
      if (existingJobResult.isError()) {
        return error(new DomainError(`Failed to load job: ${existingJobResult.message}`));
      }
      const existingJob = existingJobResult.value;
      if (!existingJob) {
        return error(new DomainError(`Job with id ${validInput.id} not found.`));
      }

      const builder = new JobBuilder(existingJob.getProps()); // Initialize builder with existing props

      this.applyUpdatesToBuilder(builder, validInput);

      const updatedJob = builder.build();

      await this.jobRepository.save(updatedJob); // Use save for create/update

      const updatedJobProps = updatedJob.getProps();
      if (validInput.status && updatedJobProps.status.is("PENDING")) { // Use VO method
        await this.jobQueue.addJob(updatedJob);
      }

      return ok({
        id: updatedJob.id().getValue(),
        name: updatedJobProps.name.getValue(), // Added name to output
        status: updatedJobProps.status.getValue(),
        updatedAt: updatedJobProps.updatedAt ? updatedJobProps.updatedAt.getValue() : new Date(), // Ensure date
      });
    } catch (err) {
      return error(this.formatErrorMessage("update job", err));
    }
  }

  private applyUpdatesToBuilder(
    builder: JobBuilder,
    input: ValidatedUpdateJobInput // Use validated input type
  ): void {
    if (input.status) {
      builder.withStatus(JobStatus.create(input.status));
    }

    if (input.retryPolicy) {
      // RetryPolicy.create expects primitive params for retryPolicy
      builder.withRetryPolicy(RetryPolicy.create(input.retryPolicy));
    }

    // Always update the updatedAt timestamp
    builder.withUpdatedAt(JobTimestamp.now());

    if (input.activityType) {
      builder.withActivityType(ActivityType.create(input.activityType));
    }

    if (input.context) {
      builder.withContext(this.buildActivityContextFromInput(input.context as ValidatedContextInput));
    }

    if (input.parentId) {
      builder.withParentId(JobId.create(input.parentId));
    }

    if (input.relatedActivityIds && input.relatedActivityIds.length > 0) {
      builder.withRelatedActivityIds(
        RelatedActivityIds.create(input.relatedActivityIds.map(id => JobId.create(id)))
      );
    }
    // Note: This use case does not update 'name', 'payload', 'data', 'priority', 'dependsOn'
    // as they are not part of UpdateJobInputSchema. If they were, they'd be handled here.
  }

  private buildActivityContextFromInput(contextInput: ValidatedContextInput): ActivityContext {
    // Similar to CreateJobUseCase, ActivityContext.create handles primitive inputs
    const transformedHistory = contextInput.activityHistory?.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp), // Ensure timestamp is Date object
    }));

    return ActivityContext.create({
      ...contextInput,
      activityHistory: transformedHistory ? ActivityHistory.create(
        transformedHistory.map(entry =>
          ActivityHistoryEntry.create(entry.role, entry.content, entry.timestamp)
        )
      ) : ActivityHistory.create([]),
      activityNotes: contextInput.activityNotes ?
        (contextInput.activityNotes instanceof ActivityNotes ? contextInput.activityNotes : ActivityNotes.create(contextInput.activityNotes))
        : undefined, // Allow ActivityContext.create to use its default if undefined
    });
  }

  private formatErrorMessage(operation: string, err: unknown): string {
    // Consider logging the actual error internally for better diagnostics
    console.error(`Error during ${operation}:`, err);
    return `Failed to ${operation}: ${err instanceof Error ? err.message : String(err)}`;
  }
}
