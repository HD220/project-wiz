# BullMQ Architecture Specification

This specification documents BullMQ's architecture, patterns, and implementation details for creating our SQLite-based job queue system.

## BullMQ Core Architecture

### Job Structure and Data Format

```typescript
interface JobData {
  // User-defined job payload
  [key: string]: any;
}

interface JobOptions {
  // Job configuration
  priority?: number; // Higher = more priority (default: 0)
  delay?: number; // Delay in milliseconds
  attempts?: number; // Max retry attempts (default: 3)
  backoff?: BackoffSettings; // Retry backoff strategy
  removeOnComplete?: number; // Keep only N completed jobs
  removeOnFail?: number; // Keep only N failed jobs
  jobId?: string; // Custom job ID
  repeatJobKey?: string; // For repeatable jobs
  prevMillis?: number; // Previous execution time

  // Parent/Child relationships
  parent?: {
    id: string;
    queue: string;
  };

  // Flow control
  children?: Array<{
    name: string;
    data: JobData;
    queueName: string;
    opts?: JobOptions;
  }>;
}

interface BackoffSettings {
  type: "fixed" | "exponential";
  delay: number;
  settings?: {
    jitter?: boolean;
  };
}
```

### Job States and Lifecycle

```typescript
enum JobState {
  WAITING = "waiting", // Job is queued and waiting to be processed
  ACTIVE = "active", // Job is currently being processed
  COMPLETED = "completed", // Job completed successfully
  FAILED = "failed", // Job failed after all retry attempts
  DELAYED = "delayed", // Job is scheduled for future execution
  PAUSED = "paused", // Job is paused (queue level)
  WAITING_CHILDREN = "waiting-children", // Job waiting for children to complete
}

// State Transitions:
// waiting -> active -> completed
// waiting -> active -> failed
// delayed -> waiting -> active -> completed/failed
// waiting-children -> waiting -> active -> completed/failed
```

### Job Priority System

```typescript
// Priority handling (higher number = higher priority)
interface PriorityConfig {
  priority: number  // -1048576 to 1048575 (BullMQ range)

  // Common priority levels
  static CRITICAL = 1000000
  static HIGH = 100000
  static NORMAL = 0
  static LOW = -100000
}
```

## Database Schema (SQLite Implementation)

### Jobs Table

```sql
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  data TEXT NOT NULL,        -- JSON job payload
  opts TEXT,                 -- JSON job options

  -- Status and Processing
  status TEXT NOT NULL CHECK (status IN (
    'waiting', 'active', 'completed', 'failed',
    'delayed', 'paused', 'waiting-children'
  )) DEFAULT 'waiting',

  priority INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,  -- 0-100

  -- Retry Logic
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Timing
  delay INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('subsec')),
  processed_on INTEGER,
  finished_on INTEGER,

  -- Results and Errors
  return_value TEXT,          -- JSON result
  failed_reason TEXT,
  stacktrace TEXT,

  -- Parent/Child Dependencies
  parent_id TEXT,
  dependency_count INTEGER DEFAULT 0,

  -- Soft Delete
  is_active BOOLEAN DEFAULT 1,

  FOREIGN KEY (parent_id) REFERENCES jobs(id) ON DELETE SET NULL
);

-- Performance Indexes
CREATE INDEX idx_jobs_processing ON jobs(status, priority DESC, created_at) WHERE is_active = 1;
CREATE INDEX idx_jobs_delayed ON jobs(status, delay, created_at) WHERE status = 'delayed' AND is_active = 1;
CREATE INDEX idx_jobs_dependencies ON jobs(parent_id, dependency_count) WHERE is_active = 1;
CREATE INDEX idx_jobs_cleanup ON jobs(status, finished_on) WHERE is_active = 1;
```

## TypeScript Implementation

### Job Class

