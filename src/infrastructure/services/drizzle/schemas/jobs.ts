// src/infrastructure/services/drizzle/schemas/jobs.ts
import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';
import { JobStatusType } from '@/core/domain/entities/job/value-objects/job-status.vo'; // For status enum values if needed by Drizzle
import { RetryPolicyParams } from '@/core/domain/entities/job/value-objects/retry-policy.vo';
import { ActivityContextPropsInput } from '@/core/domain/entities/job/value-objects/activity-context.vo';

// Note: Drizzle's text enum for sqlite is just `text().$type<EnumType>()`.
// The actual constraint is at application/db level outside of this type definition.
// We will store status as plain text matching JobStatusType values.

export const jobsTable = sqliteTable('jobs', {
    id: text('id').primaryKey(), // From JobId.getValue() (string UUID)
    name: text('name').notNull(), // From JobName.getValue() (string)
    status: text('status').notNull().$type<JobStatusType>(), // From JobStatus.getValue() (string enum)
    attempts: integer('attempts').notNull().default(0), // From AttemptCount.getValue() (number)

    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(), // From JobTimestamp.getValue().getTime()
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' }), // From JobTimestamp.getValue().getTime()

    payload: blob('payload', { mode: 'json' }).$type<Record<string, unknown> | null | undefined>(),
    retryPolicy: blob('retry_policy', { mode: 'json' }).$type<RetryPolicyParams | null | undefined>(),
    context: blob('context', { mode: 'json' }).$type<ActivityContextPropsInput | null | undefined>(),

    priority: integer('priority'), // From JobPriority.getValue() (number), optional
    dependsOn: blob('depends_on', { mode: 'json' }).$type<string[] | null | undefined>(), // string[] (JobId strings)
    activityType: text('activity_type').$type<string | null | undefined>(), // From ActivityType.getValue() (string), optional

    parentId: text('parent_id').$type<string | null | undefined>(), // From JobId.getValue() (string UUID), optional
    relatedActivityIds: blob('related_activity_ids', { mode: 'json' }).$type<string[] | null | undefined>(),

    agentId: text('agent_id').$type<string | null | undefined>(), // From AgentId.getValue() (string UUID), optional

    result: blob('result', { mode: 'json' }).$type<unknown | null | undefined>(),
    metadata: blob('metadata', { mode: 'json' }).$type<Record<string, unknown> | null | undefined>(),
    // 'data' field from previous schema, kept for compatibility if used, maps to JobProps.data
    data: blob('data', { mode: 'json' }).$type<Record<string, unknown> | null | undefined>(),
});

export type JobDbInsert = typeof jobsTable.$inferInsert;
export type JobDbSelect = typeof jobsTable.$inferSelect;
