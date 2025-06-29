// src_refactored/infrastructure/persistence/drizzle/job/drizzle-job.repository.ts
import { and, desc, eq, inArray, lte, or, sql } from 'drizzle-orm';
// import { LibSQLDatabase } from 'drizzle-orm/libsql'; // Not directly used
import { inject, injectable } from 'inversify';

import {
  IJobRepository,
  // JOB_REPOSITORY_TOKEN, // Token is used for DI registration, not internally by the class
} from '@/core/application/ports/job-repository.interface';
import { JobEntity, JobStatus, JobLogEntry } from '@/core/domain/job/job.entity';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { JobOptionsVO, IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';

import { Database, DRIZZLE_CLIENT_TOKEN } from '@/infrastructure/persistence/drizzle/drizzle.client';
import * as schema from '@/infrastructure/persistence/drizzle/schema';

@injectable()
export class DrizzleJobRepository implements IJobRepository {
  constructor(
    @inject(DRIZZLE_CLIENT_TOKEN) private readonly db: Database,
  ) {}

  private mapToDomain(row: typeof schema.jobsTable.$inferSelect): JobEntity<unknown, unknown> {
    let parsedOptions: IJobOptions | undefined = undefined;
    // Drizzle with mode: 'json' for text columns should return string, needs parsing.
    if (row.options && typeof row.options === 'string') {
      try {
        parsedOptions = JSON.parse(row.options) as IJobOptions;
      } catch (exception) {
        console.error(`Failed to parse options for job ${row.id}:`, exception);
        // Keep parsedOptions undefined, JobOptionsVO.create will use defaults
      }
    } else if (typeof row.options === 'object' && row.options !== null) {
      // Fallback if it's already an object (e.g. if Drizzle config changes or custom type is used)
      parsedOptions = row.options as IJobOptions;
    }

    let parsedLogs: JobLogEntry[] = [];
    if (row.logs && typeof row.logs === 'string') {
      try {
        parsedLogs = JSON.parse(row.logs) as JobLogEntry[];
      } catch (exception) {
        console.error(`Failed to parse logs for job ${row.id}:`, exception);
      }
    } else if (Array.isArray(row.logs)) {
      parsedLogs = row.logs as JobLogEntry[];
    }

    let parsedError: Error | undefined = undefined;
    if (row.error && typeof row.error === 'string') {
        try {
            // Simple error parsing; a more robust solution might store error type and message separately
            const errorObj = JSON.parse(row.error);
            parsedError = new Error(errorObj.message || 'Unknown error');
            if (errorObj.stack) parsedError.stack = errorObj.stack;
            if (errorObj.name) parsedError.name = errorObj.name;
        } catch (exception) {
            console.error(`Failed to parse error for job ${row.id}:`, exception);
            parsedError = new Error(row.error); // Store raw string as message if parsing fails
        }
    }


    return JobEntity.reconstitute({
      id: JobIdVO.create(row.id),
      queueName: row.queueName,
      name: row.name,
      status: row.status,
      payload: row.payload as unknown,
      options: JobOptionsVO.create(parsedOptions),
      returnValue: row.returnValue as unknown,
      error: parsedError,
      logs: parsedLogs,
      progress: row.progress as number | object, // Assuming Drizzle handles its JSON if it's a JSON type column
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
      startedAt: row.startedAt ? new Date(row.startedAt) : undefined,
      finishedAt: row.finishedAt ? new Date(row.finishedAt) : undefined,
      delayUntil: row.delayUntil ? new Date(row.delayUntil) : undefined,
      attempts: row.attempts,
      maxAttempts: row.maxAttempts ?? undefined,
      workerId: row.workerId ?? undefined,
      lockUntil: row.lockUntil ? new Date(row.lockUntil) : undefined,
    });
  }

  private mapToPersistence(entity: JobEntity<unknown, unknown>): typeof schema.jobsTable.$inferInsert {
    // For fields that are stored as JSON strings (payload, options, returnValue, error, logs, progress)
    // Drizzle ORM with `mode: 'json'` on a `text()` column should handle stringification automatically.
    // If not, manual `JSON.stringify()` would be needed here.
    // For `error`, we store a simplified object.
    const errorPersistence = entity.error
      ? JSON.stringify({ name: entity.error.name, message: entity.error.message, stack: entity.error.stack })
      : undefined;

    return {
      id: entity.id.value,
      queueName: entity.queueName,
      name: entity.name,
      status: entity.status,
      payload: entity.payload as unknown, // Let Drizzle handle JSON stringification
      options: entity.options.toDTO(), // Let Drizzle handle JSON stringification
      returnValue: entity.returnValue as unknown, // Let Drizzle handle JSON stringification
      error: errorPersistence,
      logs: entity.logs, // Let Drizzle handle JSON stringification
      progress: entity.progress, // Let Drizzle handle JSON stringification
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      startedAt: entity.startedAt,
      finishedAt: entity.finishedAt,
      delayUntil: entity.delayUntil,
      attempts: entity.attempts,
      maxAttempts: entity.options.attempts, // Get from options
      workerId: entity.workerId,
      lockUntil: entity.lockUntil,
      // version: entity.version, // if using optimistic concurrency
    };
  }

  async save(job: JobEntity<unknown, unknown>): Promise<void> {
    const values = this.mapToPersistence(job);
    await this.db
      .insert(schema.jobsTable)
      .values(values)
      .onConflictDoUpdate({
        target: schema.jobsTable.id,
        set: { ...values, id: undefined, createdAt: undefined }, // Exclude PK and createdAt from update set
      });
  }

  async update(job: JobEntity<unknown, unknown>): Promise<void> {
    // Drizzle's onConflictDoUpdate in save handles this for SQLite.
    // For other DBs or more granular updates, a specific update statement might be needed.
    // This simplified 'update' relies on 'save' for now.
    // A more robust update would only set fields that have changed.
    const values = this.mapToPersistence(job);
    values.updatedAt = new Date(); // Ensure updatedAt is always fresh on explicit update

    await this.db
      .update(schema.jobsTable)
      .set(values)
      .where(eq(schema.jobsTable.id, job.id.value));
  }

  async findById(id: JobIdVO): Promise<JobEntity<unknown, unknown> | null> {
    const result = await this.db
      .select()
      .from(schema.jobsTable)
      .where(eq(schema.jobsTable.id, id.value))
      .limit(1);
    return result.length > 0 ? this.mapToDomain(result[0]) : null;
  }

  async findNextJobsToProcess(queueName: string, limit: number): Promise<Array<JobEntity<unknown, unknown>>> {
    const now = new Date();
    const results = await this.db
      .select()
      .from(schema.jobsTable)
      .where(
        and(
          eq(schema.jobsTable.queueName, queueName),
          or(
            eq(schema.jobsTable.status, JobStatus.WAITING),
            and(
              eq(schema.jobsTable.status, JobStatus.DELAYED),
              lte(schema.jobsTable.delayUntil, now),
            ),
          ),
          // Ensure it's not currently locked or lock has expired
          or(
            eq(schema.jobsTable.lockUntil, null), // Using eq with null for clarity
            lte(schema.jobsTable.lockUntil, now)
          )
        ),
      )
      .orderBy(
        sql`${schema.jobsTable.options}->>'priority' ASC`, // Assuming priority is in options JSON
        schema.jobsTable.createdAt,
      ) // TODO: Drizzle doesn't directly support ORDER BY JSON property easily for all DBs. This is an attempt for SQLite.
      // A more portable way might involve storing priority in a dedicated column or fetching more and sorting in memory.
      .limit(limit);
    return results.map(this.mapToDomain);
  }

  async acquireLock(jobId: JobIdVO, workerId: string, lockUntil: Date): Promise<boolean> {
    const now = new Date();
    const result = await this.db
      .update(schema.jobsTable)
      .set({
        workerId: workerId,
        lockUntil: lockUntil,
        status: JobStatus.ACTIVE, // Set to active when lock is acquired
        startedAt: now, // Set startedAt when lock is acquired
        updatedAt: now,
      })
      .where(
        and(
          eq(schema.jobsTable.id, jobId.value),
          // Ensure job is in a lockable state (e.g. WAITING or DELAYED and ready)
          // And not currently locked by another worker or its lock has expired
          or(
            eq(schema.jobsTable.status, JobStatus.WAITING),
            and(
              eq(schema.jobsTable.status, JobStatus.DELAYED),
              lte(schema.jobsTable.delayUntil, now)
            )
          ),
          or(
            eq(schema.jobsTable.lockUntil, null),
            lte(schema.jobsTable.lockUntil, now)
          )
        ),
      )
      .returning({ id: schema.jobsTable.id }); // Check if any row was updated

    return result.length > 0;
  }

  async extendLock(jobId: JobIdVO, workerId: string, lockUntil: Date): Promise<void> {
    await this.db
      .update(schema.jobsTable)
      .set({ lockUntil: lockUntil, updatedAt: new Date() })
      .where(
        and(
          eq(schema.jobsTable.id, jobId.value),
          eq(schema.jobsTable.workerId, workerId), // Ensure only the current worker extends the lock
          eq(schema.jobsTable.status, JobStatus.ACTIVE), // Job should be active
        ),
      );
  }

  async findStalledJobs(queueName: string, olderThan: Date, limit: number): Promise<Array<JobEntity<unknown, unknown>>> {
    const results = await this.db
      .select()
      .from(schema.jobsTable)
      .where(
        and(
          eq(schema.jobsTable.queueName, queueName),
          eq(schema.jobsTable.status, JobStatus.ACTIVE), // Only active jobs can be stalled
          lte(schema.jobsTable.lockUntil, olderThan), // Lock has expired
        ),
      )
      .orderBy(schema.jobsTable.lockUntil) // Process oldest stalled jobs first
      .limit(limit);
    return results.map(this.mapToDomain);
  }

  async remove(jobId: JobIdVO): Promise<void> {
    await this.db.delete(schema.jobsTable).where(eq(schema.jobsTable.id, jobId.value));
  }

  async getJobsByStatus(
    queueName: string,
    statuses: JobStatus[],
    start?: number,
    end?: number, // Drizzle uses limit/offset, so 'end' needs to be converted to 'limit'
    asc?: boolean,
  ): Promise<Array<JobEntity<unknown, unknown>>> {
    const query = this.db
      .select()
      .from(schema.jobsTable)
      .where(
        and(
          eq(schema.jobsTable.queueName, queueName),
          inArray(schema.jobsTable.status, statuses),
        ),
      )
      .orderBy(
        asc
          ? schema.jobsTable.createdAt
          : desc(schema.jobsTable.createdAt),
      );

    if (start !== undefined) {
      query.offset(start);
    }

    let limitValue: number | undefined = undefined;
    if (end !== undefined && start !== undefined) {
        limitValue = end - start + 1; // end is inclusive index
    } else if (end !== undefined) {
        limitValue = end + 1; // if start is 0 or undefined, end is count-1
    }

    if (limitValue !== undefined && limitValue > 0) {
      query.limit(limitValue);
    }

    const results = await query;
    return results.map(this.mapToDomain);
  }

  async countJobsByStatus(queueName: string, statuses?: JobStatus[]): Promise<Partial<Record<JobStatus, number>>> {
    const conditions = [eq(schema.jobsTable.queueName, queueName)];
    if (statuses && statuses.length > 0) {
      conditions.push(inArray(schema.jobsTable.status, statuses));
    }

    const results = await this.db
      .select({
        status: schema.jobsTable.status,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(schema.jobsTable)
      .where(and(...conditions))
      .groupBy(schema.jobsTable.status);

    const counts: Partial<Record<JobStatus, number>> = {};
    for (const row of results) {
      counts[row.status as JobStatus] = row.count;
    }
    return counts;
  }

  async clean(queueName: string, gracePeriodMs: number, limit: number, status?: JobStatus): Promise<number> {
    const now = new Date();
    const finishedBefore = new Date(now.getTime() - gracePeriodMs);
    // For waiting/delayed, 'age' is based on createdAt. For completed/failed, on finishedAt.

    const conditions = [
        eq(schema.jobsTable.queueName, queueName),
    ];

    if (status) {
        conditions.push(eq(schema.jobsTable.status, status));
        if (status === JobStatus.COMPLETED || status === JobStatus.FAILED) {
            conditions.push(lte(schema.jobsTable.finishedAt, finishedBefore));
        } else {
            // For other statuses like WAITING or DELAYED, cleaning by age might be based on createdAt
            conditions.push(lte(schema.jobsTable.createdAt, finishedBefore));
        }
    } else {
        // Default: clean COMPLETED or FAILED jobs older than grace period
        conditions.push(
            or(
                and(
                    eq(schema.jobsTable.status, JobStatus.COMPLETED),
                    lte(schema.jobsTable.finishedAt, finishedBefore)
                ),
                and(
                    eq(schema.jobsTable.status, JobStatus.FAILED),
                    lte(schema.jobsTable.finishedAt, finishedBefore)
                )
            )
        );
    }

    // Drizzle does not support DELETE with LIMIT directly for all drivers in a portable way.
    // A common workaround is to select IDs and then delete by IDs.
    const jobsToDelete = await this.db
      .select({ id: schema.jobsTable.id })
      .from(schema.jobsTable)
      .where(and(...conditions))
      .orderBy(schema.jobsTable.finishedAt) // or createdAt depending on strategy
      .limit(limit);

    if (jobsToDelete.length === 0) {
      return 0;
    }

    const idsToDelete = jobsToDelete.map((jobToDelete) => jobToDelete.id);
    await this.db
      .delete(schema.jobsTable)
      .where(inArray(schema.jobsTable.id, idsToDelete));

    // For SQLite, the result of delete doesn't directly give count.
    // We return the number of IDs we attempted to delete.
    // For other drivers, 'result.rowCount' might be available from the delete operation.
    return idsToDelete.length;
  }
}
