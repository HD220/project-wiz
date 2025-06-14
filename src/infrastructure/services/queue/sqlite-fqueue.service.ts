import { FQueue } from "../../../core/domain/entities/agent/interfaces/fqueue.interface";
import {
  Job,
  JobStatus,
} from "../../../core/domain/entities/agent/interfaces/job.interface";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import { eq, and, or, like, sql } from "drizzle-orm";
import { jobs } from "./schemas/jobs.schema";

export class SqliteFQueue implements FQueue {
  private db: ReturnType<typeof drizzle>;
  private sqlite: Database.Database;

  constructor(private dbPath: string = ":memory:") {
    this.sqlite = new Database(dbPath);
    this.db = drizzle(this.sqlite);

    // Apply migrations
    migrate(this.db, { migrationsFolder: "./migrations/queue" });
  }

  async addJob(job: Omit<Job, "id" | "status" | "attempts">): Promise<Job> {
    const newJob = {
      ...job,
      id: crypto.randomUUID(),
      status: "waiting" as const,
      attempts: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await this.db.insert(jobs).values(newJob);
    return newJob;
  }

  async getNextJob(agentId: string): Promise<Job | null> {
    const result = await this.db
      .select()
      .from(jobs)
      .where(and(or(eq(jobs.status, "waiting"), eq(jobs.status, "delayed"))))
      .orderBy(jobs.priority)
      .limit(1);

    return result[0] ? this.mapDbJobToJob(result[0]) : null;
  }

  async updateJobStatus(
    jobId: string,
    status: JobStatus,
    result?: any,
    data?: any
  ): Promise<void> {
    await this.db
      .update(jobs)
      .set({
        status,
        result,
        data,
        updated_at: new Date(),
        attempts:
          status === "failed" ? sql`${jobs.attempts} + 1` : jobs.attempts,
      })
      .where(eq(jobs.id, jobId));
  }

  async getJob(jobId: string): Promise<Job | null> {
    const result = await this.db
      .select()
      .from(jobs)
      .where(eq(jobs.id, jobId))
      .limit(1);

    return result[0] ? this.mapDbJobToJob(result[0]) : null;
  }

  async removeJob(jobId: string): Promise<void> {
    await this.db.delete(jobs).where(eq(jobs.id, jobId));
  }

  async listJobs(options?: {
    status?: JobStatus;
    name?: string;
    limit?: number;
  }): Promise<Job[]> {
    let query = this.db.select().from(jobs);

    if (options?.status) {
      query = query.where(eq(jobs.status, options.status));
    }

    if (options?.name) {
      query = query.where(like(jobs.name, `%${options.name}%`));
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const results = await query;
    return results.map(this.mapDbJobToJob);
  }

  private mapDbJobToJob(dbJob: any): Job {
    return {
      ...dbJob,
      status: dbJob.status as JobStatus,
      created_at: new Date(dbJob.created_at),
      updated_at: new Date(dbJob.updated_at),
    };
  }
}
