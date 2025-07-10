# BullMQ-Inspired Queue System with SQLite/Drizzle

## 1. Introduction

    - Purpose of this document: To outline the design for a job queue system inspired by BullMQ's features and API, but built using SQLite for persistence (via Drizzle ORM) instead of Redis.
    - Goals of the new queue system:
        - Provide a robust and reliable way to manage background tasks.
        - Offer a developer-friendly API similar to BullMQ for defining queues, adding jobs, and processing jobs with workers.
        - Ensure job persistence through SQLite.
        - Support common queueing features like delayed jobs, priorities, retries, and repeatable jobs.
    - Key differences from BullMQ:
        - **Backend:** SQLite/Drizzle instead of Redis. This impacts how certain features like atomic operations, blocking list pops, and real-time eventing are implemented.
        - **Scalability:** While aiming for robustness for an Electron application context, it won't target the same level of distributed scalability as a Redis-backed BullMQ setup.
        - **Scheduler Mechanism:** Features handled by BullMQ's `QueueScheduler` (like promoting delayed jobs, handling stalled jobs, processing repeatable jobs) will need to be implemented by a custom mechanism within our system, likely a periodic background task or service.

## 2. Core Concepts

This section defines the fundamental components of the queue system.

### 2.1. Job

- **Definition and Purpose:**
  A `Job` represents a single unit of work to be processed asynchronously. It contains all the information necessary for a `Worker` to execute the task. Jobs are added to a `Queue` and processed when a `Worker` becomes available.

- **Key Attributes:**
  - `id` (string, typically UUID): A unique identifier for the job.
  - `name` (string): A name for the type of job, used to associate it with specific processor logic (e.g., "send-email", "generate-report").
  - `data` (JSON/object, `TData`): The payload or input data required by the worker to process the job.
  - `opts` (JobOptions): An object containing various options that control how the job is handled (see below).
  - `status` (JobStatus): The current state of the job in its lifecycle (e.g., "pending", "active", "completed").
  - `progress` (number | object): Represents the completion progress of an active job (0-100 or custom object).
  - `returnValue` (JSON/object, `TResult`): The result returned by the worker upon successful completion.
  - `failedReason` (string): An error message or stack trace if the job failed.
  - `attemptsMade` (number): The number of times this job has been attempted.
  - `createdAt` (Date): Timestamp when the job was created.
  - `processedAt` (Date, optional): Timestamp when the job processing started.
  - `finishedAt` (Date, optional): Timestamp when the job was completed or finally failed.
  - `delay` (number, milliseconds): If set, the job will not be processed until this delay has passed from `createdAt` or a specified `processAt` time.
  - `timestamp` (Date): Timestamp of the last update to the job record. This is often the same as `createdAt` initially.
  - `logs` (string[] or JSON[]): Array to store logs specific to this job's execution.

- **Job Options (`opts` stored with the job, often derived from `JobOptions` at creation):**
  - `priority` (number): Jobs with lower numbers have higher priority. Default: 0 or a median value.
  - `delay` (number): Initial delay in milliseconds before the job can be processed.
  - `attempts` (number): Maximum number of times a job can be retried if it fails. Default: 1 (no retries).
  - `retryStrategy` (function or configuration): Defines the backoff strategy for retries (e.g., fixed, exponential).
    - Example: `(attemptsMade: number, error: Error) => number; // returns delay in ms`
    - Or: `{ type: 'fixed' | 'exponential', delay: number }`
  - `lifo` (boolean): If true, the job is added to the front of the queue (LIFO - Last In, First Out). Default: false (FIFO).
  - `jobId` (string): Custom job ID. If not provided, one will be generated.
  - `removeOnComplete` (boolean | number): If true, the job is removed from the system upon successful completion. If a number, keeps that many completed jobs. Default: false or a system-wide default.
  - `removeOnFail` (boolean | number): If true, the job is removed upon final failure (after all attempts). If a number, keeps that many failed jobs. Default: false or a system-wide default.
  - `repeat` (RepeatOptions): Configuration for repeatable jobs (e.g., cron string, interval).
    - `cron?: string;`
    - `every?: number; // milliseconds`
    - `limit?: number; // max number of repeats`
    - `startDate?: Date;`
    - `endDate?: Date;`
    - `tz?: string; // timezone`
  - `dependsOnJobIds` (string[]): An array of job IDs that must be completed before this job can be processed.
  - `parentId` (string, optional): The ID of a parent job, if this job is part of a flow or group.

- **Job Statuses (`JobStatus` - string enum/union type):**
  - `PENDING`: The job is waiting in the queue to be processed. (BullMQ equivalent: 'waiting')
  - `ACTIVE`: The job is currently being processed by a worker.
  - `COMPLETED`: The job has been processed successfully.
  - `FAILED`: The job processing failed, possibly after multiple attempts.
  - `DELAYED`: The job is scheduled to be processed at a future time.
  - `WAITING_CHILDREN`: The job is part of a flow and is waiting for its dependent child jobs to complete. (BullMQ equivalent: 'waiting-children')
  - `PRIORITIZED`: (Conceptually) A job that is in the 'pending' state but will be picked before others due to its priority. In implementation, this is usually handled by ordering queries on the 'pending' list.
  - `STALLED`: A job was `active` but the worker processing it is presumed to have crashed or the lock expired. Requires intervention by the Scheduler Service.

### 2.2. Queue

- **Definition and Purpose:**
  A `Queue` is a named collection of `Job`s that are waiting to be processed or are currently being processed. It acts as the primary interface for producers to add jobs and for the system to manage them. Each queue typically corresponds to a specific type of task or agent role.

- **Responsibilities (Conceptual and via its API):**
  - Receiving new jobs and adding them to persistent storage (SQLite) with appropriate options and initial status (e.g., `PENDING` or `DELAYED`).
  - Providing an interface for `Worker`s (or a `WorkerService`) to fetch the next available job according to priority, FIFO/LIFO, and delay constraints.
  - Managing (directly or indirectly via job methods) the state transitions of jobs (e.g., from `PENDING` to `ACTIVE`, `ACTIVE` to `COMPLETED`/`FAILED`).
  - Exposing methods for inspecting and managing jobs within the queue (e.g., getting job counts, retrieving specific jobs, removing jobs).
  - Emitting events related to job lifecycle changes within that queue.

### 2.3. Worker

- **Definition and Purpose:**
  A `Worker` is responsible for processing `Job`s from a specific `Queue`. It fetches a job, executes the defined processor function with the job's data, and reports the outcome (success or failure).

- **Processor Function:**
  An asynchronous function provided by the application developer that contains the actual logic for processing a job.
  - Signature: `async (job: Job<TData, TResult>) => Promise<TResult>`
  - The function receives the `Job` object, allowing it to access `job.data`, `job.id`, and call methods like `job.updateProgress()`.
  - It should return a result upon success or throw an error upon failure.

