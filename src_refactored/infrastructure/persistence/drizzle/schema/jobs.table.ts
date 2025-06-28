// src_refactored/infrastructure/persistence/drizzle/schema/jobs.table.ts
import { text, integer, blob, sqliteTable, index } from 'drizzle-orm/sqlite-core';

import { JobStatusEnum } from '@/core/domain/job/value-objects/job-status.vo';

export const jobsTable = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  queueName: text('queue_name').notNull(),
  jobName: text('job_name').notNull(),

  payload: blob('payload', { mode: 'json' }).notNull(),
  jobOptions: blob('job_options', { mode: 'json' }).notNull(),
  returnValue: blob('return_value', { mode: 'json' }),
  executionLogs: blob('execution_logs', { mode: 'json' }).notNull(),
  progress: blob('progress', { mode: 'json' }).notNull(),

  status: text('status').$type<JobStatusEnum>().notNull(),
  priority: integer('priority').default(0).notNull(),

  attemptsMade: integer('attempts_made').default(0).notNull(),
  maxAttempts: integer('max_attempts').default(1).notNull(),

  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  processAt: integer('process_at', { mode: 'timestamp_ms' }),
  startedAt: integer('started_at', { mode: 'timestamp_ms' }),
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),
  failedAt: integer('failed_at', { mode: 'timestamp_ms' }),

  failedReason: text('failed_reason'),

  repeatJobKey: text('repeat_job_key'),
  parentId: text('parent_id'),

  lockedByWorkerId: text('locked_by_worker_id'),
  lockExpiresAt: integer('lock_expires_at', { mode: 'timestamp_ms' }),
}, (table) => ({
  queueStatusProcessAtPriorityIdx: index('idx_jobs_queue_status_process_at_priority')
    .on(table.queueName, table.status, table.processAt, table.priority),
  statusIdx: index('idx_jobs_status').on(table.status),
  repeatKeyIdx: index('idx_jobs_repeat_key').on(table.repeatJobKey),
  lockedWorkerIdx: index('idx_jobs_locked_worker_id').on(table.lockedByWorkerId),
  parentIdIdx: index('idx_jobs_parent_id').on(table.parentId),
  queueNameIdx: index('idx_jobs_queue_name').on(table.queueName),
}));

export type JobInsert = typeof jobsTable.$inferInsert;
export type JobSelect = typeof jobsTable.$inferSelect;
