// src_refactored/infrastructure/persistence/drizzle/schema/jobs.schema.ts
import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

import { JobStatus } from '@/core/domain/job/job.entity'; // Changed import

export const jobsTable = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  queueName: text('queue_name').notNull(),
  name: text('name').notNull(), // Consolidated from 'jobName' to 'name' for consistency with JobEntity
  payload: text('payload', { mode: 'json' }).notNull(), // Changed from blob to text for JSON
  options: text('options', { mode: 'json' }).notNull(), // Consolidated from 'jobOptions' to 'options'
  returnValue: text('return_value', { mode: 'json' }),
  logs: text('logs', { mode: 'json' }).notNull(), // Consolidated from 'executionLogs'
  progress: text('progress', { mode: 'json' }).notNull(),

  status: text('status').$type<JobStatus>().notNull(), // Changed type
  priority: integer('priority').default(0).notNull(),

  attemptsMade: integer('attempts_made').default(0).notNull(),
  // maxAttempts is part of JobOptions, so not a separate column here, will be in 'options' field.
  // maxAttempts: integer('max_attempts').default(1).notNull(), // Removed, should be part of options

  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
  delayUntil: integer('delay_until', { mode: 'timestamp_ms' }), // Consolidated from 'processAt'
  processedOn: integer('processed_on', { mode: 'timestamp_ms' }), // Consolidated from 'startedAt'
  finishedOn: integer('finished_on', { mode: 'timestamp_ms' }), // Consolidated from 'completedAt'
  // failedAt: integer('failed_at', { mode: 'timestamp_ms' }), // Redundant, finishedOn can mark end, and status is FAILED

  failedReason: text('failed_reason'),
  stacktrace: text('stacktrace', { mode: 'json' }), // Added from the other schema

  // Fields from jobs.table.ts that are relevant for advanced queue features
  repeatJobKey: text('repeat_job_key'),
  parentId: text('parent_id'),

  workerId: text('worker_id'), // Consolidated from 'lockedByWorkerId'
  lockUntil: integer('lock_until', { mode: 'timestamp_ms' }), // Consolidated from 'lockExpiresAt'
}, (table) => ({
  queueStatusProcessAtPriorityIdx: index('idx_jobs_queue_status_delay_until_priority') // Renamed processAt to delayUntil
    .on(table.queueName, table.status, table.delayUntil, table.priority),
  statusIdx: index('idx_jobs_status').on(table.status),
  repeatKeyIdx: index('idx_jobs_repeat_key').on(table.repeatJobKey),
  lockedWorkerIdx: index('idx_jobs_worker_id').on(table.workerId), // Renamed lockedByWorkerId to workerId
  parentIdIdx: index('idx_jobs_parent_id').on(table.parentId),
  queueNameIdx: index('idx_jobs_queue_name').on(table.queueName),
}));

export const jobsRelations = relations(jobsTable, () => ({
  // define relations here if needed in the future
}));

export type JobInsert = typeof jobsTable.$inferInsert;
export type JobSelect = typeof jobsTable.$inferSelect;