- **Concurrency:**
  A worker can be configured to process multiple jobs concurrently from the same queue, up to a specified limit. This is crucial for I/O-bound tasks. For CPU-bound tasks in Node.js, true parallelism often requires separate processes (sandboxed workers or child processes).

- **Lifecycle:**
  1.  **Initialization:** A worker instance is created, configured for a specific queue name and with a processor function.
  2.  **Start Processing:** The worker begins polling the queue for available jobs (respecting its concurrency settings).
  3.  **Job Execution:** When a job is fetched:
      - The job's status is typically moved to `ACTIVE`.
      - The processor function is invoked with the job.
      - The worker handles the outcome:
        - **Success:** Job status moved to `COMPLETED`, result stored.
        - **Failure:** Job status moved to `FAILED`, error stored. Retries are handled by the system (often orchestrated by the Scheduler Service or logic within the worker/queue).
  4.  **Stop/Shutdown:** The worker can be gracefully shut down, allowing currently active jobs to complete before exiting.

### 2.4. Scheduler Service (or Background Processor)

- **Definition and Purpose:**
  Since SQLite does not have the same built-in scheduling and eventing capabilities as Redis, a `Scheduler Service` (or a set of periodic background tasks) is required to handle time-based and state-management aspects of the queue system that would otherwise be managed by BullMQ's `QueueScheduler` or Redis features. This service would run periodically.

- **Responsibilities:**
  1.  **Promoting Delayed Jobs:**
      - Periodically scan for jobs with `status = 'DELAYED'` and `process_at <= NOW()`.
      - Move these jobs to `status = 'PENDING'` so they can be picked up by workers.
  2.  **Handling Stalled Jobs:**
      - Periodically scan for jobs with `status = 'ACTIVE'` where `lock_expires_at` has expired (i.e., `lock_expires_at < NOW()`).
      - Move these jobs back to `status = 'PENDING'` (for another attempt if retries are left) or to `status = 'FAILED'`. Increment attempt count.
  3.  **Managing Repeatable Jobs:**
      - Periodically scan for repeatable job definitions (either from a dedicated schedule table or from job options of completed/template repeatable jobs).
      - If a repeatable job is due to run (based on its cron schedule or interval and `next_run_at` time):
        - Create a new `Job` instance with `status = 'PENDING'`.
        - Update the repeatable job definition's `next_run_at` and `last_run_at` times.
  4.  **Orchestrating Retries with Backoff:**
      - While the worker might report a failure, the Scheduler Service could be responsible for calculating the next `process_at` time for a failed job based on its retry strategy and backoff options, then updating the job's status to `DELAYED` (or directly to `PENDING` if backoff is zero). Alternatively, this logic can be embedded within the `Queue` or `Worker`'s failure handling. A central scheduler is often cleaner for managing the `DELAYED` state.
  5.  **Checking Dependencies:**
      - Periodically scan for jobs with `status = 'WAITING_CHILDREN'`.
      - For each such job, check if all jobs listed in `dependsOnJobIds` have `status = 'COMPLETED'`.
      - If all dependencies are met, move the job to `status = 'PENDING'` (or `DELAYED` if it also has a future `process_at`).

This service would typically run in a loop with a defined interval (e.g., every few seconds or minutes, depending on the desired granularity).

## 3. Database Schema (SQLite with Drizzle)

This section outlines the proposed database schema for persisting jobs and related information using SQLite, managed by Drizzle ORM.

### 3.1. `jobs` Table

This is the primary table for storing all job details.

```typescript
// Drizzle Schema Definition (example)
import { text, integer, blob, sqliteTable } from "drizzle-orm/sqlite-core";

export const jobsTable = sqliteTable("jobs", {
  id: text("id").primaryKey(), // UUID, generated by application
  queueName: text("queue_name").notNull(), // Name of the queue this job belongs to
  jobName: text("job_name").notNull(), // Name/type of the job (e.g., 'sendEmail', 'processPayment')

  payload: blob("payload", { mode: "json" }), // Job data/input, stored as JSON

  status: text("status").notNull(), // JobStatus: PENDING, ACTIVE, COMPLETED, FAILED, DELAYED, WAITING_CHILDREN
  priority: integer("priority").default(0).notNull(), // Lower numbers are higher priority

  attemptsMade: integer("attempts_made").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(1).notNull(),

  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(), // Timestamp of job creation
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(), // Timestamp of last update
  processAt: integer("process_at", { mode: "timestamp_ms" }), // For DELAYED jobs: when it should be processed
  startedAt: integer("started_at", { mode: "timestamp_ms" }), // Timestamp when processing started
  completedAt: integer("completed_at", { mode: "timestamp_ms" }), // Timestamp when job completed successfully
  failedAt: integer("failed_at", { mode: "timestamp_ms" }), // Timestamp when job finally failed

  returnValue: blob("return_value", { mode: "json" }), // Result of successful job execution
  failedReason: text("failed_reason"), // Error message or stack trace for failed jobs

  progress: integer("progress").default(0), // Progress percentage (0-100)
  // progressData: blob('progress_data', { mode: 'json' }), // For more complex progress objects

  repeatJobKey: text("repeat_job_key"), // Identifier for the repeatable job configuration this instance belongs to

  dependsOnJobIds: blob("depends_on_job_ids", { mode: "json" }), // JSON array of job IDs as strings
  parentId: text("parent_id"), // ID of a parent job in a flow

  lockedByWorkerId: text("locked_by_worker_id"),
  lockExpiresAt: integer("lock_expires_at", { mode: "timestamp_ms" }), // Timestamp when the lock expires

  jobOptions: blob("job_options", { mode: "json" }), // Store the original job options for reference or complex logic

  executionLogs: blob("execution_logs", { mode: "json" }), // JSON array of log entries [{ timestamp, message, level }]
});

// Potential Indexes:
// CREATE INDEX idx_jobs_queue_status_process_at ON jobs (queueName, status, processAt, priority);
// CREATE INDEX idx_jobs_status ON jobs (status);
// CREATE INDEX idx_jobs_repeat_key ON jobs (repeatJobKey);
// CREATE INDEX idx_jobs_locked_worker_id ON jobs (lockedByWorkerId);
// CREATE INDEX idx_jobs_parent_id ON jobs (parentId);
```

**Column Explanations:**