```typescript
export class Job {
  public id: string;
  public name: string;
  public data: JobData;
  public opts: JobOptions;
  public progress: number = 0;
  public returnValue?: any;
  public failedReason?: string;
  public stacktrace?: string[];
  public attempts: number = 0;
  public delay: number = 0;
  public timestamp: number;
  public processedOn?: number;
  public finishedOn?: number;

  constructor(name: string, data: JobData, opts: JobOptions = {}, id?: string) {
    this.id = id || generateJobId();
    this.name = name;
    this.data = data;
    this.opts = opts;
    this.timestamp = Date.now();
    this.delay = opts.delay || 0;
  }

  // Update job progress (0-100)
  updateProgress(progress: number): Promise<void> {
    this.progress = Math.max(0, Math.min(100, progress));
    return this.save();
  }

  // Get job state
  getState(): Promise<JobState> {
    // Query database for current status
  }

  // Remove job from queue
  remove(): Promise<void> {
    // Soft delete: set is_active = 0
  }

  // Retry failed job
  retry(): Promise<void> {
    if (this.getState() === JobState.FAILED) {
      // Reset status to waiting, increment attempts
    }
  }

  private async save(): Promise<void> {
    // Update job in database
  }
}
```

### Queue Class

```typescript
export class Queue {
  private name: string;
  private db: Database;

  constructor(name: string, connection?: DatabaseConnection) {
    this.name = name;
    this.db = connection || getDefaultConnection();
  }

  // Add job to queue
  async add(name: string, data: JobData, opts: JobOptions = {}): Promise<Job> {
    const job = new Job(name, data, opts);

    // Handle delayed jobs
    const status = opts.delay && opts.delay > 0 ? "delayed" : "waiting";

    await this.db.insert(jobsTable).values({
      id: job.id,
      name: job.name,
      data: JSON.stringify(job.data),
      opts: JSON.stringify(job.opts),
      status,
      priority: opts.priority || 0,
      delay: opts.delay || 0,
      max_attempts: opts.attempts || 3,
      parent_id: opts.parent?.id,
      created_at: job.timestamp,
    });

    // Handle job dependencies
    if (opts.parent) {
      await this.incrementDependencyCount(opts.parent.id);
    }

    this.emit("added", job);
    return job;
  }

  // Add bulk jobs with flow control
  async addBulk(
    jobs: Array<{
      name: string;
      data: JobData;
      opts?: JobOptions;
    }>,
  ): Promise<Job[]> {
    return this.db.transaction(async (tx) => {
      const createdJobs = [];
      for (const jobSpec of jobs) {
        const job = await this.add(jobSpec.name, jobSpec.data, jobSpec.opts);
        createdJobs.push(job);
      }
      return createdJobs;
    });
  }

  // Get job by ID
  async getJob(id: string): Promise<Job | null> {
    const result = await this.db
      .select()
      .from(jobsTable)
      .where(and(eq(jobsTable.id, id), eq(jobsTable.is_active, true)))
      .get();

    if (!result) return null;

    return this.createJobFromRecord(result);
  }

  // Get jobs by status
  async getJobs(
    states: JobState[],
    start = 0,
    end = -1,
    asc = false,
  ): Promise<Job[]> {
    const results = await this.db
      .select()
      .from(jobsTable)
      .where(
        and(inArray(jobsTable.status, states), eq(jobsTable.is_active, true)),
      )
      .orderBy(asc ? asc(jobsTable.created_at) : desc(jobsTable.created_at))
      .limit(end === -1 ? 1000 : end - start)
      .offset(start);

    return results.map((record) => this.createJobFromRecord(record));
  }

  // Process delayed jobs (move to waiting)
  async processDelayedJobs(): Promise<void> {
    const now = Date.now();

    await this.db
      .update(jobsTable)
      .set({ status: "waiting" })
      .where(
        and(
          eq(jobsTable.status, "delayed"),
          lte(jobsTable.delay, now),
          eq(jobsTable.is_active, true),
        ),
      );
  }

  // Clean up completed/failed jobs
  async clean(
    grace: number,
    limit?: number,
    type: "completed" | "failed" = "completed",
  ): Promise<number> {
    const cutoff = Date.now() - grace;

    const result = await this.db
      .update(jobsTable)
      .set({ is_active: false })
      .where(
        and(
          eq(jobsTable.status, type),
          lte(jobsTable.finished_on, cutoff),
          eq(jobsTable.is_active, true),
        ),
      );

    return result.changes;
  }

  // Queue statistics
  async getJobCounts(): Promise<Record<JobState, number>> {
    const results = await this.db
      .select({
        status: jobsTable.status,
        count: count(),
      })
      .from(jobsTable)
      .where(eq(jobsTable.is_active, true))
      .groupBy(jobsTable.status);

    // Convert to status -> count mapping
    const counts = Object.fromEntries(
      Object.values(JobState).map((state) => [state, 0]),
    );

    results.forEach(({ status, count }) => {
      counts[status] = count;
    });

    return counts;
  }

  private async incrementDependencyCount(parentId: string): Promise<void> {
    await this.db
      .update(jobsTable)
      .set({
        dependency_count: sql`${jobsTable.dependency_count} + 1`,
      })
      .where(eq(jobsTable.id, parentId));
  }

  private createJobFromRecord(record: any): Job {
    const job = new Job(
      record.name,
      JSON.parse(record.data),
      JSON.parse(record.opts || "{}"),
      record.id,
    );

    job.progress = record.progress;
    job.attempts = record.attempts;
    job.returnValue = record.return_value
      ? JSON.parse(record.return_value)
      : undefined;
    job.failedReason = record.failed_reason;
    job.stacktrace = record.stacktrace
      ? JSON.parse(record.stacktrace)
      : undefined;
    job.processedOn = record.processed_on;
    job.finishedOn = record.finished_on;

    return job;
  }
}
```

