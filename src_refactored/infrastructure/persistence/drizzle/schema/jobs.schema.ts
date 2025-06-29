// src_refactored/infrastructure/persistence/drizzle/schema/jobs.schema.ts
import { relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const jobsTable = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  queueName: text('queue_name').notNull(),
  name: text('name').notNull(),
  payload: text('payload', { mode: 'json' }).notNull(),
  options: text('options', { mode: 'json' }).notNull(),
  status: text('status').notNull(),
  attemptsMade: integer('attempts_made').notNull(),
  progress: text('progress', { mode: 'json' }).notNull(),
  logs: text('logs', { mode: 'json' }).notNull(),
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
});

export const jobsRelations = relations(jobsTable, () => ({
  // define relations here if needed in the future
}));