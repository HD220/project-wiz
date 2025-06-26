// src/infrastructure/services/drizzle/schemas/jobs.ts
import { text, integer, sqliteTable, blob } from 'drizzle-orm/sqlite-core';
// Corrected path to JobStatusEnum from the refactored domain
import { JobStatusEnum } from '../../../../src_refactored/core/domain/job/value-objects/job-status.vo';

export const jobsTable = sqliteTable('jobs', {
  id: text('id').primaryKey(), // UUID, from JobIdVO
  queueName: text('queue_name').notNull(), // Renamed from queueId, aligns with JobEntity and Design Doc
  jobName: text('job_name').notNull(), // Renamed from name, aligns with JobEntity and Design Doc

  payload: blob('payload', { mode: 'json' }), // Job data/input, stored as JSON blob, aligns with Design Doc & JobEntity

  // returnValue replaces result, stored as JSON blob
  returnValue: blob('return_value', { mode: 'json' }),
  failedReason: text('failed_reason'), // Error message or stack trace for failed jobs

  status: text('status').$type<JobStatusEnum>().notNull().default(JobStatusEnum.PENDING), // JobStatusEnum, default PENDING
  priority: integer('priority').notNull().default(0), // Lower numbers are higher priority, aligns with Design Doc

  attemptsMade: integer('attempts_made').notNull().default(0), // Renamed from attempts, aligns with JobEntity
  maxAttempts: integer('max_attempts').notNull().default(1), // Max attempts, aligns with Design Doc

  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(), // App logic handles default
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(), // App logic handles default
  processAt: integer('process_at', { mode: 'timestamp_ms' }),      // For DELAYED jobs: when it should be processed
  startedAt: integer('started_at', { mode: 'timestamp_ms' }),      // Timestamp when processing started
  completedAt: integer('completed_at', { mode: 'timestamp_ms' }),  // Timestamp when job completed successfully
  failedAt: integer('failed_at', { mode: 'timestamp_ms' }),        // Timestamp when job finally failed

  progress: integer('progress').notNull().default(0), // Progress percentage (0-100), aligns with Design Doc

  repeatJobKey: text('repeat_job_key'), // Identifier for the repeatable job configuration
  dependsOnJobIds: blob('depends_on_job_ids', { mode: 'json' }), // JSON array of job IDs as strings
  parentId: text('parent_id'), // ID of a parent job in a flow

  lockedByWorkerId: text('locked_by_worker_id'),
  lockExpiresAt: integer('lock_expires_at', { mode: 'timestamp_ms' }), // Timestamp when the lock expires

  jobOptions: blob('job_options', { mode: 'json' }), // Store the original job options for reference or complex logic
  executionLogs: blob('execution_logs', { mode: 'json' }), // JSON array of log entries

  // Fields kept from original schema, potentially for specific app logic outside generic queue
  targetAgentRole: text('target_agent_role'),
  requiredCapabilities: text('required_capabilities', { mode: 'json' }).$type<string[] | null>(),
});

export type InsertJob = typeof jobsTable.$inferInsert;
export type SelectJob = typeof jobsTable.$inferSelect;
