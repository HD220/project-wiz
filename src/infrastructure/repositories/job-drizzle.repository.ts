import { Job } from "../../core/domain/entities/job/job.entity";
import { JobId } from "../../core/domain/entities/job/value-objects/job-id.vo";
import { ActivityType } from "../../core/domain/entities/job/value-objects/activity-type.vo";
import { ActivityContext } from "../../core/domain/entities/job/value-objects/activity-context.vo";
import {
  JobStatus,
  JobStatusType,
} from "../../core/domain/entities/job/value-objects/job-status.vo";
import { RetryPolicy } from "../../core/domain/entities/job/value-objects/retry-policy.vo";
import { JobRepository } from "../../core/application/ports/job-repository.interface";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq, inArray, sql } from "drizzle-orm";
import { jobs } from "../services/drizzle/schemas/jobs";
import { Result, ok, error, Ok } from "../../shared/result";
import { JobDependsOn } from "../../core/domain/entities/job/value-objects/job-depends-on.vo";
import { JobPriority } from "../../core/domain/entities/job/value-objects/job-priority.vo";

class JobNotFoundError extends Error {
  constructor(id: string) {
    super(`Job with id ${id} not found`);
    this.name = "JobNotFoundError";
  }
}

export class JobRepositoryDrizzle implements JobRepository {
  constructor(
    private readonly db: BetterSQLite3Database<Record<string, never>>
  ) {}

  private mapJobDataToEntity(jobData: typeof jobs.$inferSelect): Job {
    return new Job({
      id: new JobId(jobData.id),
      name: jobData.name,
      status: JobStatus.create(jobData.status as JobStatusType),
      attempts: jobData.attempts,
      retryPolicy: this.mapRetryPolicy(jobData),
      createdAt: new Date(jobData.created_at),
      updatedAt: this.mapUpdatedAt(jobData),
      payload: this.parseJsonField(jobData.payload),
      metadata: this.parseJsonField(jobData.data),
      result: this.parseJsonField(jobData.result),
      priority: this.mapPriority(jobData),
      dependsOn: this.mapJobDependsOn(jobData),
      activityType: this.mapActivityType(jobData),
      context: this.mapActivityContext(jobData),
      parentId: jobData.parent_id ? new JobId(jobData.parent_id) : undefined,
      relatedActivityIds: this.mapRelatedActivityIds(jobData),
    });
  }

  private mapRetryPolicy(
    jobData: typeof jobs.$inferSelect
  ): RetryPolicy | undefined {
    if (jobData.max_attempts === null || jobData.retry_delay === null) {
      return undefined;
    }
    return new RetryPolicy({
      maxAttempts: jobData.max_attempts,
      delayBetweenAttempts: jobData.retry_delay,
    });
  }

  private mapUpdatedAt(jobData: typeof jobs.$inferSelect): Date | undefined {
    return jobData.updated_at ? new Date(jobData.updated_at) : undefined;
  }

  private parseJsonField(
    json: string | null
  ): Record<string, unknown> | undefined {
    return json ? JSON.parse(json) : undefined;
  }

  private mapPriority(
    jobData: typeof jobs.$inferSelect
  ): JobPriority | undefined {
    return jobData.priority
      ? (JobPriority.create(jobData.priority) as Ok<JobPriority>).value
      : undefined;
  }

  private mapJobDependsOn(
    jobData: typeof jobs.$inferSelect
  ): JobDependsOn | undefined {
    return jobData.depends_on
      ? new JobDependsOn(
          JSON.parse(jobData.depends_on).map((id: string) => new JobId(id))
        )
      : undefined;
  }

  private mapActivityType(
    jobData: typeof jobs.$inferSelect
  ): ActivityType | undefined {
    return jobData.activity_type
      ? (ActivityType.create(jobData.activity_type) as Ok<ActivityType>).value
      : undefined;
  }

  private mapActivityContext(
    jobData: typeof jobs.$inferSelect
  ): ActivityContext | undefined {
    return jobData.activity_context
      ? ActivityContext.create(
          jobData.activity_context as ActivityContext["value"]
        )
      : undefined;
  }

  private mapRelatedActivityIds(
    jobData: typeof jobs.$inferSelect
  ): RelatedActivityIds | undefined {
    return jobData.related_activity_ids
      ? RelatedActivityIds.create(
          (jobData.related_activity_ids as string[]).map(
            (id: string) => new JobId(id)
          )
        )
      : undefined;
  }

