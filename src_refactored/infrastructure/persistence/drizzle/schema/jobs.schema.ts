// FINAL TARGET SCHEMA + DUMMY COLUMN
import { integer, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';
import { JobStatus } from '@/core/domain/job/job.entity';

export const jobsTable = sqliteTable(
  'jobs',
  {
    id: text('id').primaryKey(),
    queueName: text('queue_name').notNull(),
    name: text('name').notNull(),
    payload: text('payload', { mode: 'json' }),
    options: text('options', { mode: 'json' }).notNull(),
    status: text('status').notNull().$type<JobStatus>(),
    attemptsMade: integer('attempts_made').notNull().default(0),
    progress: text('progress', { mode: 'json' }),
    logs: text('logs', { mode: 'json' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
    processedOn: integer('processed_on', { mode: 'timestamp_ms' }),
    finishedOn: integer('finished_on', { mode: 'timestamp_ms' }),
    delayUntil: integer('delay_until', { mode: 'timestamp_ms' }),
    lockUntil: integer('lock_until', { mode: 'timestamp_ms' }),
    workerId: text('worker_id'),
    returnValue: text('return_value', { mode: 'json' }),
    failedReason: text('failed_reason'),
    stacktrace: text('stacktrace', { mode: 'json' }),
    dummyColumnToDelete: text('dummy_column_to_delete'), // DUMMY COLUMN
  },
  (table) => {
    return {
      queueNameIdx: index('jobs_queue_name_idx').on(table.queueName),
      statusIdx: index('jobs_status_idx').on(table.status),
      delayUntilIdx: index('jobs_delay_until_idx').on(table.delayUntil),
      queueStatusIdx: index('jobs_queue_status_idx').on(table.queueName, table.status),
    };
  },
);
