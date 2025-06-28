// src_refactored/infrastructure/persistence/drizzle/job/drizzle-job.repository.ts
import {
  eq, and, or, inArray, sql, lte, lt, gte, desc, asc, isNull, count, SQL,
} from 'drizzle-orm';
import { inject, injectable } from 'inversify';

import { ActivityHistory } from '@/core/domain/job/job-processing.types';
import { JobEntity, JobEntityProps } from '@/core/domain/job/job.entity';
import { AgentState } from '@/core/domain/job/job.entity'; // Import AgentState
import { IJobRepository } from '@/core/domain/job/ports/job-repository.interface';
import { JobSearchFilters, PaginationOptions, PaginatedJobsResult, JobCountsByStatus } from '@/core/domain/job/ports/job-repository.types';
import { JobExecutionLogEntryVO } from '@/core/domain/job/value-objects/job-execution-log-entry.vo';
import { JobExecutionLogsVO } from '@/core/domain/job/value-objects/job-execution-logs.vo';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { JobOptionsVO, IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';
import { JobPriorityVO } from '@/core/domain/job/value-objects/job-priority.vo';
import { JobProgressVO } from '@/core/domain/job/value-objects/job-progress.vo';
import { JobStatusEnum, JobStatusVO } from '@/core/domain/job/value-objects/job-status.vo';

import { Result, Ok, Err } from '@/shared/result';

// Import the actual Drizzle table schema
import { jobsTable, JobSelect, JobInsert } from '../schema/jobs.table'; // Adjust path as needed

import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';



// Helper to map Drizzle's JobSelect to JobEntity
function mapRowToJobEntity<TData = unknown, TResult = unknown>(row: JobSelect): JobEntity<TData, TResult> {
  // Drizzle's JSON blobs are already parsed into objects/arrays by default with better-sqlite3 driver.
  // We just need to cast them to the expected types.
  const jobOptionsFromDb = row.jobOptions as IJobOptions;
  const payloadFromDb = row.payload as TData;
  const returnValueFromDb = row.returnValue as TResult;
  const progressFromDb = row.progress as number | Record<string, unknown>;
  const executionLogsFromDb = (row.executionLogs || []) as Array<{ timestamp: number; message: string; level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'; details?: Record<string, unknown> }>;
  const agentStateFromDb = row.agentState as AgentState | null; // agentState column added to schema

  const entityProps: JobEntityProps<TData, TResult> = {
    id: JobIdVO.create(row.id),
    queueName: row.queueName,
    jobName: row.jobName,
    payload: payloadFromDb,
    opts: JobOptionsVO.create(jobOptionsFromDb),
    status: JobStatusVO.create(row.status as JobStatusEnum), // Ensure status is valid JobStatusEnum
    priority: JobPriorityVO.create(row.priority),
    progress: JobProgressVO.create(progressFromDb),
    returnValue: returnValueFromDb,
    failedReason: row.failedReason ?? undefined,
    attemptsMade: row.attemptsMade,
    createdAt: row.createdAt, // Already number (timestamp_ms)
    updatedAt: row.updatedAt,
    processAt: row.processAt ?? undefined,
    startedAt: row.startedAt ?? undefined,
    finishedAt: (row.completedAt || row.failedAt) ?? undefined,
    executionLogs: JobExecutionLogsVO.create(
      executionLogsFromDb.map(log =>
        JobExecutionLogEntryVO.create(log.message, log.level, log.details, new Date(log.timestamp))
      )
    ),
    lockedByWorkerId: row.lockedByWorkerId ?? undefined,
    lockExpiresAt: row.lockExpiresAt ?? undefined,
    repeatJobKey: row.repeatJobKey ?? undefined,
    parentId: row.parentId ?? undefined,
    agentState: agentStateFromDb ? { // Rehydrate AgentState
        conversationHistory: ActivityHistory.create(
            agentStateFromDb.conversationHistory.entries().map(entryProps => ActivityHistoryEntry.create(
                entryProps.role(),
                entryProps.content(),
                entryProps.props.timestamp,
                entryProps.props.toolName,
                entryProps.props.toolCallId,
                entryProps.props.tool_calls
            ))
        ),
        executionHistory: agentStateFromDb.executionHistory
    } : undefined,
    // _repository and _eventEmitter are transient, not mapped from DB row
  };
  return JobEntity.fromPersistence(entityProps);
}

// Helper to map JobEntity to Drizzle's JobInsert
function mapJobEntityToDbRow(job: JobEntity<any, any>): JobInsert {
  const props = job.props; // Access public props
  return {
    id: props.id.value,
    queueName: props.queueName,
    jobName: props.jobName,
    payload: props.payload,
    jobOptions: props.opts.props,
    status: props.status.value,
    priority: props.priority.value,
    progress: props.progress.value,
    returnValue: props.returnValue,
    failedReason: props.failedReason,
    attemptsMade: props.attemptsMade,
    maxAttempts: props.opts.attempts,
    createdAt: props.createdAt,
    updatedAt: props.updatedAt,
    processAt: props.processAt,
    startedAt: props.startedAt,
    completedAt: props.status.is(JobStatusEnum.COMPLETED) ? props.finishedAt : null, // Use null for DB
    failedAt: props.status.is(JobStatusEnum.FAILED) ? props.finishedAt : null, // Use null for DB
    executionLogs: props.executionLogs.entries.map(log => ({
        message: log.message,
        level: log.level,
        timestamp: log.timestamp.getTime(),
        details: log.details,
    })),
    lockedByWorkerId: props.lockedByWorkerId,
    lockExpiresAt: props.lockExpiresAt,
    repeatJobKey: props.repeatJobKey,
    parentId: props.opts.parentId,
    agentState: props.agentState ? { // Persist agentState
        conversationHistory: props.agentState.conversationHistory.toPersistence(), // Assuming toPersistence returns serializable format
        executionHistory: props.agentState.executionHistory
    } : null,
  };
}


@injectable()
export class DrizzleJobRepository implements IJobRepository {
  // Use the imported jobsTable directly
  private readonly table = jobsTable;

  constructor(
    @inject('DrizzleClient') private db: BaseSQLiteDatabase<"async", any, any>, // More specific type if possible
    // Schema object is not directly needed if we import tables directly
  ) {}

  async save(job: JobEntity<any, any>): Promise<Result<void, Error>> {
    try {
      const rowToSave = mapJobEntityToDbRow(job);
      await this.db
        .insert(this.table)
        .values(rowToSave)
        .onConflictDoUpdate({
          target: this.table.id,
          set: Object.fromEntries(Object.entries(rowToSave).filter(([key]) => key !== 'id')),
        });
      return Ok(undefined);
    } catch (error: unknown) {
      return Err(new Error(`Failed to save job ${job.id.value}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findById(idVo: JobIdVO): Promise<Result<JobEntity<any, any> | null, Error>> {
    try {
      const resultRows: JobSelect[] = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.id, idVo.value))
        .limit(1);

      if (resultRows.length === 0) {
        return Ok(null);
      }
      return Ok(mapRowToJobEntity(resultRows[0]));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find job by id ${idVo.value}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findByIds(ids: JobIdVO[]): Promise<Result<JobEntity<any, any>[], Error>> {
    if (ids.length === 0) return Ok([]);
    try {
      const jobIds = ids.map(idVo => idVo.value);
      const resultRows: JobSelect[] = await this.db
        .select()
        .from(this.table)
        .where(inArray(this.table.id, jobIds));

      return Ok(resultRows.map(row => mapRowToJobEntity(row)));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find jobs by ids: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findAndLockProcessableJobs(
    queueName: string,
    workerId: string,
    limit: number,
    nowTimestampMs: number,
    lockDurationMs: number,
  ): Promise<Result<JobEntity<any, any>[], Error>> {
    try {
      // Note: LIFO/FIFO based on job.opts.lifo is complex for a single query.
      // This implementation primarily sorts by priority then createdAt (FIFO).
      const candidateJobRows: JobSelect[] = await this.db
        .select()
        .from(this.table)
        .where(
          and(
            eq(this.table.queueName, queueName),
            eq(this.table.status, JobStatusEnum.PENDING),
            or(
              isNull(this.table.processAt),
              lte(this.table.processAt, nowTimestampMs)
            )
          )
        )
        .orderBy(asc(this.table.priority), asc(this.table.createdAt))
        .limit(limit * 2); // Over-fetch slightly to handle potential race conditions if not in transaction

      if (candidateJobRows.length === 0) {
        return Ok([]);
      }

      const lockedJobEntities: JobEntity<any, any>[] = [];
      const newLockExpiresAt = nowTimestampMs + lockDurationMs;

      for (const candidateRow of candidateJobRows) {
        if (lockedJobEntities.length >= limit) break;

        // Atomic update to lock the job
        const updateResult = await this.db.update(this.table)
          .set({
            status: JobStatusEnum.ACTIVE,
            lockedByWorkerId: workerId,
            lockExpiresAt: newLockExpiresAt,
            startedAt: nowTimestampMs,
            updatedAt: nowTimestampMs, // Touch updatedAt
            attemptsMade: sql`${this.table.attemptsMade} + 1`,
          })
          .where(and(
            eq(this.table.id, candidateRow.id),
            eq(this.table.status, JobStatusEnum.PENDING) // Ensure it's still pending
          ));

        // Check if update was successful (e.g., 1 row affected)
        // Drizzle's rowsAffected might vary by driver. For better-sqlite3, it's usually available.
        if ((updateResult as any).rowsAffected > 0) {
          // Re-fetch the now locked job to get its full state
          const lockedJobResult = await this.findById(JobIdVO.create(candidateRow.id));
          if (lockedJobResult.isOk() && lockedJobResult.value) {
            // Final check to ensure it's the one we locked
            if (lockedJobResult.value.lockedByWorkerId === workerId && lockedJobResult.value.status.is(JobStatusEnum.ACTIVE)) {
              lockedJobEntities.push(lockedJobResult.value);
            }
          }
        }
      }
      return Ok(lockedJobEntities);
    } catch (error: unknown) {
      return Err(new Error(`Failed to find and lock processable jobs for queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findStalledJobs(
    lockExpiresAtBefore: number,
    limit: number,
    queueName?: string,
  ): Promise<Result<JobEntity<any, any>[], Error>> {
    try {
      const conditions: SQL[] = [
        eq(this.table.status, JobStatusEnum.ACTIVE),
        lt(this.table.lockExpiresAt, lockExpiresAtBefore),
      ];
      if (queueName) {
        conditions.push(eq(this.table.queueName, queueName));
      }

      const resultRows: JobSelect[] = await this.db
        .select()
        .from(this.table)
        .where(and(...conditions))
        .orderBy(asc(this.table.lockExpiresAt))
        .limit(limit);

      return Ok(resultRows.map(row => mapRowToJobEntity(row)));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find stalled jobs: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findDelayedJobsToPromote(
    nowTimestampMs: number,
    limit: number,
    queueName?: string,
  ): Promise<Result<JobEntity<any, any>[], Error>> {
    try {
      const conditions: SQL[] = [
        eq(this.table.status, JobStatusEnum.DELAYED),
        lte(this.table.processAt, nowTimestampMs),
      ];
      if (queueName) {
        conditions.push(eq(this.table.queueName, queueName));
      }

      const resultRows: JobSelect[] = await this.db
        .select()
        .from(this.table)
        .where(and(...conditions))
        .orderBy(asc(this.table.processAt))
        .limit(limit);

      return Ok(resultRows.map(row => mapRowToJobEntity(row)));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find delayed jobs to promote: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findJobsByRepeatKey(
    queueName: string,
    repeatKey: string
  ): Promise<Result<JobEntity<any, any>[], Error>> {
    try {
      const resultRows: JobSelect[] = await this.db
        .select()
        .from(this.table)
        .where(and(
          eq(this.table.queueName, queueName),
          eq(this.table.repeatJobKey, repeatKey)
        ))
        .orderBy(desc(this.table.createdAt));
      return Ok(resultRows.map(row => mapRowToJobEntity(row)));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find jobs by repeat key ${repeatKey} in queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findJobsByParentId(parentIdVo: JobIdVO): Promise<Result<JobEntity<any, any>[], Error>> {
    try {
      const resultRows: JobSelect[] = await this.db
        .select()
        .from(this.table)
        .where(eq(this.table.parentId, parentIdVo.value))
        .orderBy(asc(this.table.createdAt));
      return Ok(resultRows.map(row => mapRowToJobEntity(row)));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find jobs by parent ID ${parentIdVo.value}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async getJobCountsByStatus(queueName: string): Promise<Result<JobCountsByStatus, Error>> {
    try {
      const resultStats: { status: JobStatusEnum; count: number }[] = await this.db
        .select({
          status: this.table.status,
          count: count(this.table.id),
        })
        .from(this.table)
        .where(eq(this.table.queueName, queueName))
        .groupBy(this.table.status);

      const counts: JobCountsByStatus = { total: 0 };
      resultStats.forEach(record => {
        counts[record.status] = record.count;
        counts.total = (counts.total || 0) + record.count;
        if (record.status === JobStatusEnum.PENDING) {
          counts.waiting = record.count;
        }
      });
      return Ok(counts);
    } catch (error: unknown) {
      return Err(new Error(`Failed to get job counts for queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async delete(idVo: JobIdVO): Promise<Result<void, Error>> {
    try {
      await this.db.delete(this.table).where(eq(this.table.id, idVo.value));
      return Ok(undefined);
    } catch (error: unknown) {
      return Err(new Error(`Failed to delete job ${idVo.value}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async removeCompletedJobs(
    queueName: string,
    olderThanTimestampMs?: number,
    limit?: number,
  ): Promise<Result<number, Error>> {
    try {
      const conditions: SQL[] = [
        eq(this.table.queueName, queueName),
        eq(this.table.status, JobStatusEnum.COMPLETED),
      ];
      if (olderThanTimestampMs !== undefined) {
        // Ensure completedAt is not null for this comparison
        conditions.push(and(isNotNull(this.table.completedAt), lt(this.table.completedAt, olderThanTimestampMs)));
      }

      const idsToDeleteQuery = this.db
        .select({ id: this.table.id })
        .from(this.table)
        .where(and(...conditions))
        .orderBy(asc(this.table.completedAt));

      if (limit !== undefined) {
        idsToDeleteQuery.limit(limit);
      }
      const rowsToDelete: {id: string}[] = await idsToDeleteQuery;

      if (rowsToDelete.length === 0) return Ok(0);

      const ids = rowsToDelete.map((record: {id: string}) => record.id);
      const deleteResult = await this.db.delete(this.table).where(inArray(this.table.id, ids));

      return Ok((deleteResult as { rowsAffected?: number }).rowsAffected ?? ids.length);
    } catch (error: unknown) {
      return Err(new Error(`Failed to remove completed jobs: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async removeFailedJobs(
    queueName: string,
    olderThanTimestampMs?: number,
    limit?: number,
  ): Promise<Result<number, Error>> {
    try {
      const conditions: SQL[] = [
        eq(this.table.queueName, queueName),
        eq(this.table.status, JobStatusEnum.FAILED),
      ];
      if (olderThanTimestampMs !== undefined) {
        conditions.push(and(isNotNull(this.table.failedAt), lt(this.table.failedAt, olderThanTimestampMs)));
      }

      const idsToDeleteQuery = this.db
        .select({ id: this.table.id })
        .from(this.table)
        .where(and(...conditions))
        .orderBy(asc(this.table.failedAt));

      if (limit !== undefined) {
        idsToDeleteQuery.limit(limit);
      }
      const rowsToDelete: {id: string}[] = await idsToDeleteQuery;

      if (rowsToDelete.length === 0) return Ok(0);

      const ids = rowsToDelete.map((record: {id: string}) => record.id);
      const deleteResult = await this.db.delete(this.table).where(inArray(this.table.id, ids));
      return Ok((deleteResult as { rowsAffected?: number }).rowsAffected ?? ids.length);
    } catch (error: unknown) {
      return Err(new Error(`Failed to remove failed jobs: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async search(
    filters: JobSearchFilters,
    pagination: PaginationOptions,
  ): Promise<Result<PaginatedJobsResult<any, any>, Error>> {
    try {
      const conditions: SQL[] = [];
      if (filters.queueName) conditions.push(eq(this.table.queueName, filters.queueName));
      if (filters.jobName) conditions.push(eq(this.table.jobName, filters.jobName));
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(inArray(this.table.status, filters.status));
        } else {
          conditions.push(eq(this.table.status, filters.status));
        }
      }
      if (filters.parentId) {
        conditions.push(eq(this.table.parentId, typeof filters.parentId === 'string' ? filters.parentId : filters.parentId.value));
      }
      if (filters.repeatJobKey) conditions.push(eq(this.table.repeatJobKey, filters.repeatJobKey));
      if (filters.createdAtFrom) conditions.push(gte(this.table.createdAt, filters.createdAtFrom.getTime()));
      if (filters.createdAtTo) conditions.push(lte(this.table.createdAt, filters.createdAtTo.getTime()));

      const page = pagination.page || 1;
      const limitVal = pagination.limit || 10;
      const offset = (page - 1) * limitVal;

      let orderByClause;
      const sortByField = pagination.sortBy ? (this.table as any)[pagination.sortBy] : this.table.createdAt;
      if (sortByField) {
          const sortOrderFunc = pagination.sortOrder === 'DESC' ? desc : asc;
          orderByClause = sortOrderFunc(sortByField);
      } else {
          orderByClause = desc(this.table.createdAt);
      }

      const resultsQuery = this.db
        .select()
        .from(this.table)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderByClause)
        .limit(limitVal)
        .offset(offset);

      const countResultPromise = this.db
        .select({ total: count() })
        .from(this.table)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const [jobRows, countResult]: [JobSelect[], {total: number}[]] = await Promise.all([resultsQuery, countResultPromise]);

      const totalItems = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalItems / limitVal);

      return Ok({
        jobs: jobRows.map(row => mapRowToJobEntity(row)),
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limitVal,
      });

    } catch (error: unknown) {
      return Err(new Error(`Failed to search jobs: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async deleteJobsByQueue(
    queueName: string,
    statuses?: JobStatusEnum[],
  ): Promise<Result<{ count: number }, Error>> {
    try {
      const conditions: SQL[] = [eq(this.table.queueName, queueName)];
      if (statuses && statuses.length > 0) {
        conditions.push(inArray(this.table.status, statuses));
      }

      const result = await this.db.delete(this.table).where(and(...conditions));

      const numAffected = (result as { rowsAffected?: number }).rowsAffected ?? -1;
      return Ok({ count: numAffected });
    } catch (error: unknown) {
      return Err(new Error(`Failed to delete jobs for queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}
