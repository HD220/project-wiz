# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-07-31-autonomous-llm-worker/spec.md

## Schema Changes

### New Tables

#### llm_jobs

Primary job queue table inspired by BullMQ architecture.

```sql
CREATE TABLE llm_jobs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL, -- Job type identifier
  conversation_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  conversation_type TEXT NOT NULL CHECK (conversation_type IN ('dm', 'project_channel')),

  -- Job Content (BullMQ-style data)
  data TEXT NOT NULL, -- JSON string with job description and parameters
  opts TEXT, -- JSON string with job options (delay, attempts, etc.)

  -- Priority and Status
  priority INTEGER DEFAULT 0, -- Higher number = higher priority
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'completed', 'failed', 'delayed', 'paused')) DEFAULT 'waiting',

  -- Processing Information
  progress INTEGER DEFAULT 0, -- 0-100 progress percentage
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  delay INTEGER DEFAULT 0, -- Delay in milliseconds

  -- Dependencies (BullMQ-style)
  parent_job_id TEXT, -- For job dependencies
  dependency_count INTEGER DEFAULT 0, -- Number of dependencies remaining

  -- Results
  result TEXT, -- JSON string with job result
  failure_reason TEXT,
  stacktrace TEXT,

  -- Timestamps
  created_at INTEGER NOT NULL DEFAULT (unixepoch('subsec')),
  processed_on INTEGER, -- When job started processing
  finished_on INTEGER, -- When job finished (success or failure)

  -- Foreign Keys
  FOREIGN KEY (conversation_id) REFERENCES dm_conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_job_id) REFERENCES llm_jobs(id) ON DELETE SET NULL
);
```

### Indexes and Constraints

```sql
-- Performance indexes for job queue (BullMQ-style)
CREATE INDEX idx_llm_jobs_queue_processing ON llm_jobs(status, priority DESC, created_at);
CREATE INDEX idx_llm_jobs_conversation ON llm_jobs(conversation_id, created_at);
CREATE INDEX idx_llm_jobs_user ON llm_jobs(user_id, created_at);
CREATE INDEX idx_llm_jobs_dependencies ON llm_jobs(parent_job_id, dependency_count);
CREATE INDEX idx_llm_jobs_delayed ON llm_jobs(status, delay, created_at) WHERE status = 'delayed';
```

### Migration Strategy

Since this adds new functionality, all changes are additive:

1. **Add new table** - `llm_jobs` with BullMQ-inspired architecture
2. **Add indexes** - For optimal job queue processing performance
3. **No existing data migration** - This is a new feature, no data transformation needed

## Rationale

### BullMQ-Inspired Job Table Design

- **Flexible job data** using JSON strings allows different job types with varying parameters
- **Priority-based processing** with numeric priority (higher = more important)
- **Job dependencies** through parent-child relationships enable complex workflows
- **Progress tracking** provides real-time feedback on long-running jobs
- **Comprehensive status tracking** follows BullMQ patterns (waiting → active → completed/failed)
- **Retry mechanism** with configurable attempts and delay support
- **Job options** stored as JSON for flexible configuration per job type

### Job Dependency System

- **Parent-child relationships** allow jobs to depend on completion of other jobs
- **Dependency counting** tracks how many dependencies remain before job can execute
- **Cascading workflows** enable complex multi-step autonomous agent tasks
- **Self-referential design** allows arbitrary depth of job dependencies

### Worker Process Management (In-Memory)

- **No database persistence** - workers are managed in memory only
- **Process spawning** handled by Node.js worker pool manager
- **Dynamic scaling** based on job queue depth and system resources
- **Failure recovery** through job status monitoring rather than worker tracking

### Foreign Key Relationships

- **Conversation linkage** maintains data integrity across conversations
- **User association** enables per-user job filtering and limits
- **Dependency relationships** ensure proper cleanup of dependent jobs
- **Cascade deletes** clean up jobs when conversations are removed