- `id`: Primary Key, UUID.
- `queueName`: To partition jobs into different queues.
- `jobName`: For worker routing or descriptive purposes.
- `payload`: The actual data for the job, stored as a JSON blob.
- `status`: Current state of the job. An index on `(queueName, status, processAt, priority)` will be crucial.
- `priority`: Integer where a lower value means higher priority.
- `attemptsMade`: Number of times this job has been attempted.
- `maxAttempts`: Maximum allowed attempts.
- `createdAt`, `updatedAt`: Standard timestamps.
- `processAt`: For `DELAYED` jobs.
- `startedAt`, `completedAt`, `failedAt`: Lifecycle timestamps.
- `returnValue`: Result of successful job, as JSON.
- `failedReason`: Error message/stack for failed jobs.
- `progress`: Integer (0-100).
- `repeatJobKey`: Links to repeatable schedule if applicable.
- `dependsOnJobIds`: JSON array of job IDs this job depends on.
- `parentId`: ID of a parent job in a flow.
- `lockedByWorkerId`: ID of the worker currently processing this job.
- `lockExpiresAt`: Timestamp for lock expiry (stalled job detection).
- `jobOptions`: Original `JobOptions` at creation, as JSON.
- `executionLogs`: JSON array for job-specific logs.

### 3.2. `repeatable_job_schedules` Table (Optional but Recommended)

Manages schedules for repeatable jobs.

```typescript
// Drizzle Schema Definition (example)
import { text, integer, blob, sqliteTable } from "drizzle-orm/sqlite-core";

export const repeatableJobSchedulesTable = sqliteTable(
  "repeatable_job_schedules",
  {
    id: text("id").primaryKey(), // Unique key for this schedule, e.g., 'daily-report-email'
    queueName: text("queue_name").notNull(),
    jobName: text("job_name").notNull(),

    cronPattern: text("cron_pattern"), // e.g., '0 0 * * *'
    every: integer("every"), // Interval in milliseconds

    jobData: blob("job_data", { mode: "json" }),
    jobOptions: blob("job_options", { mode: "json" }),

    timezone: text("timezone").default("UTC"),
    limit: integer("limit"),
    startDate: integer("start_date", { mode: "timestamp_ms" }),
    endDate: integer("end_date", { mode: "timestamp_ms" }),

    nextRunAt: integer("next_run_at", { mode: "timestamp_ms" }).notNull(),
    lastRunJobId: text("last_run_job_id"),

    createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull(),

    isEnabled: integer("is_enabled", { mode: "boolean" })
      .default(true)
      .notNull(),
  },
);

// Potential Indexes:
// CREATE INDEX idx_repeatable_schedules_next_run ON repeatable_job_schedules (isEnabled, nextRunAt);
```

The Scheduler Service uses this table to create new job instances in the `jobs` table.

### 3.3. `job_dependencies` Table (Alternative for `dependsOnJobIds`)

For a more relational approach to job dependencies.

```typescript
// Drizzle Schema Definition (example)
import { text, integer, blob, sqliteTable } from "drizzle-orm/sqlite-core";
// import { jobsTable } from './jobs-table-schema-file'; // Assuming jobsTable is in its own file

export const jobDependenciesTable = sqliteTable(
  "job_dependencies",
  {
    jobId: text("job_id").notNull(), // .references(() => jobsTable.id, { onDelete: 'cascade' }), // FK if jobsTable imported
    dependsOnJobId: text("depends_on_job_id").notNull(), // .references(() => jobsTable.id, { onDelete: 'cascade' }), // FK
  },
  (table) => {
    return {
      // Drizzle ORM syntax for composite primary key
      pk: sqliteTable.primaryKey({
        name: "job_dependencies_pk",
        columns: [table.jobId, table.dependsOnJobId],
      }),
    };
  },
);
// Note: Foreign key references would require jobsTable to be defined/imported.
// For this documentation, the FKs are commented out but should be implemented.

// Potential Indexes:
// CREATE INDEX idx_job_dependencies_job_id ON job_dependencies (jobId);
// CREATE INDEX idx_job_dependencies_depends_on_id ON job_dependencies (dependsOnJobId);
```

**Choice of Dependency Storage:**

- **JSON Array (`dependsOnJobIds` in `jobs` table):** Simpler for basic cases.
- **`job_dependencies` Table:** More normalized, better for complex queries if needed.
  For initial design, JSON array in `jobs` table is acceptable.

## 4. API Design (TypeScript)

This section details the public API for interacting with the queue system, including creating queues, adding jobs, and processing jobs. The API aims for a developer experience similar to BullMQ.

### 4.1. `Job<TData, TResult>` Interface/Class

Represents a job instance. It will likely be an interface implemented by a class that an ORM like Drizzle would hydrate, or a class that wraps a plain data object from the database.

```typescript
// Shared types (could be in a separate types.ts file)
export type JobId = string;
export type JobStatus =
  | "PENDING"
  | "ACTIVE"
  | "COMPLETED"
  | "FAILED"
  | "DELAYED"
  | "WAITING_CHILDREN";
export type JobEventType =
  | "job.added"
  | "job.active"
  | "job.completed"
  | "job.failed"
  | "job.progress"
  | "job.stalled"
  | "job.delayed" // When a job is explicitly delayed or re-delayed for retry
  | "job.promoted" // When a delayed job becomes pending
  | "job.removed"
  | "job.log_added"
  | "queue.paused"
  | "queue.resumed"
  | "worker.error";
// Consider also: 'job.waiting_children', 'job.dependencies_completed'

export interface JobOptions {
  priority?: number;
  delay?: number; // milliseconds
  attempts?: number; // Max attempts
  retryStrategy?: (
    attemptsMade: number,
    error: Error,
  ) => Promise<number | false>; // Return delay in ms, or false to not retry
  backoff?: { type: "fixed" | "exponential"; delay: number }; // Simpler alternative to retryStrategy
  lifo?: boolean;
  jobId?: JobId; // Custom job ID
  removeOnComplete?: boolean | number; // true or keep N most recent
  removeOnFail?: boolean | number; // true or keep N most recent
  repeat?: RepeatOptions;
  dependsOnJobIds?: JobId[];
  parentId?: JobId;
  timeout?: number; // Max processing time in ms for a single attempt
}

export interface RepeatOptions {
  cron?: string;
  every?: number; // milliseconds
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  tz?: string;
  // immediate?: boolean; // Whether to run immediately upon adding a repeatable job
}

export interface JobLog {
  timestamp: number;
  message: string;
  level?: "info" | "warn" | "error"; // Optional log level
}

// --- Job Interface/Class ---
export interface Job<TData = any, TResult = any> {
  id: JobId;
  name: string; // The 'type' of job, e.g., 'sendEmail'
  queueName: string;
  data: TData;
  opts: JobOptions; // The options this job was created with

  status: JobStatus;
  progress: number | object; // Can be a percentage or a JSON object
  returnValue?: TResult;
  failedReason?: string; // Error message or stack trace

  attemptsMade: number;
  createdAt: Date;
  processedAt?: Date;
  finishedAt?: Date;
  processAt?: Date; // When a delayed job is set to be processed

  // For active jobs being processed by a worker
  lockedByWorkerId?: string;
  lockExpiresAt?: Date;

  // For repeatable jobs
  repeatJobKey?: string;

  // For flows/dependencies
  dependsOnJobIds?: JobId[];
  parentId?: JobId;

  executionLogs: JobLog[];

  // --- Methods available on a Job instance (especially when handled by a worker) ---

  /** Updates the progress of the job. Emits a 'progress' event. */
  updateProgress(progress: number | object): Promise<void>;

  /** Adds a log entry to the job. Emits a 'log_added' event. */
  log(message: string, level?: JobLog["level"]): Promise<void>;

  /**
   * Moves the job to the 'COMPLETED' state.
   * Called internally by the Worker upon successful processing.
   * @param result The return value of the job.
   */
  moveToCompleted(
    result: TResult,
    opts: { removeOnComplete?: boolean | number },
  ): Promise<void>;

  /**
   * Moves the job to the 'FAILED' state.
   * Called internally by the Worker upon failed processing.
   * If retries are configured and attempts are left, it might be moved to 'DELAYED' or 'PENDING'.
   * @param error The error that caused the failure.
   * @param allowRetry Whether to attempt a retry if configured.
   */
  moveToFailed(
    error: Error,
    allowRetry: boolean,
    opts: { removeOnFail?: boolean | number },
  ): Promise<void>;

  /** Promote a delayed job to pending state. */
  promote(): Promise<void>; // Moves from DELAYED to PENDING

  /** Retries a failed job immediately if attempts are left. */
  retry(options?: { isManualRetry?: boolean }): Promise<void>; // Moves from FAILED to PENDING/DELAYED
}
```

