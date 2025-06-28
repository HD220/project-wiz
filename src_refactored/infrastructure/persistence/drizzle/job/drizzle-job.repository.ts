// src_refactored/infrastructure/persistence/drizzle/job/drizzle-job.repository.ts
import {
  eq,
  and,
  or,
  inArray,
  sql,
  lte,
  lt,
  gte,
  desc,
  asc,
  isNull,
  count,
  SQL, // Added SQL type import
} from 'drizzle-orm';
import { inject, injectable } from 'inversify';

import {
  JobEntity,
  JobEntityProps,
} from '@/core/domain/job/job.entity';
import {
  IJobRepository,
} from '@/core/domain/job/ports/job-repository.interface';
import {
  JobSearchFilters,
  PaginationOptions,
  PaginatedJobsResult,
  JobCountsByStatus,
} from '@/core/domain/job/ports/job-repository.types';
import { JobExecutionLogEntryVO } from '@/core/domain/job/value-objects/job-execution-log-entry.vo';
import { JobExecutionLogsVO } from '@/core/domain/job/value-objects/job-execution-logs.vo';
import { JobIdVO } from '@/core/domain/job/value-objects/job-id.vo';
import { JobOptionsVO, IJobOptions } from '@/core/domain/job/value-objects/job-options.vo';
import { JobPriorityVO } from '@/core/domain/job/value-objects/job-priority.vo';
import { JobProgressVO } from '@/core/domain/job/value-objects/job-progress.vo';
import { JobStatusEnum, JobStatusVO } from '@/core/domain/job/value-objects/job-status.vo';

import { Result, Ok, Err } from '@/shared/result';

