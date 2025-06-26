// src/infrastructure/services/drizzle/schemas/repeatableJobSchedules.ts
import { text, integer, sqliteTable, blob } from 'drizzle-orm/sqlite-core';

export const repeatableJobSchedulesTable = sqliteTable('repeatable_job_schedules', {
  id: text('id').primaryKey(), // Unique key for this schedule, e.g., 'daily-report-email'
  queueName: text('queue_name').notNull(),
  jobName: text('job_name').notNull(),

  cronPattern: text('cron_pattern'), // e.g., '0 0 * * *'
  every: integer('every'), // Interval in milliseconds

  jobData: blob('job_data', { mode: 'json' }), // Payload for the jobs created by this schedule
  jobOptions: blob('job_options', { mode: 'json' }), // Options for the jobs created by this schedule

  timezone: text('timezone').default('UTC'),
  limit: integer('limit'), // Max number of times this job should repeat
  startDate: integer('start_date', { mode: 'timestamp_ms' }),
  endDate: integer('end_date', { mode: 'timestamp_ms' }),

  nextRunAt: integer('next_run_at', { mode: 'timestamp_ms' }).notNull(),
  lastRunJobId: text('last_run_job_id'), // ID of the last job instance created from this schedule

  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),

  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true).notNull(),
});

export type InsertRepeatableJobSchedule = typeof repeatableJobSchedulesTable.$inferInsert;
export type SelectRepeatableJobSchedule = typeof repeatableJobSchedulesTable.$inferSelect;
