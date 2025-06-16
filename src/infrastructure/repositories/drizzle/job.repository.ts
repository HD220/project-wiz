// src/infrastructure/repositories/drizzle/job.repository.ts

import { db } from '../../services/drizzle/index'; // Pointing to better-sqlite3 setup in index.ts
import { jobsTable, InsertJob, SelectJob } from '../../services/drizzle/schemas/jobs'; // Path to jobs schema
import { Job } from '../../../core/domain/entities/jobs/job.entity';
import { JobStatus, JobStatusType } from '../../../core/domain/entities/jobs/job-status';
import { IJobRepository } from '../../../core/ports/repositories/job.repository';
import { eq, and, or, asc, lte, sql } from 'drizzle-orm'; // Removed gte as it's not used in the provided code

// Helper to convert DB row to Job entity
function dbToDomain(row: SelectJob): Job<any, any> {
  // Ensure all properties from SelectJob are correctly mapped and parsed
  return new Job({
    id: row.id,
    queueId: row.queueId,
    name: row.name,
    payload: row.payload ? JSON.parse(row.payload) : undefined,
    data: row.data ? JSON.parse(row.data) : undefined,
    result: row.result ? JSON.parse(row.result) : undefined,
    maxAttempts: row.maxAttempts,
    attempts: row.attempts || 0, // Default to 0 if null from DB
    maxRetryDelay: row.maxRetryDelay,
    retryDelay: row.retryDelay || 0, // Default to 0 if null from DB
    delay: row.delay || 0, // Default to 0 if null from DB
    priority: row.priority || 0, // Default to 0 if null from DB
    // status is tricky: needs to be constructed with JobStatusType
    // Assuming row.status is a valid JobStatusType string
    status: JobStatus.create(row.status as JobStatusType),
    dependsOn: row.dependsOn ? JSON.parse(row.dependsOn) : undefined,
    createdAt: row.createdAt ? new Date(row.createdAt) : new Date(), // Default to now if null
    updatedAt: row.updatedAt ? new Date(row.updatedAt) : new Date(), // Default to now if null
    executeAfter: row.executeAfter ? new Date(row.executeAfter) : undefined,
  });
}

// Helper to convert Job entity to DB insert/update object
// Ensure all fields required by InsertJob are present, and types match (esp. Date to number/string)
function domainToDb(job: Job<any, any>): InsertJob {
  return {
    id: job.id,
    queueId: job.queueId,
    name: job.name,
    payload: job.payload ? JSON.stringify(job.payload) : null, // Use null for DB
    data: job.data ? JSON.stringify(job.data) : null,
    result: job.result ? JSON.stringify(job.result) : null,
    maxAttempts: job.maxAttempts,
    attempts: job.attempts,
    maxRetryDelay: job.maxRetryDelay,
    retryDelay: job.retryDelay,
    delay: job.delay,
    priority: job.priority,
    status: job.status.value as JobStatusType,
    dependsOn: job.dependsOn ? JSON.stringify(job.dependsOn) : null,
    createdAt: job.createdAt, // Pass Date object, Drizzle handles conversion for timestamp_ms
    updatedAt: job.updatedAt,
    executeAfter: job.executeAfter ? job.executeAfter : null, // Pass Date or null
  };
}


export class DrizzleJobRepository implements IJobRepository {
  async findById(id: string): Promise<Job<any, any> | null> {
    const result = await db.select().from(jobsTable).where(eq(jobsTable.id, id)).limit(1);
    if (result.length === 0) {
      return null;
    }
    return dbToDomain(result[0]);
  }

  async save(job: Job<any, any>): Promise<void> {
    const dbJobData = domainToDb(job);

    // Ensure all fields for insertion are present, Drizzle checks this.
    // If createdAt is managed by DB default, it might not be needed here IF job.createdAt can be undefined.
    // But Job entity seems to set it, so we pass it.
    const valuesToInsert: InsertJob = {
        ...dbJobData,
        // Drizzle schema has defaults for createdAt/updatedAt, but we provide them from entity
        // For onConflictDoUpdate, some DBs might not like updating PK or default-timestamped cols explicitly.
        // SQLite handles it fine.
    };

    // For 'set' in onConflictDoUpdate, exclude primary key and immutable fields like createdAt
    // queueId, name are also often immutable after creation.
    const { id, createdAt, queueId, name, ...updateData } = valuesToInsert;

    await db.insert(jobsTable).values(valuesToInsert)
      .onConflictDoUpdate({
        target: jobsTable.id, // Conflict on ID
        set: { // Fields to update on conflict
            ...updateData, // Update all other fields from domainToDb
            updatedAt: new Date(), // Explicitly set updatedAt on any update/upsert
        }
    });
  }

  async update(job: Job<any, any>): Promise<void> {
    const { id, createdAt, ...dbJobData } = domainToDb(job); // Exclude id and createdAt from set
    await db.update(jobsTable)
      .set({
        ...dbJobData,
        updatedAt: new Date(), // Ensure updatedAt is always fresh on update
      })
      .where(eq(jobsTable.id, job.id));
  }

  async findPending(queueId: string, limit: number): Promise<Job<any, any>[]> {
    const now = new Date(); // In UTC or consistent timezone with DB
    const results = await db
      .select()
      .from(jobsTable)
      .where(
        and(
          eq(jobsTable.queueId, queueId),
          or(
            eq(jobsTable.status, JobStatusType.WAITING),
            and(
              eq(jobsTable.status, JobStatusType.DELAYED),
              // jobsTable.executeAfter is Date | null, now is Date.
              // Need to ensure lte handles nulls correctly or add a check.
              // Drizzle's lte should handle date comparison. If executeAfter is null, it shouldn't match.
              // For safety, one might add: jobsTable.executeAfter.isNotNull(),
              // but lte(null, now) is generally false, which is fine.
              lte(jobsTable.executeAfter, now)
            )
          )
        )
      )
      .orderBy(asc(jobsTable.priority), asc(jobsTable.createdAt))
      .limit(limit);

    return results.map(dbToDomain);
  }
}