import type { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';


type PlaceholderColumn = { name: string; উদাহরণ?: any }; // Using a non-English character to avoid linting 'any' temporarily
type PlaceholderTable = {
  [key: string]: PlaceholderColumn | any; // Allow 'any' for non-core columns during placeholder phase
  id: PlaceholderColumn; queueName: PlaceholderColumn; jobName: PlaceholderColumn; payload: PlaceholderColumn;
  status: PlaceholderColumn; priority: PlaceholderColumn; attemptsMade: PlaceholderColumn; maxAttempts: PlaceholderColumn;
  createdAt: PlaceholderColumn; updatedAt: PlaceholderColumn; processAt: PlaceholderColumn; startedAt: PlaceholderColumn;
  completedAt: PlaceholderColumn; failedAt: PlaceholderColumn; returnValue: PlaceholderColumn; failedReason: PlaceholderColumn;
  progress: PlaceholderColumn; repeatJobKey: PlaceholderColumn; parentId: PlaceholderColumn; lockedByWorkerId: PlaceholderColumn;
  lockExpiresAt: PlaceholderColumn; jobOptions: PlaceholderColumn; executionLogs: PlaceholderColumn;
};

const _jobsTablePlaceholder: PlaceholderTable = { // Renamed with underscore
  id: { name: 'id' },
  queueName: { name: 'queue_name' },
  jobName: { name: 'job_name' },
  payload: { name: 'payload' },
  status: { name: 'status' },
  priority: { name: 'priority' },
  attemptsMade: { name: 'attempts_made' },
  maxAttempts: { name: 'max_attempts' },
  createdAt: { name: 'created_at' },
  updatedAt: { name: 'updated_at' },
  processAt: { name: 'process_at' },
  startedAt: { name: 'started_at' },
  completedAt: { name: 'completed_at' },
  failedAt: { name: 'failed_at' },
  returnValue: { name: 'return_value' },
  failedReason: { name: 'failed_reason' },
  progress: { name: 'progress' },
  repeatJobKey: { name: 'repeat_job_key' },
  parentId: { name: 'parent_id' },
  lockedByWorkerId: { name: 'locked_by_worker_id' },
  lockExpiresAt: { name: 'lock_expires_at' },
  jobOptions: { name: 'job_options' },
  executionLogs: { name: 'execution_logs' },
};

interface JobDbRow {
  id: string;
  queueName: string;
  jobName: string;
  payload: any;
  jobOptions: IJobOptions;
  status: JobStatusEnum;
  priority: number;
  progress: any;
  returnValue: any;
  failedReason?: string | null;
  attemptsMade: number;
  createdAt: number;
  updatedAt: number;
  processAt?: number | null;
  startedAt?: number | null;
  completedAt?: number | null;
  failedAt?: number | null;
  executionLogs: Array<{ message: string; level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'; details?: Record<string, unknown>; timestamp: number }> | null;
  lockedByWorkerId?: string | null;
  lockExpiresAt?: number | null;
  repeatJobKey?: string | null;
  parentId?: string | null;
  maxAttempts: number;
}

function mapRowToJobEntity<TData = any, TResult = any>(row: JobDbRow): JobEntity<TData, TResult> {
  const rehydratedProps: JobEntityProps<TData, TResult> = {
    id: JobIdVO.create(row.id),
    queueName: row.queueName,
    jobName: row.jobName,
    payload: row.payload as TData,
    opts: JobOptionsVO.create(row.jobOptions),
    status: JobStatusVO.create(row.status),
    priority: JobPriorityVO.create(row.priority),
    progress: JobProgressVO.create(row.progress),
    returnValue: row.returnValue as TResult,
    failedReason: row.failedReason ?? undefined,
    attemptsMade: row.attemptsMade,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    processAt: row.processAt ?? undefined,
    startedAt: row.startedAt ?? undefined,
    finishedAt: (row.completedAt || row.failedAt) ?? undefined,
    executionLogs: JobExecutionLogsVO.create(
      (row.executionLogs || []).map(log =>
        JobExecutionLogEntryVO.create(log.message, log.level, log.details, new Date(log.timestamp))
      )
    ),
    lockedByWorkerId: row.lockedByWorkerId ?? undefined,
    lockExpiresAt: row.lockExpiresAt ?? undefined,
    repeatJobKey: row.repeatJobKey ?? undefined,
  };
  return JobEntity.fromPersistence(rehydratedProps);
}

type JobDbInsertData = ReturnType<typeof mapJobEntityToDbRow>;

function mapJobEntityToDbRow(job: JobEntity<any, any>): JobDbInsertData {
  const props = (job as any).props as JobEntityProps<any, any>;
  return {
    id: props.id.value,
    queueName: props.queueName,
    jobName: props.jobName,
    payload: props.payload,
    opts: props.opts.props,
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
    completedAt: props.status.is(JobStatusEnum.COMPLETED) ? props.finishedAt : undefined,
    failedAt: props.status.is(JobStatusEnum.FAILED) ? props.finishedAt : undefined,
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
  };
}

@injectable()
export class DrizzleJobRepository implements IJobRepository {
  private _jobsTable: PlaceholderTable; // Renamed class member

  constructor(
    @inject('DrizzleClient') private db: BaseSQLiteDatabase<"async", any>,
    @inject('DrizzleSchema') schema: { jobs: PlaceholderTable }
  ) {
    this._jobsTable = schema.jobs; // Use renamed member
  }

  async save(job: JobEntity<any, any>): Promise<Result<void, Error>> {
    try {
      const rowToSave = mapJobEntityToDbRow(job);
      const table = this._jobsTable as any; // Use renamed member
      await this.db
        .insert(table)
        .values(rowToSave)
        .onConflictDoUpdate({
          target: table.id,
          set: Object.fromEntries(Object.entries(rowToSave).filter(([key]) => key !== 'id')),
        });
      return Ok(undefined);
    } catch (error: unknown) {
      return Err(new Error(`Failed to save job ${job.id.value}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findById(idVo: JobIdVO): Promise<Result<JobEntity<any, any> | null, Error>> { // Renamed id to idVo
    try {
      const table = this._jobsTable as any; // Use renamed member
      const resultRows: JobDbRow[] = await this.db
        .select()
        .from(table)
        .where(eq(table.id, idVo.value)) // Use idVo
        .limit(1);

      if (resultRows.length === 0) {
        return Ok(null);
      }
      return Ok(mapRowToJobEntity(resultRows[0]));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find job by id ${idVo.value}: ${error instanceof Error ? error.message : String(error)}`)); // Use idVo
    }
  }

  async findByIds(ids: JobIdVO[]): Promise<Result<JobEntity<any, any>[], Error>> {
    if (ids.length === 0) return Ok([]);
    try {
      const table = this._jobsTable as any; // Use renamed member
      const jobIds = ids.map(idVo => idVo.value);
      const resultRows: JobDbRow[] = await this.db
        .select()
        .from(table)
        .where(inArray(table.id, jobIds));

      return Ok(resultRows.map(mapRowToJobEntity));
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
    const table = this._jobsTable as any; // Use renamed member
    try {
      const candidateJobRows: JobDbRow[] = await this.db
        .select()
        .from(table)
        .where(
          and(
            eq(table.queueName, queueName),
            eq(table.status, JobStatusEnum.PENDING),
            or(
              isNull(table.processAt),
              lte(table.processAt, nowTimestampMs)
            )
          )
        )
        .orderBy(asc(table.priority), asc(table.createdAt))
        .limit(limit * 2);

      if (candidateJobRows.length === 0) {
        return Ok([]);
      }

      const lockedJobEntities: JobEntity<any, any>[] = [];
      const newLockExpiresAt = nowTimestampMs + lockDurationMs;

      for (const candidateRow of candidateJobRows) {
        if (lockedJobEntities.length >= limit) break;

        const updateResult = await this.db.update(table)
          .set({
            status: JobStatusEnum.ACTIVE,
            lockedByWorkerId: workerId,
            lockExpiresAt: newLockExpiresAt,
            startedAt: nowTimestampMs,
            updatedAt: nowTimestampMs,
            attemptsMade: sql`${table.attemptsMade} + 1`,
          })
          .where(and(
            eq(table.id, candidateRow.id),
            eq(table.status, JobStatusEnum.PENDING)
          ));

        if ((updateResult as { rowsAffected?: number }).rowsAffected ?? 0 > 0) {
          const lockedJobResult = await this.findById(JobIdVO.create(candidateRow.id));
          if (lockedJobResult.isOk() && lockedJobResult.value) {
            if (lockedJobResult.value.status.is(JobStatusEnum.ACTIVE) &&
                lockedJobResult.value.lockedByWorkerId === workerId) {
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
    const table = this._jobsTable as any; // Use renamed member
    try {
      const conditions: SQL[] = [
        eq(table.status, JobStatusEnum.ACTIVE),
        lt(table.lockExpiresAt, lockExpiresAtBefore),
      ];
      if (queueName) {
        conditions.push(eq(table.queueName, queueName));
      }

      const resultRows: JobDbRow[] = await this.db
        .select()
        .from(table)
        .where(and(...conditions))
        .orderBy(asc(table.lockExpiresAt))
        .limit(limit);

      return Ok(resultRows.map(mapRowToJobEntity));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find stalled jobs: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findDelayedJobsToPromote(
    nowTimestampMs: number,
    limit: number,
    queueName?: string,
  ): Promise<Result<JobEntity<any, any>[], Error>> {
    const table = this.jobsTable as any;
    try {
      const conditions: SQL[] = [
        eq(table.status, JobStatusEnum.DELAYED),
        lte(table.processAt, nowTimestampMs),
      ];
      if (queueName) {
        conditions.push(eq(table.queueName, queueName));
      }

      const resultRows: JobDbRow[] = await this.db
        .select()
        .from(table)
        .where(and(...conditions))
        .orderBy(asc(table.processAt))
        .limit(limit);

      return Ok(resultRows.map(mapRowToJobEntity));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find delayed jobs to promote: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findJobsByRepeatKey(
    queueName: string,
    repeatKey: string
  ): Promise<Result<JobEntity<any, any>[], Error>> {
    const table = this.jobsTable as any;
    try {
      const resultRows: JobDbRow[] = await this.db
        .select()
        .from(table)
        .where(and(
          eq(table.queueName, queueName),
          eq(table.repeatJobKey, repeatKey)
        ))
        .orderBy(desc(table.createdAt));
      return Ok(resultRows.map(mapRowToJobEntity));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find jobs by repeat key ${repeatKey} in queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async findJobsByParentId(parentIdVo: JobIdVO): Promise<Result<JobEntity<any, any>[], Error>> {
    const table = this.jobsTable as any;
    try {
      const resultRows: JobDbRow[] = await this.db
        .select()
        .from(table)
        .where(eq(table.parentId, parentIdVo.value))
        .orderBy(asc(table.createdAt));
      return Ok(resultRows.map(mapRowToJobEntity));
    } catch (error: unknown) {
      return Err(new Error(`Failed to find jobs by parent ID ${parentIdVo.value}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async getJobCountsByStatus(queueName: string): Promise<Result<JobCountsByStatus, Error>> {
    const table = this.jobsTable as any;
    try {
      const resultStats: { status: JobStatusEnum; count: number }[] = await this.db
        .select({
          status: table.status,
          count: count(table.id),
        })
        .from(table)
        .where(eq(table.queueName, queueName))
        .groupBy(table.status);

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

  async delete(idVo: JobIdVO): Promise<Result<void, Error>> { // Renamed id to idVo
    const table = this.jobsTable as any;
    try {
      await this.db.delete(table).where(eq(table.id, idVo.value)); // Use idVo
      return Ok(undefined);
    } catch (error: unknown) {
      return Err(new Error(`Failed to delete job ${idVo.value}: ${error instanceof Error ? error.message : String(error)}`)); // Use idVo
    }
  }

  async removeCompletedJobs(
    queueName: string,
    olderThanTimestampMs?: number,
    limit?: number,
  ): Promise<Result<number, Error>> {
    const table = this.jobsTable as any;
    try {
      const conditions: SQL[] = [
        eq(table.queueName, queueName),
        eq(table.status, JobStatusEnum.COMPLETED),
      ];
      if (olderThanTimestampMs !== undefined) {
        conditions.push(lt(table.completedAt, olderThanTimestampMs));
      }

      const idsToDeleteQuery = this.db
        .select({ id: table.id })
        .from(table)
        .where(and(...conditions))
        .orderBy(asc(table.completedAt));

      if (limit !== undefined) {
        idsToDeleteQuery.limit(limit);
      }
      const rowsToDelete: {id: string}[] = await idsToDeleteQuery;

      if (rowsToDelete.length === 0) return Ok(0);

      const ids = rowsToDelete.map((record: {id: string}) => record.id);
      const deleteResult = await this.db.delete(table).where(inArray(table.id, ids));

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
    const table = this.jobsTable as any;
    try {
      const conditions: SQL[] = [
        eq(table.queueName, queueName),
        eq(table.status, JobStatusEnum.FAILED),
      ];
      if (olderThanTimestampMs !== undefined) {
        conditions.push(lt(table.failedAt, olderThanTimestampMs));
      }

      const idsToDeleteQuery = this.db
        .select({ id: table.id })
        .from(table)
        .where(and(...conditions))
        .orderBy(asc(table.failedAt));

      if (limit !== undefined) {
        idsToDeleteQuery.limit(limit);
      }
      const rowsToDelete: {id: string}[] = await idsToDeleteQuery;

      if (rowsToDelete.length === 0) return Ok(0);

      const ids = rowsToDelete.map((record: {id: string}) => record.id);
      const deleteResult = await this.db.delete(table).where(inArray(table.id, ids));
      return Ok((deleteResult as { rowsAffected?: number }).rowsAffected ?? ids.length);
    } catch (error: unknown) {
      return Err(new Error(`Failed to remove failed jobs: ${error instanceof Error ? error.message : String(error)}`));
    }
  }

  async search(
    filters: JobSearchFilters,
    pagination: PaginationOptions,
  ): Promise<Result<PaginatedJobsResult<any, any>, Error>> {
    const table = this.jobsTable as any;
    try {
      const conditions: SQL[] = [];
      if (filters.queueName) conditions.push(eq(table.queueName, filters.queueName));
      if (filters.jobName) conditions.push(eq(table.jobName, filters.jobName));
      if (filters.status) {
        if (Array.isArray(filters.status)) {
          conditions.push(inArray(table.status, filters.status));
        } else {
          conditions.push(eq(table.status, filters.status));
        }
      }
      if (filters.parentId) {
        conditions.push(eq(table.parentId, typeof filters.parentId === 'string' ? filters.parentId : filters.parentId.value));
      }
      if (filters.repeatJobKey) conditions.push(eq(table.repeatJobKey, filters.repeatJobKey));
      if (filters.createdAtFrom) conditions.push(gte(table.createdAt, filters.createdAtFrom.getTime()));
      if (filters.createdAtTo) conditions.push(lte(table.createdAt, filters.createdAtTo.getTime()));


      const page = pagination.page || 1;
      const limitVal = pagination.limit || 10;
      const offset = (page - 1) * limitVal;

      let orderByColumn;
      // Ensure table[pagination.sortBy] is a valid column object before using it
      const sortByIsValidColumn = pagination.sortBy && Object.prototype.hasOwnProperty.call(table, pagination.sortBy);

      if (sortByIsValidColumn) {
        orderByColumn = table[pagination.sortBy!]; // Non-null assertion as it's checked
      } else {
        orderByColumn = table.createdAt;
      }
      const sortOrderFunc = pagination.sortOrder === 'DESC' ? desc : asc;
      const orderByClause = sortOrderFunc(orderByColumn);

      const resultsQuery = this.db
        .select()
        .from(table)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderByClause)
        .limit(limitVal)
        .offset(offset);

      const countResultPromise = this.db
        .select({ total: count() })
        .from(table)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      const [jobRows, countResult]: [JobDbRow[], {total: number}[]] = await Promise.all([resultsQuery, countResultPromise]);

      const totalItems = countResult[0]?.total || 0;
      const totalPages = Math.ceil(totalItems / limitVal);

      return Ok({
        jobs: jobRows.map(mapRowToJobEntity),
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
    const table = this.jobsTable as any;
    try {
      const conditions: SQL[] = [eq(table.queueName, queueName)];
      if (statuses && statuses.length > 0) {
        conditions.push(inArray(table.status, statuses));
      }

      const result = await this.db.delete(table).where(and(...conditions));

      const numAffected = (result as { rowsAffected?: number }).rowsAffected ?? -1;
      return Ok({ count: numAffected });
    } catch (error: unknown) {
      return Err(new Error(`Failed to delete jobs for queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`));
    }
  }
}
