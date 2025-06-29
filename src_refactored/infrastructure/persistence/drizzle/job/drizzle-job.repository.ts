// src_refactored/infrastructure/persistence/drizzle/job/drizzle-job.repository.ts
import { and, asc as ascDrizzle, desc, eq, inArray, isNull, lt, or } from 'drizzle-orm';

import { IJobRepository } from '@/core/application/ports/job-repository.interface';
import { JobEntity, JobStatus } from '@/core/domain/job/job.entity';
import type { JobPersistenceLoadProps } from '@/core/domain/job/job.entity'; // Import type for casting
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';

// Import 'db' from drizzle.client for the constructor type, but instance will be passed.
import type { db as DbType } from '../drizzle.client';
import * as schema from '../schema';
// No need to import JobSelect if we use Parameters<typeof JobEntity.fromPersistence>[0]

export class DrizzleJobRepository implements IJobRepository {
  constructor(private readonly drizzleDbInstance: typeof DbType) {} // Renamed db to drizzleDbInstance

  async save(job: JobEntity<unknown, unknown>): Promise<void> {
    const data = job.toPersistence();
        await this.drizzleDbInstance.insert(schema.jobsTable).values(data).onConflictDoUpdate({ target: schema.jobsTable.id, set: data });
  }

  async update(job: JobEntity<unknown, unknown>): Promise<void> {
    const data = job.toPersistence();
    await this.drizzleDbInstance.update(schema.jobsTable).set(data).where(eq(schema.jobsTable.id, data.id));
  }

  async findById(id: JobIdVO): Promise<JobEntity<unknown, unknown> | null> {
    const result = await this.drizzleDbInstance.query.jobsTable.findFirst({ where: eq(schema.jobsTable.id, id.value) });
    if (!result) return null;
    return JobEntity.fromPersistence(result as JobPersistenceLoadProps<unknown, unknown>);
  }

  async findNextJobsToProcess(queueName: string, limit: number): Promise<Array<JobEntity<unknown, unknown>>> {
    const now = new Date();
    const results = await this.db.query.jobsTable.findMany({
      where: and(
        eq(schema.jobsTable.queueName, queueName),
        // Job is either WAITING or it was DELAYED and its time has come
        or(
          eq(schema.jobsTable.status, JobStatus.WAITING),
          and(
            eq(schema.jobsTable.status, JobStatus.DELAYED),
            lt(schema.jobsTable.delayUntil, now)
          )
        )
      ),
      orderBy: [ascDrizzle(schema.jobsTable.priority), ascDrizzle(schema.jobsTable.createdAt)],
      limit,
    });
    return results.map(jobData => JobEntity.fromPersistence(jobData as JobPersistenceLoadProps<unknown, unknown>));
  }

  async acquireLock(jobId: JobIdVO, workerId: string, lockUntil: Date): Promise<boolean> {
    const result = await this.drizzleDbInstance.update(schema.jobsTable)
      .set({ workerId, lockUntil, status: JobStatus.ACTIVE })
      .where(and(eq(schema.jobsTable.id, jobId.value), or(isNull(schema.jobsTable.workerId), lt(schema.jobsTable.lockUntil, new Date()))))
    return result.changes > 0;
  }

  async extendLock(jobId: JobIdVO, workerId: string, lockUntil: Date): Promise<void> {
    await this.drizzleDbInstance.update(schema.jobsTable)
      .set({ lockUntil })
      .where(and(eq(schema.jobsTable.id, jobId.value), eq(schema.jobsTable.workerId, workerId)));
  }

  async findStalledJobs(queueName: string, olderThan: Date, limit: number): Promise<Array<JobEntity<unknown, unknown>>> {
    const results = await this.drizzleDbInstance.query.jobsTable.findMany({
      where: and(
        eq(schema.jobsTable.queueName, queueName),
        eq(schema.jobsTable.status, JobStatus.ACTIVE),
        lt(schema.jobsTable.lockUntil, olderThan)
      ),
      limit,
    });
    return results.map(jobData => JobEntity.fromPersistence(jobData as JobPersistenceLoadProps<unknown, unknown>));
  }

  async remove(jobId: JobIdVO): Promise<void> {
    await this.drizzleDbInstance.delete(schema.jobsTable).where(eq(schema.jobsTable.id, jobId.value));
  }

  async getJobsByStatus(
    queueName: string,
    statuses: JobStatus[],
    start: number = 0,
    end: number = 100,
    asc: boolean = false,
  ): Promise<Array<JobEntity<unknown, unknown>>> {
    // Parameter 'end' is used as 'count' or 'limit' based on typical usage patterns and UI calls.
    const results = await this.db.query.jobsTable.findMany({
      where: and(eq(schema.jobsTable.queueName, queueName), inArray(schema.jobsTable.status, statuses)),
      orderBy: [asc ? ascDrizzle(schema.jobsTable.createdAt) : desc(schema.jobsTable.createdAt)],
      offset: start,
      limit: end, // 'end' here is the count/limit of items to fetch
    });
    return results.map(jobData => JobEntity.fromPersistence(jobData as JobPersistenceLoadProps<unknown, unknown>));
  }

  async countJobsByStatus(queueName: string, statuses?: JobStatus[]): Promise<Partial<Record<JobStatus, number>>> {
    const query = this.drizzleDbInstance.select({
      status: schema.jobsTable.status,
      count: schema.sql`count(*)`.mapWith(Number),
    }).from(schema.jobsTable)
      .where(
        and(
          eq(schema.jobsTable.queueName, queueName),
          statuses ? inArray(schema.jobsTable.status, statuses) : undefined
        )
      )
      .groupBy(schema.jobsTable.status);

    const results = await query;
    return results.reduce((acc, row) => {
      acc[row.status as JobStatus] = row.count as number;
      return acc;
    }, {} as Partial<Record<JobStatus, number>>);
  }

  async clean(queueName: string, gracePeriodMs: number, limit: number, status?: JobStatus): Promise<number> {
    const now = new Date();
    const finishedOlderThan = new Date(now.getTime() - gracePeriodMs);

    // Step 1: Select IDs of jobs to be deleted, respecting the limit
    const jobsToDeleteIdsQuery = this.drizzleDbInstance.select({ id: schema.jobsTable.id })
      .from(schema.jobsTable)
      .where(and(
        eq(schema.jobsTable.queueName, queueName),
        status ? eq(schema.jobsTable.status, status) :
                 or(eq(schema.jobsTable.status, JobStatus.COMPLETED), eq(schema.jobsTable.status, JobStatus.FAILED)), // Default to completed/failed
        lt(schema.jobsTable.finishedOn, finishedOlderThan)
      ))
      .orderBy(ascDrizzle(schema.jobsTable.finishedOn)) // Delete oldest first
      .limit(limit);

    const jobsToDelete = await jobsToDeleteIdsQuery;

    if (jobsToDelete.length === 0) {
      return 0;
    }

    const ids = jobsToDelete.map(jobEntry => jobEntry.id); // Renamed 'j' to 'jobEntry'

    // Step 2: Delete jobs with the selected IDs
    const result = await this.drizzleDbInstance.delete(schema.jobsTable)
      .where(inArray(schema.jobsTable.id, ids));

    return result.changes; // Number of rows deleted
  }
}