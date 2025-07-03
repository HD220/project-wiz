import {
  and,
  asc as ascDrizzle,
  desc,
  eq,
  inArray,
  isNull,
  lt,
  or,
  sql,
} from "drizzle-orm";

import { IJobRepository } from "@/core/application/ports/job-repository.interface";
import { JobPersistenceMapper } from "@/core/domain/job/job-persistence.mapper";
import {
  JobEntity,
  JobStatus,
  // JobPersistence, // No longer used directly by repo, mapper handles it
} from "@/core/domain/job/job.entity";
// Unused type imports from job.types are already commented out or removed
import { JobIdVO } from "@/core/domain/job/value-objects/job-id.vo";

// Import 'db' type for constructor injection (relative path - new group)
import { type db as DbType } from "../drizzle.client";
import * as schema from "../schema";

import {
  mapToDrizzleInput,
  mapToPersistenceData,
} from "./drizzle-job.mapper";

export class DrizzleJobRepository implements IJobRepository {
  constructor(private readonly drizzleDbInstance: typeof DbType) {}

  async save(job: JobEntity<unknown, unknown>): Promise<void> {
    const persistenceData = JobPersistenceMapper.toPersistence(job.toPersistence());
    const drizzleInput = mapToDrizzleInput(persistenceData);
    await this.drizzleDbInstance
      .insert(schema.jobsTable)
      .values(drizzleInput)
      .onConflictDoUpdate({ target: schema.jobsTable.id, set: drizzleInput });
  }

  async update(job: JobEntity<unknown, unknown>): Promise<void> {
    const persistenceData = JobPersistenceMapper.toPersistence(job.toPersistence());
    // mapToDrizzleInput now accepts JobPersistenceData from the updated mapper
    const drizzleInput = mapToDrizzleInput(persistenceData);
    await this.drizzleDbInstance
      .update(schema.jobsTable)
      .set(drizzleInput)
      .where(eq(schema.jobsTable.id, drizzleInput.id));
  }

  async findById(id: JobIdVO): Promise<JobEntity<unknown, unknown> | null> {
    const result = await this.drizzleDbInstance.query.jobsTable.findFirst({
      where: eq(schema.jobsTable.id, id.value),
    });
    if (!result) return null;
    return JobEntity.fromPersistenceData(mapToPersistenceData(result));
  }

  async findNextJobsToProcess(
    queueName: string,
    limit: number
  ): Promise<Array<JobEntity<unknown, unknown>>> {
    const now = new Date();
    const results = await this.drizzleDbInstance.query.jobsTable.findMany({
      where: and(eq(schema.jobsTable.queueName, queueName), or(eq(schema.jobsTable.status, JobStatus.WAITING), and(eq(schema.jobsTable.status, JobStatus.DELAYED), lt(schema.jobsTable.delayUntil, now)))),
      orderBy: [
        ascDrizzle(schema.jobsTable.priority),
        ascDrizzle(schema.jobsTable.createdAt),
      ],
      limit,
    });
    return results.map((jobData: typeof schema.jobsTable.$inferSelect) =>
      JobEntity.fromPersistenceData(mapToPersistenceData(jobData))
    );
  }

  async acquireLock(
    jobId: JobIdVO,
    workerId: string,
    lockUntil: Date
  ): Promise<boolean> {
    const result = await this.drizzleDbInstance
      .update(schema.jobsTable)
      .set({ workerId, lockUntil, status: JobStatus.ACTIVE })
      .where(and(eq(schema.jobsTable.id, jobId.value), or(isNull(schema.jobsTable.workerId), lt(schema.jobsTable.lockUntil, new Date()))));
    return result.changes > 0;
  }

  async extendLock(
    jobId: JobIdVO,
    workerId: string,
    lockUntil: Date
  ): Promise<void> {
    await this.drizzleDbInstance
      .update(schema.jobsTable)
      .set({ lockUntil })
      .where(and(eq(schema.jobsTable.id, jobId.value), eq(schema.jobsTable.workerId, workerId)));
  }

  async findStalledJobs(
    queueName: string,
    olderThan: Date,
    limit: number
  ): Promise<Array<JobEntity<unknown, unknown>>> {
    const results = await this.drizzleDbInstance.query.jobsTable.findMany({
      where: and(eq(schema.jobsTable.queueName, queueName), eq(schema.jobsTable.status, JobStatus.ACTIVE), lt(schema.jobsTable.lockUntil, olderThan)),
      limit,
    });
    return results.map((jobData: typeof schema.jobsTable.$inferSelect) =>
      JobEntity.fromPersistenceData(mapToPersistenceData(jobData))
    );
  }

  async remove(jobId: JobIdVO): Promise<void> {
    await this.drizzleDbInstance
      .delete(schema.jobsTable)
      .where(eq(schema.jobsTable.id, jobId.value));
  }

  async getJobsByStatus(
    queueName: string,
    statuses: JobStatus[],
    start: number = 0,
    end: number = 100,
    asc: boolean = false
  ): Promise<Array<JobEntity<unknown, unknown>>> {
    const results = await this.drizzleDbInstance.query.jobsTable.findMany({
      where: and(eq(schema.jobsTable.queueName, queueName), inArray(schema.jobsTable.status, statuses)),
      orderBy: [
        asc
          ? ascDrizzle(schema.jobsTable.createdAt)
          : desc(schema.jobsTable.createdAt),
      ],
      offset: start,
      limit: end,
    });
    return results.map((jobData: typeof schema.jobsTable.$inferSelect) =>
      JobEntity.fromPersistenceData(mapToPersistenceData(jobData))
    );
  }

  async countJobsByStatus(
    queueName: string,
    statuses?: JobStatus[]
  ): Promise<Partial<Record<JobStatus, number>>> {
    const query = this.drizzleDbInstance
      .select({
        status: schema.jobsTable.status,
        count: schema.sql`count(*)`.mapWith(Number),
      })
      .from(schema.jobsTable)
      .where(and(eq(schema.jobsTable.queueName, queueName), statuses ? inArray(schema.jobsTable.status, statuses) : undefined))
      .groupBy(schema.jobsTable.status);

    const results = await query;
    return results.reduce(
      (acc: Partial<Record<JobStatus, number>>, row: { status: JobStatus; count: number }) => {
        acc[row.status] = row.count;
        return acc;
      },
      {} as Partial<Record<JobStatus, number>>
    );
  }

  async clean(
    queueName: string,
    gracePeriodMs: number,
    limit: number,
    status?: JobStatus
  ): Promise<number> {
    const now = new Date();
    const finishedOlderThan = new Date(now.getTime() - gracePeriodMs);

    const jobsToDeleteIdsQuery = this.drizzleDbInstance
      .select({ id: schema.jobsTable.id })
      .from(schema.jobsTable)
      .where(and(
        eq(schema.jobsTable.queueName, queueName),
        status ? eq(schema.jobsTable.status, status) : or(eq(schema.jobsTable.status, JobStatus.COMPLETED), eq(schema.jobsTable.status, JobStatus.FAILED)),
        lt(schema.jobsTable.finishedOn, finishedOlderThan)
      ))
      .orderBy(ascDrizzle(schema.jobsTable.finishedOn))
      .limit(limit);

    const jobsToDelete = await jobsToDeleteIdsQuery;

    if (jobsToDelete.length === 0) {
      return 0;
    }

    const ids = jobsToDelete.map((jobEntry) => jobEntry.id);

    const result = await this.drizzleDbInstance
      .delete(schema.jobsTable)
      .where(inArray(schema.jobsTable.id, ids));

    return result.changes;
  }
}
