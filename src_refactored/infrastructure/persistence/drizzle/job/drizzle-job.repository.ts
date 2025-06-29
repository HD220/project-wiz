// src_refactored/infrastructure/persistence/drizzle/job/drizzle-job.repository.ts
import { and, asc as ascDrizzle, desc, eq, inArray, isNull, lt, or } from 'drizzle-orm';

import { IJobRepository } from '@/core/application/ports/job-repository.interface';
import { JobEntity, JobStatus, JobPersistenceData, JobPersistence } from '@/core/domain/job/job.entity'; // Added JobPersistence
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';

import * as schema from '../schema'; // Moved schema import up

import type { db as DbType } from '../drizzle.client';

export class DrizzleJobRepository implements IJobRepository {
  constructor(private readonly drizzleDbInstance: typeof DbType) {}

  // Helper to map Drizzle's JobSelect to domain's JobPersistenceData
  private mapToPersistenceData<P, R>(jobData: schema.JobSelect): JobPersistenceData<P, R> {
    // Ensure JSON fields are properly cast/parsed if necessary.
    // Drizzle's db.query often auto-parses JSON, but db.select might not.
    // For db.query results, direct assignment is usually fine.
    const options = jobData.options as IJobOptions; // Drizzle query should parse this
    const logs = (jobData.logs as Array<{ message: string; level: string; timestamp: number }>) || [];
    const payload = jobData.payload as P;
    const returnValue = jobData.returnValue as R | null;
    const progress = jobData.progress as number | object;
    const stacktrace = jobData.stacktrace as string[] | null;

    return {
      id: jobData.id,
      queueName: jobData.queueName,
      name: jobData.name,
      payload: payload,
      options: options,
      status: jobData.status as JobStatus, // Schema status is string, cast to enum
      attemptsMade: jobData.attemptsMade,
      progress: progress,
      logs: logs, // Logs in schema are already {ts: number} via JobEntity.toPersistence mapping
      createdAt: jobData.createdAt.getTime(), // Convert Date to number
      updatedAt: jobData.updatedAt.getTime(), // Convert Date to number
      processedOn: jobData.processedOn ? jobData.processedOn.getTime() : null,
      finishedOn: jobData.finishedOn ? jobData.finishedOn.getTime() : null,
      delayUntil: jobData.delayUntil ? jobData.delayUntil.getTime() : null,
      lockUntil: jobData.lockUntil ? jobData.lockUntil.getTime() : null,
      workerId: jobData.workerId,
      returnValue: returnValue,
      failedReason: jobData.failedReason,
      stacktrace: stacktrace,
      // priority is part of options, not separate here
      // repeatJobKey and parentId are not in JobPersistenceData yet
    };
  }

  // Helper to map JobPersistence (domain) to Drizzle input type
  private mapToDrizzleInput(data: JobPersistence): typeof schema.jobsTable.$inferInsert {
    return {
      ...data,
      // Convert numeric timestamps from JobPersistence back to Date objects for Drizzle
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      processedOn: data.processedOn ? new Date(data.processedOn) : null,
      finishedOn: data.finishedOn ? new Date(data.finishedOn) : null,
      delayUntil: data.delayUntil ? new Date(data.delayUntil) : null,
      lockUntil: data.lockUntil ? new Date(data.lockUntil) : null,
      // payload, options, logs, progress, returnValue, stacktrace are JsonValue.
      // Drizzle's jsonb type should handle these directly.
      // status is already JobStatus enum, which is a string, compatible with schema's text type for status.
    };
  }

  async save(job: JobEntity<unknown, unknown>): Promise<void> {
    const persistenceData = job.toPersistence();
    const drizzleInput = this.mapToDrizzleInput(persistenceData);
    await this.drizzleDbInstance.insert(schema.jobsTable).values(drizzleInput).onConflictDoUpdate({ target: schema.jobsTable.id, set: drizzleInput });
  }

  async update(job: JobEntity<unknown, unknown>): Promise<void> {
    const persistenceData = job.toPersistence();
    const drizzleInput = this.mapToDrizzleInput(persistenceData);
    await this.drizzleDbInstance.update(schema.jobsTable).set(drizzleInput).where(eq(schema.jobsTable.id, drizzleInput.id));
  }

  async findById(id: JobIdVO): Promise<JobEntity<unknown, unknown> | null> {
    const result = await this.drizzleDbInstance.query.jobsTable.findFirst({ where: eq(schema.jobsTable.id, id.value) });
    if (!result) return null;
    return JobEntity.fromPersistence(this.mapToPersistenceData(result));
  }

  async findNextJobsToProcess(queueName: string, limit: number): Promise<Array<JobEntity<unknown, unknown>>> {
    const now = new Date();
    const results = await this.drizzleDbInstance.query.jobsTable.findMany({ // Corrected: use this.drizzleDbInstance
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
    return results.map(jobData => JobEntity.fromPersistence(this.mapToPersistenceData(jobData)));
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
    return results.map(jobData => JobEntity.fromPersistence(this.mapToPersistenceData(jobData)));
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
    const results = await this.drizzleDbInstance.query.jobsTable.findMany({ // Corrected: use this.drizzleDbInstance
      where: and(eq(schema.jobsTable.queueName, queueName), inArray(schema.jobsTable.status, statuses)),
      orderBy: [asc ? ascDrizzle(schema.jobsTable.createdAt) : desc(schema.jobsTable.createdAt)],
      offset: start,
      limit: end, // 'end' here is the count/limit of items to fetch
    });
    return results.map(jobData => JobEntity.fromPersistence(this.mapToPersistenceData(jobData)));
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