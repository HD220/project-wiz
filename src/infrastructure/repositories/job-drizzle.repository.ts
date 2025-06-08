import { Job } from "../../core/domain/entities/job/job.entity";
import { JobId } from "../../core/domain/entities/job/value-objects/job-id.vo";
import {
  JobStatus,
  JobStatusType,
} from "../../core/domain/entities/job/value-objects/job-status.vo";
import { RetryPolicy } from "../../core/domain/entities/job/value-objects/retry-policy.vo";
import { JobRepository } from "../../core/application/ports/job-repository.interface";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { jobs } from "../services/drizzle/schemas/jobs";
import { Result, ok, error } from "../../shared/result";

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

  async create(job: Job): Promise<Result<Job>> {
    try {
      await this.db.insert(jobs).values({
        id: job.id.value,
        name: job.name,
        status: job.status.value,
        attempts: job.attempts,
        max_attempts: job.retryPolicy?.value.maxAttempts || 3,
        retry_delay: job.retryPolicy?.value.delayBetweenAttempts || 1000,
        payload: job.payload ? JSON.stringify(job.payload) : null,
        data: job.metadata ? JSON.stringify(job.metadata) : null,
        created_at: job.createdAt.toISOString(),
        updated_at: job.updatedAt?.toISOString(),
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

      const job = new Job({
        id,
        name: jobData.name,
        status: new JobStatus(jobData.status as JobStatusType),
        attempts: jobData.attempts,
        retryPolicy: new RetryPolicy({
          maxAttempts: jobData.max_attempts,
          delayBetweenAttempts: jobData.retry_delay,
        }),
        createdAt: new Date(jobData.created_at),
        updatedAt: jobData.updated_at
          ? new Date(jobData.updated_at)
          : undefined,
        payload: jobData.payload ? JSON.parse(jobData.payload) : undefined,
        metadata: jobData.data ? JSON.parse(jobData.data) : undefined,
      });

      return ok(job);
    } catch (err) {
      return error(
        `Failed to find job: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async update(job: Job): Promise<Result<Job>> {
    try {
      const result = await this.db
        .update(jobs)
        .set({
          name: job.name,
          status: job.status.value,
          attempts: job.attempts,
          max_attempts: job.retryPolicy?.value.maxAttempts,
          retry_delay: job.retryPolicy?.value.delayBetweenAttempts,
          payload: job.payload ? JSON.stringify(job.payload) : null,
          data: job.metadata ? JSON.stringify(job.metadata) : null,
          updated_at: new Date().toISOString(),
        })
        .where(eq(jobs.id, job.id.value));

      if (result.changes === 0) {
        return error(new JobNotFoundError(job.id.value).message);
      }

      return ok(job);
    } catch (err) {
      return error(
        `Failed to update job: ${err instanceof Error ? err.message : String(err)}`
      );
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
      return error(
        `Failed to delete job: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  async list(): Promise<Result<Job[]>> {
    try {
      const jobsData = await this.db.select().from(jobs);

      const jobsList = jobsData.map((jobData) => {
        return new Job({
          id: new JobId(jobData.id),
          name: jobData.name,
          status: new JobStatus(jobData.status as JobStatusType),
          attempts: jobData.attempts,
          retryPolicy: new RetryPolicy({
            maxAttempts: jobData.max_attempts,
            delayBetweenAttempts: jobData.retry_delay,
          }),
          createdAt: new Date(jobData.created_at),
          updatedAt: jobData.updated_at
            ? new Date(jobData.updated_at)
            : undefined,
          payload: jobData.payload ? JSON.parse(jobData.payload) : undefined,
          metadata: jobData.data ? JSON.parse(jobData.data) : undefined,
        });
      });

      return ok(jobsList);
    } catch (err) {
      return error(
        `Failed to list jobs: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
