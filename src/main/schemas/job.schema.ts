import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// Complete BullMQ-style job schema
export const jobsTable = sqliteTable(
  "jobs",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Queue name (BullMQ style)
    queueName: text("queue_name").notNull(),

    // Job data (JSON string)
    data: text("data").notNull(),

    // Job options (JSON string)  
    opts: text("opts"),

    // Job status
    status: text("status")
      .$type<"waiting" | "active" | "completed" | "failed" | "delayed">()
      .notNull()
      .default("waiting"),

    // Priority (higher = more priority)
    priority: integer("priority").notNull().default(0),

    // Retry attempts
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(3),

    // Delay duration in milliseconds (for retry backoff)
    delayMs: integer("delay_ms").notNull().default(0),

    // Timestamp when job should be processed (for delayed jobs)
    scheduledFor: integer("scheduled_for", { mode: "timestamp_ms" }),

    // Result (JSON string)
    result: text("result"),

    // Error info
    failureReason: text("failure_reason"),

    // Worker ID (for tracking which worker is processing)
    workerId: text("worker_id"),

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
    processedOn: integer("processed_on", { mode: "timestamp_ms" }),
    finishedOn: integer("finished_on", { mode: "timestamp_ms" }),
  },
  (table) => ({
    // Performance indexes for 1 worker, 15 concurrent jobs
    queueStatusIdx: index("jobs_queue_status_idx").on(
      table.queueName,
      table.status,
      table.priority,
    ),
    scheduledIdx: index("jobs_scheduled_idx").on(table.scheduledFor),
    workerIdx: index("jobs_worker_idx").on(table.workerId),
  }),
);

export type Job = typeof jobsTable.$inferSelect;
export type JobData = typeof jobsTable.$inferInsert;