### 4.2. `Queue<TData, TResult>` Class (Producer and Management API)

This class is used to create and manage a specific queue and to add jobs to it.

```typescript
import { EventEmitter } from "events"; // Or a custom event emitter solution
// Assume DrizzleClient is the type for the Drizzle DB instance
// type DrizzleClient = any;

export class JobEventEmitter extends EventEmitter {
  // Can add specific typed methods if needed
}

export class Queue<TData = any, TResult = any> {
  public readonly name: string;
  private db: any; // DrizzleClient type. Consider making this property accessible for Worker if not injecting DB separately.
  private eventEmitter: JobEventEmitter; // Consider making this property accessible.

  constructor(
    queueName: string,
    dbConnection: any /*DrizzleClient*/,
    eventEmitter: JobEventEmitter,
  ) {
    this.name = queueName;
    this.db = dbConnection;
    this.eventEmitter = eventEmitter;
  }

  async add(
    jobName: string,
    data: TData,
    opts?: JobOptions,
  ): Promise<Job<TData, TResult>> {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  async addBulk(
    jobs: { name: string; data: TData; opts?: JobOptions }[],
  ): Promise<Job<TData, TResult>[]> {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  async getJob(jobId: JobId): Promise<Job<TData, TResult> | null> {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  async getJobs(
    statuses: JobStatus[],
    start: number = 0,
    end: number = -1,
    asc: boolean = false,
  ): Promise<Job<TData, TResult>[]> {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  async getJobCounts(): Promise<
    { [status in JobStatus]?: number } & { waiting?: number }
  > {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  async removeJob(jobId: JobId): Promise<void> {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  async clean(
    gracePeriod: number,
    status: JobStatus = "COMPLETED",
    limit: number = 0,
  ): Promise<JobId[]> {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  async empty(): Promise<void> {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  async pause(): Promise<void> {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  async resume(): Promise<void> {
    // Implementation placeholder
    throw new Error("Not implemented");
  }

  on(
    event: JobEventType,
    listener: (jobOrJobId: JobId | Job<TData, TResult>, ...args: any[]) => void,
  ): this {
    const queueSpecificListener = (qn: string, jId: JobId, ...args: any[]) => {
      if (qn === this.name) {
        // Potentially fetch the job object if only ID is provided by global emitter for some events
        listener(jId, ...args);
      }
    };
    this.eventEmitter.on(event, queueSpecificListener);
    return this;
  }

  async close(): Promise<void> {
    this.eventEmitter.removeAllListeners(); // Example cleanup
  }
}
```

### 4.3. `Worker<TData, TResult>` Class (Consumer API)

This class processes jobs from a specific queue. Reflecting user feedback, the constructor takes a `Queue` instance.