### Worker Class

```typescript
export class Worker {
  private queue: Queue;
  private processor: JobProcessor;
  private concurrency: number;
  private running: boolean = false;
  private activeJobs: Set<string> = new Set();
  private pollInterval: number = 1000;

  constructor(
    queueName: string,
    processor: JobProcessor,
    opts: WorkerOptions = {},
  ) {
    this.queue = new Queue(queueName, opts.connection);
    this.processor = processor;
    this.concurrency = opts.concurrency || 1;
    this.pollInterval = opts.pollInterval || 1000;
  }

  // Start processing jobs
  async run(): Promise<void> {
    this.running = true;

    while (this.running) {
      try {
        await this.processNextJob();
        await this.delay(this.pollInterval);
      } catch (error) {
        this.emit("error", error);
        await this.delay(this.pollInterval * 2); // Back off on error
      }
    }
  }

  // Stop processing
  async close(): Promise<void> {
    this.running = false;

    // Wait for active jobs to complete
    while (this.activeJobs.size > 0) {
      await this.delay(100);
    }
  }

  private async processNextJob(): Promise<void> {
    if (this.activeJobs.size >= this.concurrency) {
      return; // At capacity
    }

    // Process delayed jobs first
    await this.queue.processDelayedJobs();

    // Get next job
    const job = await this.getNextJob();
    if (!job) return;

    this.activeJobs.add(job.id);
    this.processJob(job).finally(() => {
      this.activeJobs.delete(job.id);
    });
  }

  private async getNextJob(): Promise<Job | null> {
    // Atomic job selection with status update
    return this.db.transaction(async (tx) => {
      const job = await tx
        .select()
        .from(jobsTable)
        .where(
          and(
            eq(jobsTable.status, "waiting"),
            eq(jobsTable.is_active, true),
            eq(jobsTable.dependency_count, 0),
          ),
        )
        .orderBy(desc(jobsTable.priority), asc(jobsTable.created_at))
        .limit(1)
        .get();

      if (!job) return null;

      // Mark as active
      await tx
        .update(jobsTable)
        .set({
          status: "active",
          processed_on: Date.now(),
        })
        .where(eq(jobsTable.id, job.id));

      return this.queue.createJobFromRecord(job);
    });
  }

  private async processJob(job: Job): Promise<void> {
    try {
      this.emit("active", job);

      // Execute job processor
      const result = await this.processor(job);

      // Mark as completed
      await this.completeJob(job, result);

      this.emit("completed", job, result);
    } catch (error) {
      await this.failJob(job, error);
      this.emit("failed", job, error);
    }
  }

  private async completeJob(job: Job, result: any): Promise<void> {
    await this.db.transaction(async (tx) => {
      // Update job status
      await tx
        .update(jobsTable)
        .set({
          status: "completed",
          return_value: JSON.stringify(result),
          finished_on: Date.now(),
          progress: 100,
        })
        .where(eq(jobsTable.id, job.id));

      // Process child jobs (reduce dependency count)
      await tx
        .update(jobsTable)
        .set({
          dependency_count: sql`${jobsTable.dependency_count} - 1`,
        })
        .where(eq(jobsTable.parent_id, job.id));
    });
  }

  private async failJob(job: Job, error: Error): Promise<void> {
    const canRetry = job.attempts < (job.opts.attempts || 3);

    if (canRetry) {
      // Calculate backoff delay
      const delay = this.calculateBackoffDelay(job, error);

      await this.db
        .update(jobsTable)
        .set({
          status: delay > 0 ? "delayed" : "waiting",
          attempts: job.attempts + 1,
          delay: delay > 0 ? Date.now() + delay : 0,
          failed_reason: error.message,
          stacktrace: JSON.stringify(error.stack?.split("\n") || []),
        })
        .where(eq(jobsTable.id, job.id));
    } else {
      // Mark as permanently failed
      await this.db
        .update(jobsTable)
        .set({
          status: "failed",
          failed_reason: error.message,
          stacktrace: JSON.stringify(error.stack?.split("\n") || []),
          finished_on: Date.now(),
        })
        .where(eq(jobsTable.id, job.id));
    }
  }

  private calculateBackoffDelay(job: Job, error: Error): number {
    const backoff = job.opts.backoff || { type: "exponential", delay: 2000 };

    if (backoff.type === "fixed") {
      return backoff.delay;
    }

    if (backoff.type === "exponential") {
      const delay = backoff.delay * Math.pow(2, job.attempts);

      // Add jitter if enabled
      if (backoff.settings?.jitter) {
        return delay + Math.random() * delay * 0.1;
      }

      return delay;
    }

    return 0;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Job processor function type
type JobProcessor = (job: Job) => Promise<any>;

interface WorkerOptions {
  concurrency?: number;
  connection?: DatabaseConnection;
  pollInterval?: number;
}
```

