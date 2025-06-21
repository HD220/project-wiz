// src/infrastructure/services/drizzle/schema/queues.ts

import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const queuesTable = sqliteTable('queues', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(), // Queue names should be unique
  concurrency: integer('concurrency').notNull().default(1),

  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(new Date()),

  // Storing jobIds as a JSON string array in the queue table itself is generally not recommended
  // for relational integrity and querying. A separate join table (e.g., queue_jobs) or
  // a foreign key on the jobs table (job.queueId -> queue.id) is more standard.
  // The Job entity already has a queueId, so this field might be redundant here if job.queueId is primary link.
  // For now, including as per plan's QueueProps, but this might be revised.
  // jobIds: text('job_ids'), // Store as JSON string array, if explicitly needed on Queue record
});

export type InsertQueue = typeof queuesTable.$inferInsert;
export type SelectQueue = typeof queuesTable.$inferSelect;