```typescript
// type DrizzleClient = any; // Shared Drizzle client instance

export interface WorkerOptions {
  concurrency?: number;
  lockDuration?: number; // Milliseconds a job can be locked by this worker before considered stalled
  lockRenewTime?: number; // Milliseconds before lock expiration to attempt renewal
  autorun?: boolean; // Start processing immediately upon instantiation. Default: true
  // db?: DrizzleClient; // Allow explicit DB override
  // eventEmitter?: JobEventEmitter; // Allow explicit emitter override
}

export type ProcessorFunction<TData, TResult> = (
  job: Job<TData, TResult>,
) => Promise<TResult>;

export class Worker<TData = any, TResult = any> {
  public readonly queueName: string;
  private queueInstance: Queue<TData, TResult>; // Store the queue instance
  private processor: ProcessorFunction<TData, TResult>;
  private opts: Required<WorkerOptions>;
  private db: any; // DrizzleClient
  private eventEmitter: JobEventEmitter;
  private isRunning: boolean = false;
  private isClosing: boolean = false;
  private activeJobs: number = 0;
  private workerId: string;

  constructor(
    queue: Queue<TData, TResult>, // Takes Queue instance directly
    processor: ProcessorFunction<TData, TResult>,
    opts?: WorkerOptions,
  ) {
    this.queueInstance = queue;
    this.queueName = queue.name;
    this.processor = processor;

    // Access db and eventEmitter from queue instance, assuming they are public or have getters.
    // This requires Queue to expose these, or Worker needs them injected separately.
    // For design, we assume Queue class makes these available.
    this.db = (this.queueInstance as any).db; // Needs proper accessor or injection
    this.eventEmitter = (this.queueInstance as any).eventEmitter; // Needs proper accessor or injection

    this.opts = {
      concurrency: 1,
      lockDuration: 30000, // Default 30 seconds
      lockRenewTime: 15000, // Default 15 seconds (renew halfway)
      autorun: true,
      ...(opts || {}), // Ensure opts is not undefined before spreading
      // db: opts?.db || (this.queueInstance as any).db, // Prioritize opts, then queue, then error
      // eventEmitter: opts?.eventEmitter || (this.queueInstance as any).eventEmitter,
    };

    this.workerId = `worker-${Math.random().toString(36).substring(2, 10)}`;

    if (!this.db || !this.eventEmitter) {
      throw new Error(
        "Worker requires dbConnection and eventEmitter. Ensure they are accessible via the Queue instance or provided in options.",
      );
    }

    if (this.opts.autorun) {
      this.run();
    }
  }

  /** Starts polling for and processing jobs if not already running. */
  run(): void {
    if (this.isRunning || this.isClosing) {
      return;
    }
    this.isRunning = true;
    for (let i = 0; i < this.opts.concurrency; i++) {
      this.poll();
    }
  }

  private async poll(): Promise<void> {
    while (this.isRunning && !this.isClosing) {
      let job: Job<TData, TResult> | null = null;
      try {
        // Only try to fetch if we have capacity (this check is actually implicitly handled by the loop structure)
        // if (this.activeJobs < this.opts.concurrency) { // This condition is managed by the number of poll() calls
        job = await this.fetchNextJob();
        if (job) {
          this.activeJobs++;
          // No await here, let processJobInternal run without blocking the poll loop of this "slot"
          // from eventually trying to fetch another job once this one is done.
          // The concurrency is managed by how many poll() loops are running.
          this.processJobInternal(job).finally(() => {
            this.activeJobs--;
          });
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        // } else { // Max concurrency for this worker instance reached by other poll() calls.
        //   await new Promise(resolve => setTimeout(resolve, 100));
        // }
      } catch (error) {
        console.error(
          `Worker ${this.workerId} error in poll loop for queue ${this.queueName}:`,
          error,
        );
        this.eventEmitter.emit(
          "worker.error",
          this.queueName,
          this.workerId,
          error as Error,
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
      // No finally here to decrement activeJobs, it's done in processJobInternal's finally.
    }
  }

  private async fetchNextJob(): Promise<Job<TData, TResult> | null> {
    // DB logic to fetch and lock job for this.queueName
    throw new Error("Not implemented: fetchNextJob");
  }

  private async processJobInternal(job: Job<TData, TResult>): Promise<void> {
    this.eventEmitter.emit("job.active", this.queueName, job.id, job);
    let renewLockIntervalId: NodeJS.Timeout | undefined;

    try {
      if (
        this.opts.lockDuration > 0 &&
        this.opts.lockRenewTime > 0 &&
        this.opts.lockRenewTime < this.opts.lockDuration
      ) {
        renewLockIntervalId = setInterval(async () => {
          try {
            // DB UPDATE jobs SET lockExpiresAt = NOW() + lockDuration
            // WHERE id = job.id AND lockedByWorkerId = this.workerId AND status = 'ACTIVE'
            console.log(
              `Worker ${this.workerId} renewing lock for job ${job.id}`,
            );
          } catch (err) {
            console.error(
              `Worker ${this.workerId} failed to renew lock for job ${job.id}:`,
              err,
            );
            if (renewLockIntervalId) clearInterval(renewLockIntervalId);
          }
        }, this.opts.lockRenewTime);
      }

      const result = await this.processor(job);

      if (
        this.isClosing ||
        (renewLockIntervalId && !(await this.hasLock(job.id)))
      ) {
        if (renewLockIntervalId) clearInterval(renewLockIntervalId);
        return;
      }
      // await job.moveToCompleted(result, { removeOnComplete: job.opts.removeOnComplete });
      this.eventEmitter.emit("job.completed", this.queueName, job.id, result);
    } catch (error: any) {
      if (this.isClosing) return;
      // await job.moveToFailed(error, true, { removeOnFail: job.opts.removeOnFail });
      this.eventEmitter.emit("job.failed", this.queueName, job.id, error);
    } finally {
      if (renewLockIntervalId) {
        clearInterval(renewLockIntervalId);
      }
    }
  }

  private async hasLock(jobId: JobId): Promise<boolean> {
    return true; // Placeholder
  }

  async close(force: boolean = false): Promise<void> {
    if (this.isClosing) return;
    this.isClosing = true;
    this.isRunning = false;
    console.log(
      `Worker ${this.workerId} for queue ${this.queueName} closing... Active jobs: ${this.activeJobs}`,
    );
  }
}
```

### 4.4. `JobEventEmitter` (Conceptual)

A global or per-queue event emitter instance (e.g., using Node.js `EventEmitter`) responsible for broadcasting job and queue lifecycle events.

```typescript
// Example usage:
// const globalJobEvents = new JobEventEmitter();
//
// myQueue.on('job.completed', (jobId, result) => { console.log(`Job ${jobId} completed!`); });
//
// // Inside Queue.add():
// // this.eventEmitter.emit('job.added', this.name, newJob.id, newJob);
//
// // Inside Worker.processJobInternal() success:
// // this.eventEmitter.emit('job.completed', this.queueName, job.id, result);
```

## 5. Job Lifecycle and State Transitions

A job progresses through several states from its creation to its final resolution (completed or failed). The `status` field in the `jobs` table tracks the current state.

**States:**

- `PENDING`: The job has been added to the queue and is awaiting processing. This is the initial state for most jobs unless created with a delay or as a child of a flow.
- `DELAYED`: The job is scheduled to be processed at a future time (`processAt` > NOW).
- `WAITING_CHILDREN`: The job has dependencies (defined in `dependsOnJobIds`) that have not yet completed.
- `ACTIVE`: A worker has fetched the job and is currently executing its processor function. The job is locked by the worker (`lockedByWorkerId`, `lockExpiresAt`).
- `COMPLETED`: The processor function finished successfully. The `returnValue` is stored.
- `FAILED`: The processor function threw an error, or the job exceeded its maximum attempts. The `failedReason` is stored.
- `STALLED`: A job was `ACTIVE`, but its lock expired before completion (e.g., worker crashed). The Scheduler Service is responsible for detecting and handling stalled jobs.

**Primary Transitions:**

1.  **Creation:**
    - `Queue.add()` -> `PENDING` (if no delay or dependencies)
    - `Queue.add()` with `opts.delay` or future `processAt` -> `DELAYED`
    - `Queue.add()` with `opts.dependsOnJobIds` -> `WAITING_CHILDREN` (if dependencies not yet met) or `PENDING`/`DELAYED` (if dependencies already met).

2.  **From `PENDING`:**
    - `Worker.fetchNextJob()` -> `ACTIVE` (Worker locks the job, increments `attemptsMade` if first attempt for this "round", sets `startedAt`, `lockedByWorkerId`, `lockExpiresAt`)

3.  **From `DELAYED`:**
    - `Scheduler Service` (when `processAt <= NOW()`) -> `PENDING` (Job is promoted. Event: `job.promoted`)