## Usage Examples

### Basic Job Processing

```typescript
// Create queue
const llmQueue = new Queue("llm-processing");

// Add jobs
await llmQueue.add(
  "process-message",
  {
    userId: "user123",
    message: "Hello, can you help me with coding?",
    conversationId: "conv456",
  },
  {
    priority: 100,
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
  },
);

// Create worker
const worker = new Worker(
  "llm-processing",
  async (job) => {
    const { userId, message, conversationId } = job.data;

    // Update progress
    await job.updateProgress(25);

    // Process with LLM
    const response = await processWithLLM(message);

    await job.updateProgress(75);

    // Save response
    await saveResponse(conversationId, response);

    await job.updateProgress(100);

    return { response, timestamp: Date.now() };
  },
  {
    concurrency: 2,
    pollInterval: 500,
  },
);

// Start processing
await worker.run();
```

### Job Dependencies and Flows

```typescript
// Create parent job
const analysisJob = await llmQueue.add("analyze-requirements", {
  requirements: "Build a user authentication system",
});

// Create dependent jobs
await llmQueue.add(
  "generate-models",
  {
    parentAnalysis: analysisJob.id,
  },
  {
    parent: { id: analysisJob.id, queue: "llm-processing" },
    priority: 50,
  },
);

await llmQueue.add(
  "generate-api",
  {
    parentAnalysis: analysisJob.id,
  },
  {
    parent: { id: analysisJob.id, queue: "llm-processing" },
    priority: 50,
  },
);

await llmQueue.add(
  "generate-tests",
  {
    parentAnalysis: analysisJob.id,
  },
  {
    parent: { id: analysisJob.id, queue: "llm-processing" },
    priority: 25,
  },
);
```

### Event Handling

```typescript
// Queue events
llmQueue.on("added", (job) => {
  console.log(`Job ${job.id} added to queue`);
});

// Worker events
worker.on("active", (job) => {
  console.log(`Processing job ${job.id}`);
});

worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

worker.on("failed", (job, error) => {
  console.log(`Job ${job.id} failed:`, error.message);
});

worker.on("progress", (job, progress) => {
  console.log(`Job ${job.id} progress: ${progress}%`);
});
```

### Queue Management

```typescript
// Get queue statistics
const stats = await llmQueue.getJobCounts();
console.log("Queue stats:", stats);
// { waiting: 5, active: 2, completed: 100, failed: 3, delayed: 1, paused: 0 }

// Clean old jobs (keep completed jobs for 24 hours)
const cleanedCount = await llmQueue.clean(
  24 * 60 * 60 * 1000,
  100,
  "completed",
);
console.log(`Cleaned ${cleanedCount} completed jobs`);

// Get specific jobs
const failedJobs = await llmQueue.getJobs(["failed"], 0, 10);
for (const job of failedJobs) {
  console.log(`Failed job: ${job.name} - ${job.failedReason}`);
}
```

This specification provides a complete BullMQ-inspired implementation that can be integrated into the Project Wiz worker system, maintaining all the reliability and features of BullMQ while using SQLite as the backend.
