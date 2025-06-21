import { Executable } from "../../../shared/executable";
import { Executable } from "../../../shared/executable";
import { Result, ok, error } from "../../../shared/result";
import {
  CreateJobUseCaseInput,
  CreateJobUseCaseOutput,
  CreateJobInputSchema,
  ActivityContextInputSchema, // For typing the input to buildActivityContext
} from "./create-job.schema";
import { IJobRepository } from "../ports/job-repository.interface"; // Use interface
import { IJobQueue } from "../ports/job-queue.interface"; // Use interface
import { Job } from "../../domain/entities/job/job.entity"; // Import Job entity
import { JobBuilder } from "../../domain/entities/job/job-builder";
import { JobId } from "../../domain/entities/job/value-objects/job-id.vo";
import { JobName } from "../../domain/entities/job/value-objects/job-name.vo"; // Import VO
import { JobStatus } from "../../domain/entities/job/value-objects/job-status.vo";
import { JobTimestamp } from "../../domain/entities/job/value-objects/job-timestamp.vo"; // Import VO
import { AttemptCount } from "../../domain/entities/job/value-objects/attempt-count.vo"; // Import VO
import { RetryPolicy } from "../../domain/entities/job/value-objects/retry-policy.vo";
import { NoRetryPolicy } from "../../domain/entities/job/value-objects/no-retry-policy"; // Import VO
import { ActivityType } from "../../domain/entities/job/value-objects/activity-type.vo";
import { ActivityContext } from "../../domain/entities/job/value-objects/activity-context.vo";
import { ActivityHistoryEntry } from "../../domain/entities/job/value-objects/activity-history-entry.vo";
import { ActivityHistory } from "../../domain/entities/job/value-objects/activity-history.vo";
import { ActivityNotes } from "../../domain/entities/job/value-objects/activity-notes.vo";
import { RelatedActivityIds } from "../../domain/entities/job/value-objects/related-activity-ids.vo";
import { z } from "zod"; // For inferring type from Zod schema

// Infer the type for contextInput from the Zod schema
type ValidatedContextInput = z.infer<typeof ActivityContextInputSchema>;


export class CreateJobUseCase
  implements Executable<CreateJobUseCaseInput, Result<CreateJobUseCaseOutput>>
{
  constructor(
    private readonly jobRepository: IJobRepository, // Use interface
    private readonly jobQueue: IJobQueue // Use interface
  ) {}

  async execute(
    input: CreateJobUseCaseInput
  ): Promise<Result<CreateJobUseCaseOutput>> {
    try {
      const validation = CreateJobInputSchema.safeParse(input);
      if (!validation.success) {
        // Log error or return a more specific error type
        return error(validation.error.flatten().fieldErrors);
      }
      const validInput = validation.data; // Use validated data

      const job = this.buildJobFromInput(validInput);

      await this.jobRepository.save(job); // Changed to save
      await this.jobQueue.addJob(job);

      const jobProps = job.getProps();
      return ok({
        id: job.id().getValue(), // Use id() and getValue()
        name: jobProps.name.getValue(),
        status: jobProps.status.getValue(),
        createdAt: jobProps.createdAt.getValue(),
      });
    } catch (err) {
      return error(this.formatErrorMessage("create job", err));
    }
  }

  // Parameter type changed to use validated data type
  private buildJobFromInput(input: z.output<typeof CreateJobInputSchema>): Job {
    // JobId.create() should generate a UUID if no argument is passed, or accept one.
    // Using Date.now() is not a good UUID. For now, let's assume create() handles it.
    // If it needs a pre-generated UUID, import { v4 as uuidv4 } from 'uuid'; and use uuidv4().
    const jobId = JobId.create(Date.now().toString()); // Placeholder, ideally JobId.create() generates UUID

    const jobStatus = JobStatus.createInitial(); // OK

    const retryPolicy = input.retryPolicy
      ? RetryPolicy.create(input.retryPolicy) // RetryPolicy.create expects primitive params
      : NoRetryPolicy.create();

    const builder = new JobBuilder()
      .withId(jobId)
      .withName(input.name) // JobBuilder.withName creates JobName VO
      .withStatus(jobStatus)
      // JobBuilder.withCreatedAt and withAttempts create VOs from primitives or use defaults
      // These are now set by JobBuilder constructor if not explicitly called with VOs.
      // We can rely on defaults or set them explicitly if input provides them.
      // JobBuilder constructor defaults createdAt to JobTimestamp.now() and attempts to AttemptCount.create(0)
      // .withCreatedAt(JobTimestamp.now()) // Example if needed, but builder defaults it
      // .withAttempts(AttemptCount.create(0)) // Example if needed, but builder defaults it
      .withPayload(input.payload ?? {})
      .withRetryPolicy(retryPolicy);

    if (input.activityType) {
      builder.withActivityType(ActivityType.create(input.activityType));
    }
    if (input.context) {
      // Type assertion might be needed if Zod inferred type for input.context is not exactly ValidatedContextInput
      builder.withContext(this.buildActivityContext(input.context as ValidatedContextInput));
    }
    if (input.parentId) {
      builder.withParentId(JobId.create(input.parentId));
    }
    if (input.relatedActivityIds && input.relatedActivityIds.length > 0) {
      builder.withRelatedActivityIds(
        RelatedActivityIds.create(input.relatedActivityIds.map(id => JobId.create(id)))
      );
    }

    // Optional fields like priority, dependsOn are not in CreateJobInputSchema by default
    // If they were, they would be set here too, e.g.:
    // if (input.priority) builder.withPriority(JobPriority.create(input.priority));

    return builder.build();
  }

  private buildActivityContext(contextInput: ValidatedContextInput): ActivityContext {
    // ActivityContext.create has been refactored to accept ActivityContextPropsInput (primitives)
    // and internally creates the necessary VOs including ActivityHistory and ActivityNotes.
    // The ActivityContextPropsInput type definition already matches the structure of contextInput.
    // Ensure that timestamp within activityHistory entries is handled (string/number from input to Date for VO).

    const transformedHistory = contextInput.activityHistory?.map(entry => ({
      ...entry,
      timestamp: new Date(entry.timestamp), // Ensure timestamp is Date object for ActivityHistoryEntry.create
    }));

    return ActivityContext.create({
      ...contextInput,
      activityHistory: transformedHistory ? ActivityHistory.create(
        transformedHistory.map(entry =>
          ActivityHistoryEntry.create(entry.role, entry.content, entry.timestamp)
        )
      ) : ActivityHistory.create([]), // Ensure activityHistory is always an ActivityHistory instance
      // activityNotes is already optional in ActivityContextPropsInput and create handles it
      // If activityNotes in contextInput is string[], ActivityContext.create will handle it.
      // If it's already an ActivityNotes VO, ActivityContext.create will use it.
      activityNotes: contextInput.activityNotes ?
        (contextInput.activityNotes instanceof ActivityNotes ? contextInput.activityNotes : ActivityNotes.create(contextInput.activityNotes))
        : ActivityNotes.create([]),
    });
  }

  private formatErrorMessage(operation: string, err: unknown): string {
    return `Failed to ${operation}: ${err instanceof Error ? err.message : String(err)}`;
  }
}
