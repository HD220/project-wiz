import { relations } from "drizzle-orm";
import { integer, sqliteTable, text, index } from "drizzle-orm/sqlite-core";

import { JobStatus } from "@/core/domain/job/job.entity";

export const jobsTable = sqliteTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    queueName: text("queue_name").notNull(),
    name: text("name").notNull(),
    payload: text("payload", { mode: "json" }).notNull(),
    options: text("options", { mode: "json" }).notNull(),
    returnValue: text("return_value", { mode: "json" }),
    logs: text("logs", { mode: "json" }).notNull(),
    progress: text("progress", { mode: "json" }).notNull(),

    status: text("status").$type<JobStatus>().notNull(),
    priority: integer("priority").default(0).notNull(),

    attemptsMade: integer("attempts_made").default(0).notNull(),
    // maxAttempts: integer('max_attempts').default(1).notNull(), // Removed, should be part of options

    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),
    delayUntil: integer("delay_until", { mode: "timestamp_ms" }),
    processedOn: integer("processed_on", { mode: "timestamp_ms" }),
    finishedOn: integer("finished_on", { mode: "timestamp_ms" }),
    // failedAt: integer('failed_at', { mode: 'timestamp_ms' }), // Redundant, finishedOn can mark end, and status is FAILED

    failedReason: text("failed_reason"),
    stacktrace: text("stacktrace", { mode: "json" }),

    // Fields from jobs.table.ts that are relevant for advanced queue features
    repeatJobKey: text("repeat_job_key"),
    parentId: text("parent_id"),

    workerId: text("worker_id"),
    lockUntil: integer("lock_until", { mode: "timestamp_ms" }),
  },
  (table) => ({
    queueStatusProcessAtPriorityIdx: index(
      "idx_jobs_queue_status_delay_until_priority"
    ).on(table.queueName, table.status, table.delayUntil, table.priority),
    statusIdx: index("idx_jobs_status").on(table.status),
    repeatKeyIdx: index("idx_jobs_repeat_key").on(table.repeatJobKey),
    lockedWorkerIdx: index("idx_jobs_worker_id").on(table.workerId),
    parentIdIdx: index("idx_jobs_parent_id").on(table.parentId),
    queueNameIdx: index("idx_jobs_queue_name").on(table.queueName),
  })
);

export const jobsRelations = relations(jobsTable, () => ({
  // define relations here if needed in the future
}));

export type JobInsert = typeof jobsTable.$inferInsert;
export type JobSelect = typeof jobsTable.$inferSelect;