4.  **From `WAITING_CHILDREN`:**
    - `Scheduler Service` (when all dependencies in `dependsOnJobIds` are `COMPLETED`) -> `PENDING` (or `DELAYED` if `processAt` is still in the future. Event: `job.dependencies_completed` then `job.promoted` or `job.added` effectively)

5.  **From `ACTIVE`:**
    - Processor success -> `COMPLETED` (Worker updates status, stores `returnValue`, sets `finishedAt`. Event: `job.completed`)
    - Processor error:
      - If `attemptsMade < maxAttempts`:
        - Calculate retry delay using `retryStrategy` or `backoff`.
        - -> `DELAYED` (with new `processAt`. Event: `job.failed`, then `job.delayed` for retry)
        - OR -> `PENDING` (if retry delay is 0. Event: `job.failed`, then effectively `job.promoted`)
      - If `attemptsMade >= maxAttempts`:
        - -> `FAILED` (Worker/Scheduler updates status, stores `failedReason`, sets `finishedAt`. Event: `job.failed` - final)
    - Lock expires (`lockExpiresAt < NOW()`) before completion:
      - `Scheduler Service` detects -> `STALLED` (Conceptually, then immediately handled)
      - `Scheduler Service` handles stalled job:
        - If `attemptsMade < maxAttempts`: -> `PENDING` (for another worker to pick up)
        - Else: -> `FAILED`
        - Event: `job.stalled`, then potentially `job.failed`.

**Visual Representation (Simplified):**

```
           ┌───────────────┐
           │ Job Added     ├─────────────────────┐
           └─────┬─────────┘                     │
                 │                               │
                 │ opts.delay > 0 ||             │
                 │ opts.dependsOnJobIds          │
                 ▼                               │
┌──────────┐   ┌───────────┐   ┌─────────────────┴───┐   ┌───────────┐
│ DELAYED  │──▶│  PENDING  │──▶│ WAITING_CHILDREN    │──▶│  PENDING  │ (if deps met & no delay)
└─┬───────▲┘   └─────┬─────┘   └──────────┬──────────┘   └─────┬─────┘
  │       │          │ Worker             │ Scheduler            │ Worker
  │promote│          │ fetches            │ (deps met)           │ fetches
  │       │          │                    │                      │
  │Scheduler Service │                    │                      │
  └───────┘          ▼                    ▼                      ▼
                 ┌──────────┐         ┌──────────┐
                 │  ACTIVE  │◀───┐   │ STALLED  │ (transient)
                 └─────┬────┘    │   └─────┬────┘
                       │         │ Retry   │ Scheduler
           Process OK  │         │         │ (lock expired)
                       │         │         │
                       ▼         │         ▼
                 ┌───────────┐   │   ┌──────────┐
                 │ COMPLETED │   └───┤  FAILED  │ (final or retry)
                 └───────────┘       └─────┬────┘
                                           │
                                           │ No more retries
                                           ▼
                                     (Job remains FAILED)
```

**Notes on State Transitions:**

- All state changes should update the `updatedAt` timestamp on the job record.
- The `Scheduler Service` plays a key role in managing time-based transitions and recovering from potential worker failures (stalled jobs).
- Retries typically involve moving a job from `ACTIVE` (upon failure) back to `DELAYED` (for backoff) or `PENDING`.
- Jobs marked for `removeOnComplete` or `removeOnFail` would be deleted from the database after their final state is reached and events are emitted. This can be handled by the worker after processing or by the Scheduler Service during a cleanup phase.

## 6. Event Handling Mechanism

The queue system will emit events at various points in a job's lifecycle and for queue-level changes. This allows other parts of the application to react to these events.

**6.1. Event Emitter (`JobEventEmitter`)**

- A central event emitter instance (e.g., extending Node.js `EventEmitter`) will be used. This emitter will be passed to `Queue` and `Worker` instances upon creation, or accessed via a shared context/DI.
- `JobEventEmitter` signature:
  ```typescript
  export class JobEventEmitter extends EventEmitter {
    // Standard EventEmitter methods: on, off, emit, once, etc.
    // We can add typed wrappers if desired for specific events.
    public emit(
      event: JobEventType,
      queueName: string,
      jobId: JobId,
      ...args: any[]
    ): boolean {
      return super.emit(event, queueName, jobId, ...args);
    }
    // Overload for queue-level events that don't have a jobId
    public emit(
      event: JobEventType,
      queueName: string,
      ...args: any[]
    ): boolean {
      return super.emit(event, queueName, ...args);
    }
  }
  ```

**6.2. Emitted Events and Payloads**

The following events will be emitted. Listeners will typically receive `queueName`, `jobId`, and event-specific data.

- **`job.added`**:
  - Emitted when a job is successfully added to a queue.
  - Payload: `(queueName: string, jobId: JobId, job: Job<any, any>)`
- **`job.active`**:
  - Emitted when a worker starts processing a job.
  - Payload: `(queueName: string, jobId: JobId, job: Job<any, any>)` (job might be a partial representation initially)
- **`job.completed`**:
  - Emitted when a job finishes successfully.
  - Payload: `(queueName: string, jobId: JobId, result: any, job?: Job<any,any>)` (full job optional)
- **`job.failed`**:
  - Emitted when a job fails (either an attempt or its final failure).
  - Payload: `(queueName: string, jobId: JobId, error: Error, job?: Job<any,any>)`
  - A distinction for "final failure" vs "attempt failure" might be useful, possibly by adding a flag to the payload or a separate event like `job.attempt_failed`.
- **`job.progress`**:
  - Emitted when `job.updateProgress()` is called by a worker.
  - Payload: `(queueName: string, jobId: JobId, progress: number | object)`
- **`job.stalled`**:
  - Emitted by the Scheduler Service when an active job's lock expires and it's moved back to pending or failed.
  - Payload: `(queueName: string, jobId: JobId)`
- **`job.delayed`**:
  - Emitted when a job is set to be processed at a future time (either initially, or for a retry).
  - Payload: `(queueName: string, jobId: JobId, delayUntil: number)` (timestamp)
- **`job.promoted`**:
  - Emitted by the Scheduler Service when a delayed job becomes `PENDING`.
  - Payload: `(queueName: string, jobId: JobId)`
- **`job.removed`**:
  - Emitted when a job is explicitly removed from the queue.
  - Payload: `(queueName: string, jobId: JobId)`
- **`job.log_added`**:
  - Emitted when `job.log()` is called.
  - Payload: `(queueName: string, jobId: JobId, logEntry: JobLog)`

- **Queue-Level Events:**
  - **`queue.paused`**:
    - Emitted when `Queue.pause()` is called.
    - Payload: `(queueName: string)`
  - **`queue.resumed`**:
    - Emitted when `Queue.resume()` is called.
    - Payload: `(queueName: string)`

