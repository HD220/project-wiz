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

    // Delay (milliseconds)
    delay: integer("delay").notNull().default(0),

    // Result (JSON string)
    result: text("result"),

    // Error info
    failureReason: text("failure_reason"),

    // Timestamps
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
    processedOn: integer("processed_on", { mode: "timestamp_ms" }),
    finishedOn: integer("finished_on", { mode: "timestamp_ms" }),
  },
  (table) => ({
    // Performance indexes
    queueStatusIdx: index("jobs_queue_status_idx").on(
      table.queueName,
      table.status,
      table.priority,
    ),
    statusIdx: index("jobs_status_idx").on(table.status),
    delayIdx: index("jobs_delay_idx").on(table.delay),
  }),
);

export type Job = typeof jobsTable.$inferSelect;
export type JobData = typeof jobsTable.$inferInsert;