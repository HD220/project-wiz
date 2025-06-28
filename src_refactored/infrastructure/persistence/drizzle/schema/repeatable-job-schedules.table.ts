// src_refactored/infrastructure/persistence/drizzle/schema/repeatable-job-schedules.table.ts
import { text, integer, blob, sqliteTable, index } from 'drizzle-orm/sqlite-core';

export const repeatableJobSchedulesTable = sqliteTable('repeatable_job_schedules', {
  id: text('id').primaryKey(),
  queueName: text('queue_name').notNull(),
  jobName: text('job_name').notNull(),

  cronPattern: text('cron_pattern'),
  every: integer('every'),

  jobData: blob('job_data', { mode: 'json' }),
  jobOptions: blob('job_options', { mode: 'json' }),

  timezone: text('timezone').default('UTC'),
  limit: integer('limit'),
  startDate: integer('start_date', { mode: 'timestamp_ms' }),
  endDate: integer('end_date', { mode: 'timestamp_ms' }),

  nextRunAt: integer('next_run_at', { mode: 'timestamp_ms' }).notNull(),
  lastRunJobId: text('last_run_job_id'),

  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),

  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true).notNull(),
}, (table) => ({
  enabledNextRunAtIdx: index('idx_repeatable_schedules_enabled_next_run')
    .on(table.isEnabled, table.nextRunAt),
  queueNameIdx: index('idx_repeatable_schedules_queue_name')
    .on(table.queueName),
}));

export type RepeatableJobScheduleInsert = typeof repeatableJobSchedulesTable.$inferInsert;
export type RepeatableJobScheduleSelect = typeof repeatableJobSchedulesTable.$inferSelect;