- **Worker-Level Events (emitted by Worker instances, can be relayed by global emitter with workerId):**
  - **`worker.error`**:
    - Emitted when a worker encounters an internal error not specific to a job (e.g., database connection issue during polling).
    - Payload: `(queueName: string, workerId: string, error: Error)`
  - `worker.drained` (Consider BullMQ's `drained` event for a worker, meaning no more jobs in the _wait_ or _delayed_ state for that queue that the worker can process right now. This might be complex to implement reliably without Redis's list operations). For now, this is lower priority.

**6.3. Listening to Events**

- The `Queue` class will provide an `on()` method as a convenience to listen to events filtered for that specific queue.
  ```typescript
  const myQueue = new Queue("email-queue", db, jobEmitter);
  myQueue.on("job.completed", (jobId, result) => {
    console.log(`Job ${jobId} in email-queue completed with`, result);
  });
  ```
- Direct subscription on the `JobEventEmitter` instance allows listening to events from all queues or specific global events.
  ```typescript
  jobEmitter.on("job.failed", (queueName, jobId, error) => {
    console.error(`Job ${jobId} in queue ${queueName} failed:`, error);
  });
  ```

**6.4. Implementation Notes for SQLite Backend**

- Unlike BullMQ which uses Redis Pub/Sub or Streams for robust eventing across processes, an in-memory Node.js `EventEmitter` is simpler for a single-process Electron application (main process hosting the queue logic).
- If workers are implemented as truly separate child processes or Worker Threads, a more robust IPC mechanism (like Electron's built-in IPC or Node.js `process.send/on('message')`) would be needed to propagate events from those worker processes back to the main process where the global `JobEventEmitter` would reside. For the initial design, we assume workers operate within the scope where they can access the shared `JobEventEmitter`.
- Events are "fire-and-forget" with an in-memory emitter. If event persistence or guaranteed delivery across restarts is needed, an "events" table in SQLite could be considered, though this adds complexity. For most use cases of reacting to job state changes within the running application, an in-memory emitter is sufficient.

## 7. Scheduler Service Implementation Details

The `Scheduler Service` is a critical component for managing time-based job state transitions and ensuring queue health in a SQLite-backed system. It would typically run as a background process or a recurring task within the main application process.

**7.1. Core Responsibilities & Logic:**

- **Polling Interval:** The service will operate on a configurable polling interval (e.g., every 1-5 seconds). A shorter interval means more responsive job promotions and stall detection but higher DB load.

- **Promoting Delayed Jobs:**
  - **Query:** `SELECT id FROM jobs WHERE status = 'DELAYED' AND processAt <= ?` (current timestamp).
  - **Action:** For each job found, update its status to `PENDING` and `processAt` to `NULL`. Emit `job.promoted`.
  - This needs to be done atomically per job if possible, or in batches with care.

- **Handling Stalled Jobs:**
  - **Query:** `SELECT id, attemptsMade, maxAttempts, jobOptions FROM jobs WHERE status = 'ACTIVE' AND lockExpiresAt < ?` (current timestamp).
  - **Action:** For each stalled job:
    - Increment `attemptsMade`.
    - If `attemptsMade >= maxAttempts`:
      - Update status to `FAILED`, set `failedReason` to "Stalled after lock expiration", set `finishedAt`. Emit `job.stalled` then `job.failed`.
    - Else (retries left):
      - Calculate next `processAt` based on `retryStrategy` or `backoff` options (from `jobOptions`).
      - Update status to `DELAYED` (or `PENDING` if no backoff), update `processAt`, clear `lockedByWorkerId` and `lockExpiresAt`. Emit `job.stalled` then `job.delayed` or `job.promoted`.
  - **Locking:** Ensure this process doesn't interfere with workers trying to renew locks. The check `lockExpiresAt < NOW()` is key.

- **Managing Repeatable Jobs (if `repeatable_job_schedules` table is used):**
  - **Query:** `SELECT * FROM repeatable_job_schedules WHERE isEnabled = true AND nextRunAt <= ?` (current timestamp).
  - **Action:** For each due schedule:
    1.  Create a new job in the `jobs` table:
        - `queueName`, `jobName`, `payload` (from `jobData` in schedule), `jobOptions` (merged from schedule).
        - Initial status: `PENDING` (or `DELAYED` if the schedule's job options specify a delay).
        - `repeatJobKey`: schedule's `id`.
    2.  Calculate the _next_ `nextRunAt` for the schedule based on its `cronPattern` or `every` interval.
        - If `limit` is reached, disable or delete the schedule.
    3.  Update the `repeatable_job_schedules` entry with the new `nextRunAt` and `lastRunJobId`.
    4.  This should be done in a transaction to ensure consistency.

- **Checking Dependencies (for `WAITING_CHILDREN` jobs):**
  - **Query:** `SELECT id, dependsOnJobIds FROM jobs WHERE status = 'WAITING_CHILDREN'`.
  - **Action:** For each such job:
    1.  Parse `dependsOnJobIds`.
    2.  Query the `jobs` table to get the statuses of all dependent job IDs.
    3.  If all dependent jobs have `status = 'COMPLETED'`:
        - Update the current job's status to `PENDING` (or `DELAYED` if its `processAt` is in the future).
        - Emit `job.dependencies_completed` (custom event) then `job.promoted` or equivalent.

**7.2. Concurrency and Atomicity:**

- The Scheduler Service's operations on the `jobs` table must be designed carefully to avoid race conditions with `Worker` instances that are also reading and writing to this table.
- Using transactions for state updates is crucial.
- The logic for selecting and updating jobs (e.g., promoting delayed jobs) should ideally fetch and update in a way that prevents processing the same job multiple times if multiple scheduler instances were ever run (though for Electron, it's likely a single instance).

**7.3. Error Handling:**

- The Scheduler Service itself should be robust, with comprehensive logging and error handling for its database operations.

## 8. Error Handling and Retries (Job Processing)

This section details how errors during job processing are handled and how retries are managed.

- **Error Capturing:** The `Worker`'s `processJobInternal` method will wrap the execution of the user-provided `processor` function in a try-catch block.
- **Immediate Failure:** If the `processor` throws an error:
  1.  The error is caught.
  2.  The `Job` instance's `attemptsMade` is incremented (this should happen when the job is fetched for an attempt, or upon failure before retry logic).
  3.  The `failedReason` on the `Job` is set to the error message/stack.
  4.  The `job.failed` event is emitted with the job ID and the error.
- **Retry Logic (Orchestrated by Worker's failure handler or Job's `moveToFailed` method):**
  1.  **Check Attempts:** If `job.attemptsMade < job.opts.attempts` (or a default max attempts from `jobOptions`):
      - **Calculate Delay:**
        - If `job.opts.retryStrategy` (custom function) is defined, it's called with `(attemptsMade, error)` and should return a promise resolving to the delay in milliseconds, or `false` to not retry.
        - If `job.opts.backoff` is defined (e.g., `{ type: 'exponential', delay: 1000 }`), calculate delay: `baseDelay * Math.pow(2, attemptsMade - 1)`.
        - If neither, a default fixed delay might apply, or immediate retry (delay = 0).
      - **Update Job for Retry (DB Operation):**
        - Set `status` to `DELAYED`.
        - Set `processAt` to `Date.now() + calculatedDelay`.
        - Clear `lockedByWorkerId` and `lockExpiresAt`.
        - The job's `updatedAt` timestamp is updated.
        - The `job.delayed` event (or a specific `job.retry_scheduled`) could be emitted.
      - If calculated delay is 0, status can be set directly to `PENDING`.
  2.  **No More Attempts:** If `job.attemptsMade >= job.opts.attempts`:
      - The job's `status` is set to `FAILED` (final).
      - `finishedAt` timestamp is set.
      - The `job.failed` event (signaling final failure) is emitted.
      - `removeOnFail` option is considered for cleanup by the Scheduler or Worker.
- **Job Timeout:** If `job.opts.timeout` is specified, the `Worker`'s `processJobInternal` method should implement a mechanism (e.g., `Promise.race` with a timer wrapped around `this.processor(job)`) to abort processing if it exceeds this duration. If it times out, it's treated as a job failure and goes through the retry logic.
- **Manual Retry:** The API (`Queue.retryJob(jobId: JobId)`) can allow manual retrying of a `FAILED` job. This would typically reset `attemptsMade` to 0 (or not, depending on policy), clear `failedReason`, and move the job to `PENDING` or `DELAYED`.

## 9. Implementation Considerations for SQLite/Drizzle

Using SQLite with Drizzle presents specific considerations compared to Redis-based systems like BullMQ.

- **Atomicity:** All operations that modify job state and potentially related data (like releasing a lock and setting a new status) MUST be performed within database transactions to ensure consistency. Drizzle ORM supports transactions.
- **Job Fetching by Workers (`fetchNextJob`):**
  - This is a critical path. The query needs to select an available job (`status = 'PENDING'`, `processAt <= NOW()`) respecting `queueName`, `priority`, and `lifo`/`fifo` order.
  - **Locking:** To prevent multiple workers from picking up the same job:
    1.  The `fetchNextJob` operation should, within a transaction:
        a. Select a suitable job ID.
        b. Attempt to update that job: set `status` to `ACTIVE`, `lockedByWorkerId` to the current worker's ID, `lockExpiresAt` to `NOW() + lockDuration`, increment `attemptsMade`, set `startedAt`. The `WHERE` clause for the update must ensure it only updates if the job is still in the expected state (e.g., `status = 'PENDING'` and `id = selectedId`).
        c. If the update affects 1 row, the lock is acquired. Fetch the full job data.
        d. If 0 rows affected, another worker got it; retry fetching.
    2.  SQLite's default transaction isolation level (`SERIALIZABLE`) helps. `PRAGMA busy_timeout` can be useful.
- **Lock Renewal:** Active jobs with long processing times need their locks renewed. The worker responsible for the job periodically updates `lockExpiresAt` for its active job: `UPDATE jobs SET lockExpiresAt = ? WHERE id = ? AND lockedByWorkerId = ? AND status = 'ACTIVE'`. If the update affects 0 rows, the lock was lost (e.g., scheduler marked as stalled).
- **Indexing:** Proper indexing is vital for performance:
  - `(queueName, status, processAt, priority)`: For fetching next available jobs.
  - `(status, lockExpiresAt)`: For the Scheduler Service to find stalled jobs.
  - `(isEnabled, nextRunAt)` on `repeatable_job_schedules`.
- **Polling vs. Notifications:** SQLite doesn't have a native pub/sub.
  - Workers will poll the database for new jobs. Polling interval is a trade-off.
  - The `Scheduler Service` will also poll.
  - For an Electron app, this polling load is likely acceptable. Consider adaptive polling rates.
- **Data Types:** Use Drizzle's timestamp modes (`timestamp_ms`) for dates (Unix epoch milliseconds). JSON blobs (`blob({ mode: 'json' })`) for `payload`, `returnValue`, `jobOptions`, `executionLogs`.
- **Database WAL Mode:** Enable Write-Ahead Logging (`PRAGMA journal_mode=WAL;`) for better concurrency.

## 10. Future Considerations / Open Questions

- **UI for Queue Management/Monitoring:** A simple UI to view queues, job statuses, counts, manually retry/remove jobs, etc.
- **Metrics Collection:** Exposing metrics (job counts, processing times, failure rates).
- **Advanced Flows (BullMQ's "Flows"):** More complex parent-child job relationships.
- **Sandboxed Processors:** Running job processors in separate child processes or Worker Threads for true parallelism or isolation. Requires robust IPC for job data and events.
- **Scalability Limits with SQLite:** While suitable for Electron, SQLite has limits for high-throughput distributed systems.
- **Complex Retry Strategies:** E.g., different strategies per error type.
- **Job Grouping/Concurrency Limits per Group.**
- **Rate Limiting for Job Processing.**
- **Database Migrations:** Drizzle Kit for schema migrations.
- **Testing Strategy:** Unit, integration (DB interactions, Scheduler), and E2E tests.
- **Dependency Injection for Services:** How `db` and `eventEmitter` are provided to `Queue` and `Worker` instances (e.g., global singletons, context, or proper DI framework). The current design implies they are passed down or accessible from the `Queue` instance.
- **`Job` Class vs. Interface:** Decide if the `Job` type should be a class with methods that directly update its state in the DB (requiring a DB instance) or a plain data interface with state changes handled by `Queue`/`Worker` services. The latter is often cleaner. The current draft leans towards an interface with methods, implying it's a rich domain object.
- **Dead-letter Queue (DLQ):** Mechanism for jobs that have terminally failed (all retries exhausted) to be moved to a separate queue/status for inspection, rather than just being marked `FAILED` or removed.

## 11. Conclusion

This document outlines a design for a BullMQ-inspired job queue system leveraging SQLite and Drizzle for persistence. It aims to provide a familiar API for developers while adapting to the constraints and strengths of an SQLite backend. The core components include `Job`s, named `Queue`s, `Worker`s with processor functions, and a `Scheduler Service` to manage time-dependent and state-maintenance tasks.

## The proposed system balances feature richness with the practicalities of an SQLite environment, focusing on robustness and developer experience for applications like the target Electron project. Further refinement will occur during implementation, particularly around the atomic operations for job fetching/locking and the precise logic within the Scheduler Service and Worker job lifecycle management.
