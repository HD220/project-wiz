// src/infrastructure/services/drizzle/schema/jobs.ts

import { text, integer, sqliteTable, blob } from 'drizzle-orm/sqlite-core';
import { JobStatusType } from '../../../../core/domain/entities/jobs/job-status'; // Adjust path as needed

export const jobsTable = sqliteTable('jobs', {
  id: text('id').primaryKey(),
  queueId: text('queue_id').notNull(), // Assuming a foreign key relationship, but not enforcing it at DB level for simplicity now
  name: text('name').notNull(),

  // 'payload' and 'result' can be complex objects; storing as JSON strings (TEXT) or BLOB.
  // Using TEXT for simplicity, assuming JSON.stringify and JSON.parse will be used in the repository.
  // If binary data is needed, BLOB might be better with appropriate serialization.
  payload: text('payload'), // Store as JSON string
  data: text('data'), // Store as JSON string, for mutable data during job execution
  result: text('result'), // Store as JSON string

  maxAttempts: integer('max_attempts').notNull().default(1),
  attempts: integer('attempts').notNull().default(0),

  maxRetryDelay: integer('max_retry_delay').notNull().default(60000), // milliseconds
  retryDelay: integer('retry_delay').notNull().default(0), // milliseconds
  delay: integer('delay').notNull().default(0), // milliseconds for DELAYED status

  priority: integer('priority').notNull().default(0), // Lower number = higher priority

  status: text('status').notNull().default(JobStatusType.WAITING), // Store JobStatusType as string

  // 'dependsOn' could be a JSON array of job IDs stored as TEXT.
  dependsOn: text('depends_on'), // Store as JSON string array of job IDs

  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(new Date()),

  // Specific time after which the job should be executed
  executeAfter: integer('execute_after', { mode: 'timestamp_ms' }),
});

export type InsertJob = typeof jobsTable.$inferInsert;
export type SelectJob = typeof jobsTable.$inferSelect;
