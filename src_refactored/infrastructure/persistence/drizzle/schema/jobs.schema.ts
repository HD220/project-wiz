// src_refactored/infrastructure/persistence/drizzle/schema/jobs.schema.ts
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

import { JobStatus } from '@/core/domain/job/job.entity'; // Adjust path as necessary
// import { usersTable } from './users.schema'; // Assuming users table for createdBy/updatedBy - Removed as not used

export const jobsTable = sqliteTable(
  'jobs',
  {
    id: text('id').primaryKey(), // Corresponds to JobIdVO
    queueName: text('queue_name').notNull(),
    name: text('name').notNull(), // Job name, e.g., 'send-email', 'process-image'
    status: text('status').notNull().$type<JobStatus>(),
    payload: text('payload', { mode: 'json' }), // Serialized P
    options: text('options', { mode: 'json' }), // Serialized JobOptionsVO
    returnValue: text('return_value', { mode: 'json' }), // Serialized R
    error: text('error'), // Serialized error details (message, stack)
    logs: text('logs', { mode: 'json' }), // Array of log entries
    progress: text('progress', { mode: 'json' }), // number or object

    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    startedAt: integer('started_at', { mode: 'timestamp_ms' }),
    finishedAt: integer('finished_at', { mode: 'timestamp_ms' }),
    delayUntil: integer('delay_until', { mode: 'timestamp_ms' }),

    attempts: integer('attempts').notNull().default(0), // Number of times this job has been attempted
    maxAttempts: integer('max_attempts'), // Max attempts allowed by options

    workerId: text('worker_id'), // ID of the worker currently processing this job
    lockUntil: integer('lock_until', { mode: 'timestamp_ms' }), // Timestamp until which the job is locked by a worker

    // Optional: Foreign keys if you have user tracking for job creation/updates
    // createdById: text('created_by_id').references(() => usersTable.id),
    // updatedById: text('updated_by_id').references(() => usersTable.id),

    // Optional: for optimistic concurrency control if needed
    // version: integer('version').notNull().default(1),
  },
  (table) => {
    return {
      queueNameIdx: uniqueIndex('queue_name_idx').on(table.queueName), // Index for faster queue lookups
      statusIdx: uniqueIndex('status_idx').on(table.status), // Index for filtering by status
      // If you frequently query for jobs ready to be processed:
      // processableIdx: uniqueIndex('processable_idx').on(table.queueName, table.status, table.delayUntil),
    };
  },
);

// Ensure JobStatus enum/type is correctly imported or defined
// Example:
// export enum JobStatus {
//   WAITING = 'waiting',
//   ACTIVE = 'active',
//   COMPLETED = 'completed',
//   FAILED = 'failed',
//   DELAYED = 'delayed',
//   PAUSED = 'paused', // if you implement pausing at the job level
// }
