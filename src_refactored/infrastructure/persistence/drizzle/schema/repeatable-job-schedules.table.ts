// src_refactored/infrastructure/persistence/drizzle/schema/repeatable-job-schedules.table.ts
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';
// import { relations } from 'drizzle-orm';
// import { jobsTable } from './jobs.table'; // If we need to reference jobsTable for FKs (e.g. lastRunJobId)

export const repeatableJobSchedulesTable = sqliteTable('repeatable_job_schedules', {
  id: text('id').primaryKey(), // Unique key for this schedule, e.g., 'daily-report-email', or UUID
  queueName: text('queue_name').notNull(),
  jobName: text('job_name').notNull(), // The name of the job to create

  cronPattern: text('cron_pattern'), // e.g., '0 0 * * *'
  every: integer('every'), // Interval in milliseconds (if cronPattern is not used)

  // Storing complex objects as JSON strings
  jobData: text('job_data', { mode: 'json' }),   // Payload for the jobs to be created
  jobOptions: text('job_options', { mode: 'json' }), // Default options for the jobs to be created

  timezone: text('timezone').default('UTC'),
  limit: integer('limit'), // Max number of times this job should be repeated
  startDate: integer('start_date', { mode: 'timestamp_ms' }), // Optional start date for the schedule
  endDate: integer('end_date', { mode: 'timestamp_ms' }),   // Optional end date for the schedule

  nextRunAt: integer('next_run_at', { mode: 'timestamp_ms' }).notNull(), // When this schedule should next create a job
  lastRunJobId: text('last_run_job_id'), // Optional: ID of the last job instance created by this schedule
  // lastRunJobId: text('last_run_job_id').references(() => jobsTable.id, { onDelete: 'set null' }), // Example FK

  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),

  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(true).notNull(),
}
// ,(table) => {
//   return {
//     enabledNextRunIdx: index('idx_repeatable_schedules_enabled_next_run')
//       .on(table.isEnabled, table.nextRunAt),
//   };
// }
);

// Optional: Define relations if lastRunJobId is a foreign key
// export const repeatableJobSchedulesRelations = relations(repeatableJobSchedulesTable, ({ one }) => ({
//   lastJobInstance: one(jobsTable, {
//     fields: [repeatableJobSchedulesTable.lastRunJobId],
//     references: [jobsTable.id],
//   }),
// }));
