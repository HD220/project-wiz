import { pgTable, text, timestamp, integer, jsonb, uuid } from 'drizzle-orm/pg-core';
import { JobStatus } from './job.types'; // Import JobStatus from the new location

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey(),
  queueName: text('queue_name').notNull(),
  name: text('name').notNull(),
  payload: jsonb('payload').notNull(),
  options: jsonb('options').notNull(),
  status: text('status').notNull().default(JobStatus.Queued),
  attemptsMade: integer('attempts_made').notNull().default(0),
  progress: jsonb('progress').notNull().default(0),
  logs: jsonb('logs').notNull().default([]),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  delayUntil: timestamp('delay_until'),
  finishedAt: timestamp('finished_at'),
  processedAt: timestamp('processed_at'),
  failedReason: text('failed_reason'),
  stacktrace: jsonb('stacktrace'),
  returnValue: jsonb('return_value'),
  workerId: text('worker_id'),
  lockUntil: timestamp('lock_until'),
});
