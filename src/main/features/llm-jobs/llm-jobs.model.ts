import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const llmJobsTable = sqliteTable(
  "llm_jobs",
  {
    // Primary identifier
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    
    // Job identification
    name: text("name").notNull(), // Job type identifier (e.g., "process_message", "analyze_code")
    
    // Job content (BullMQ-style data)
    data: text("data").notNull(), // JSON string with job description and parameters
    opts: text("opts"), // JSON string with job options (delay, attempts, etc.)
    
    // Priority and status
    priority: integer("priority").notNull().default(0), // Higher number = higher priority
    status: text("status")
      .$type<"waiting" | "active" | "completed" | "failed" | "delayed" | "paused">()
      .notNull()
      .default("waiting"),
    
    // Processing information
    progress: integer("progress").notNull().default(0), // 0-100 progress percentage
    attempts: integer("attempts").notNull().default(0),
    maxAttempts: integer("max_attempts").notNull().default(3),
    delay: integer("delay").notNull().default(0), // Delay in milliseconds
    
    // Dependencies (BullMQ-style) - ONLY foreign key relationship
    parentJobId: text("parent_job_id").references((): any => llmJobsTable.id, { onDelete: "set null" }),
    dependencyCount: integer("dependency_count").notNull().default(0), // Number of dependencies remaining
    
    // Results
    result: text("result"), // JSON string with job result
    failureReason: text("failure_reason"),
    stacktrace: text("stacktrace"),
    
    // Timestamps (using unixepoch with subsec for high precision)
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
    processedOn: integer("processed_on", { mode: "timestamp_ms" }), // When job started processing
    finishedOn: integer("finished_on", { mode: "timestamp_ms" }), // When job finished (success or failure)
  },
  (table) => ({
    // Performance indexes for job queue processing (BullMQ-style)
    queueProcessingIdx: index("llm_jobs_queue_processing_idx").on(
      table.status,
      table.priority, // DESC ordering handled in queries
      table.createdAt,
    ),
    dependenciesIdx: index("llm_jobs_dependencies_idx").on(
      table.parentJobId,
      table.dependencyCount,
    ),
    delayedIdx: index("llm_jobs_delayed_idx").on(
      table.status,
      table.delay,
      table.createdAt,
    ),
    
    // Additional performance indexes
    statusIdx: index("llm_jobs_status_idx").on(table.status),
    nameIdx: index("llm_jobs_name_idx").on(table.name),
    createdAtIdx: index("llm_jobs_created_at_idx").on(table.createdAt),
    parentJobIdIdx: index("llm_jobs_parent_job_id_idx").on(table.parentJobId),
  }),
);

export type SelectLLMJob = typeof llmJobsTable.$inferSelect;
export type InsertLLMJob = typeof llmJobsTable.$inferInsert;
export type UpdateLLMJob = Partial<InsertLLMJob> & { id: string };

// Type-safe job status literals
export type JobStatus = "waiting" | "active" | "completed" | "failed" | "delayed" | "paused";

// Job data interfaces for type safety
export interface JobData {
  [key: string]: unknown;
}

export interface JobOptions {
  priority?: number;
  delay?: number;
  attempts?: number;
  [key: string]: unknown;
}

// Job result interface
export interface JobResult {
  [key: string]: unknown;
}