  async create(job: Job): Promise<Result<Job>> {
    try {
      await this.db.insert(jobs).values({
        id: job.id.value,
        name: job.name,
        status: job.status.value as JobStatusType,
        attempts: job.attempts,
        max_attempts: job.retryPolicy?.value.maxAttempts || 3,
        retry_delay: job.retryPolicy?.value.delayBetweenAttempts || 1000,
        payload: job.payload ? JSON.stringify(job.payload) : null,
        data: job.metadata ? JSON.stringify(job.metadata) : null,
        result: job.result ? JSON.stringify(job.result) : null,
        priority: job.priority?.value ?? 0,
        depends_on: job.dependsOn?.hasDependencies()
          ? JSON.stringify(job.dependsOn.value.map((id) => id.value))
          : null,
        created_at: job.createdAt.toISOString(),
        updated_at: job.updatedAt?.toISOString(),
        activity_type: job.activityType?.value,
        activity_context: job.context?.value,
        parent_id: job.parentId?.value,
        related_activity_ids: job.relatedActivityIds?.value?.map(
          (id) => id.value
        ),
      });
      return ok(job);
    } catch (err) {
      return error(
        `Failed to create job: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async findById(id: JobId): Promise<Result<Job>> {
    try {
      const [jobData] = await this.db
        .select()
        .from(jobs)
        .where(eq(jobs.id, id.value));

      if (!jobData) {
        return error(new JobNotFoundError(id.value).message);
      }

      const job = this.mapJobDataToEntity(jobData);

      return ok(job);
    } catch (err) {
      return error(this.formatErrorMessage("find job", err));
    }
  }

  async update(job: Job): Promise<Result<Job>> {
    try {
      const result = await this.db
        .update(jobs)
        .set({
          name: job.name,
          status: job.status.value as JobStatusType,
          attempts: job.attempts,
          max_attempts: job.retryPolicy?.value.maxAttempts,
          retry_delay: job.retryPolicy?.value.delayBetweenAttempts,
          payload: job.payload ? JSON.stringify(job.payload) : null,
          data: job.metadata ? JSON.stringify(job.metadata) : null,
          result: job.result ? JSON.stringify(job.result) : null,
          priority: job.priority?.value ?? 0,
          depends_on: job.dependsOn?.hasDependencies()
            ? JSON.stringify(job.dependsOn.value.map((id) => id.value))
            : null,
          updated_at: new Date().toISOString(),
          activity_type: job.activityType?.value,
          activity_context: job.context?.value,
          parent_id: job.parentId?.value,
          related_activity_ids: job.relatedActivityIds?.value?.map(
            (id) => id.value
          ),
        })
        .where(eq(jobs.id, job.id.value));

      if (result.changes === 0) {
        return error(new JobNotFoundError(job.id.value).message);
      }

      return ok(job);
    } catch (err) {
      return error(this.formatErrorMessage("update job", err));
    }
  }

  async delete(id: JobId): Promise<Result<void>> {
    try {
      const result = await this.db.delete(jobs).where(eq(jobs.id, id.value));

      if (result.changes === 0) {
        return error(new JobNotFoundError(id.value).message);
      }

      return ok(undefined);
    } catch (err) {
      return error(this.formatErrorMessage("delete job", err));
    }
  }

  async list(): Promise<Result<Job[]>> {
    try {
      const jobsData = await this.db.select().from(jobs);

      const jobsList = jobsData.map(this.mapJobDataToEntity);

      return ok(jobsList);
    } catch (err) {
      return error(this.formatErrorMessage("list jobs", err));
    }
  }
  async findByIds(ids: JobId[]): Promise<Result<Job[]>> {
    try {
      const jobIds = ids.map((id) => id.value);
      const jobsData = await this.db
        .select()
        .from(jobs)
        .where(inArray(jobs.id, jobIds));

      const jobsList = jobsData.map(this.mapJobDataToEntity);

      return ok(jobsList);
    } catch (err) {
      return error(this.formatErrorMessage("find jobs by ids", err));
    }
  }

  async findDependentJobs(jobId: JobId): Promise<Result<Job[]>> {
    try {
      const jobsData = await this.db
        .select()
        .from(jobs)
        .where(
          sql`json_extract(${jobs.depends_on}, '$') LIKE '%"${jobId.value}"%'`
        );

      const jobsList = jobsData.map(this.mapJobDataToEntity);

      return ok(jobsList);
    } catch (err) {
      return error(this.formatErrorMessage("find dependent jobs", err));
    }
  }
  private formatErrorMessage(operation: string, err: unknown): string {
    return `Failed to ${operation}: ${err instanceof Error ? err.message : String(err)}`;
  }
}
