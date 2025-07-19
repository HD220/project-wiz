# Task: Create Agent Task Queue System

## Meta Information

```yaml
id: TASK-006
title: Create Agent Task Queue System with Priority Processing
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 4 hours
dependencies: [TASK-002, TASK-004, TASK-005]
tech_stack: [TypeScript, Drizzle ORM, SQLite, Queue Patterns]
domain_context: agents/task-queue
project_type: desktop
```

## Primary Goal

**Create a robust task queue system for agents that handles priority-based task processing, retry mechanisms, scheduled tasks, and persistent storage with background processing capabilities**

### Success Criteria
- [ ] TaskQueueService class with enqueue, dequeue, and process operations
- [ ] Priority-based task processing (1-5 priority levels)
- [ ] Retry mechanism with exponential backoff
- [ ] Scheduled task support for delayed execution
- [ ] Task status tracking through complete lifecycle
- [ ] Persistent storage using SQLite with recovery capabilities
- [ ] Integration with agent worker system for background processing

## Complete Context

### Project Architecture Context
```
src/main/
├── agents/                         # CURRENT DOMAIN
│   ├── tasks.schema.ts             # DEPENDENCY - Task schema
│   ├── agents.schema.ts            # DEPENDENCY - Agent relationship
│   ├── task-queue.service.ts       # THIS TASK - Queue management
│   ├── agent.service.ts            # DEPENDENCY - Agent operations
│   ├── memory.service.ts           # DEPENDENCY - Memory integration
│   └── agent-worker.ts             # FUTURE - Task processing worker
├── user/                           # PATTERN REFERENCE
│   └── authentication/
│       └── auth.service.ts         # Service structure patterns
├── database/
│   └── connection.ts               # Database connection utility
```

### Technology-Specific Context
```yaml
database:
  type: SQLite
  orm_framework: Drizzle ORM
  schema_location: src/main/agents/tasks.schema.ts
  migration_command: npm run db:migrate

backend:
  framework: Electron Main Process
  language: TypeScript
  api_pattern: Service layer returns data, handlers wrap IPC
  concurrency: Worker threads for background processing

queue_system:
  storage: SQLite persistent storage
  priority: 1-5 levels (5 = highest priority)
  retry: Exponential backoff with max retries
  scheduling: Timestamp-based delayed execution
  processing: Background worker pool

testing:
  unit_framework: Vitest
  test_command: npm test
  
build_tools:
  package_manager: npm
  linter: ESLint
  formatter: Prettier
  type_checker: TypeScript
```

### Existing Code Patterns
```typescript
// Pattern 1: Service Class Structure (from AuthService)
export class AuthService {
  static async methodName(input: InputType): Promise<OutputType> {
    const db = getDatabase();
    
    const [result] = await db
      .select()
      .from(table)
      .where(and(
        eq(table.field1, value1),
        eq(table.field2, value2)
      ))
      .orderBy(desc(table.priority), asc(table.createdAt))
      .limit(10);
    
    return result;
  }
}

// Pattern 2: Status Updates with Timestamps
await db
  .update(agentTasksTable)
  .set({ 
    status: "processing",
    startedAt: new Date(),
    updatedAt: new Date()
  })
  .where(eq(agentTasksTable.id, taskId));

// Pattern 3: Complex Filtering with Multiple Conditions
const pendingTasks = await db
  .select()
  .from(agentTasksTable)
  .where(and(
    eq(agentTasksTable.status, "pending"),
    or(
      isNull(agentTasksTable.scheduledFor),
      lte(agentTasksTable.scheduledFor, new Date())
    )
  ))
  .orderBy(desc(agentTasksTable.priority), asc(agentTasksTable.createdAt));

// Pattern 4: Batch Operations
await db.insert(agentTasksTable).values(
  tasks.map(task => ({
    agentId: task.agentId,
    data: JSON.stringify(task.data),
    priority: task.priority,
    status: "pending"
  }))
);
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: kebab-case
  variables: camelCase
  constants: SCREAMING_SNAKE_CASE
  classes: PascalCase
  methods: camelCase

import_organization:
  - Node.js built-ins
  - External libraries (drizzle-orm)
  - Internal modules with @/ alias
  - Relative imports for same domain

error_handling:
  pattern: Throw errors with descriptive messages
  logging: Use existing logger utility
  validation: Service layer validates input and business rules
```

### Validation Commands
```bash
npm run type-check      # TypeScript type checking
npm run lint           # ESLint checks
npm run format         # Prettier formatting
npm test              # Run unit tests
npm run dev           # Start development for integration testing
```

## Implementation Steps

### Phase 1: Service Foundation
```
CREATE src/main/agents/task-queue.service.ts:
  - FOLLOW_PATTERN: src/main/user/authentication/auth.service.ts
  - SETUP_IMPORTS:
    • Import Drizzle ORM utilities (eq, and, or, desc, asc, isNull, lte, gte)
    • Import getDatabase from @/main/database/connection
    • Import task schema types from ./tasks.schema
    • Import date utilities and retry helpers
  
  - DEFINE_INTERFACES:
    • EnqueueTaskInput (agentId, data, priority, scheduledFor)
    • TaskProcessingResult (success, result, error)
    • QueueStats (pending, processing, completed, failed counts)
    • RetryPolicy (maxRetries, backoffMs, exponentialBase)
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check import paths and type definitions
```

### Phase 2: Task Enqueue Operations
```
IMPLEMENT_ENQUEUE_METHODS:
  - ENQUEUE_METHOD:
    • Validate task input (agentId, data, priority)
    • Store task with JSON data serialization
    • Set default priority if not specified
    • Handle scheduled tasks with future execution
    • Return task with generated ID
  
  - ENQUEUE_BATCH:
    • Support batch task enqueueing
    • Validate all tasks before inserting
    • Use database transaction for atomicity
    • Handle partial failures gracefully
  
  - SCHEDULE_TASK:
    • Enqueue task with future execution time
    • Validate scheduling timestamp
    • Support recurring task patterns
    • Handle timezone considerations
  
  - ENQUEUE_PRIORITY:
    • Enqueue high-priority tasks
    • Validate priority levels (1-5)
    • Support priority overrides
    • Handle priority-based ordering
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check task schema usage and JSON serialization
```

### Phase 3: Task Dequeue Operations
```
IMPLEMENT_DEQUEUE_METHODS:
  - DEQUEUE_NEXT:
    • Get highest priority pending task
    • Apply scheduling time filtering
    • Mark task as processing with timestamp
    • Use atomic update operations
    • Handle concurrent dequeue attempts
  
  - DEQUEUE_FOR_AGENT:
    • Get next task for specific agent
    • Respect agent status and availability
    • Apply agent-specific filtering
    • Support agent task preferences
  
  - DEQUEUE_BY_TYPE:
    • Get tasks filtered by type
    • Support task type prioritization
    • Handle type-specific processing
    • Maintain priority ordering
  
  - PEEK_QUEUE:
    • View queue contents without dequeuing
    • Support queue statistics and monitoring
    • Provide queue health metrics
    • Handle queue inspection
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check concurrency handling and atomic operations
```

### Phase 4: Task Status Management
```
IMPLEMENT_STATUS_METHODS:
  - MARK_PROCESSING:
    • Update task status to processing
    • Set processing start timestamp
    • Track processing worker information
    • Handle processing timeouts
  
  - MARK_COMPLETED:
    • Update task status to completed
    • Store task result data
    • Set completion timestamp
    • Update processing statistics
  
  - MARK_FAILED:
    • Update task status to failed
    • Store error information
    • Increment retry counter
    • Schedule retry if appropriate
  
  - RETRY_TASK:
    • Reschedule failed task for retry
    • Implement exponential backoff
    • Respect maximum retry limits
    • Update retry counter and delay
  
  - VALIDATE: npm test
  - IF_FAIL: Add test cases for status transitions
```

### Phase 5: Queue Management and Monitoring
```
IMPLEMENT_MANAGEMENT_METHODS:
  - GET_QUEUE_STATS:
    • Count tasks by status
    • Calculate processing metrics
    • Track retry statistics
    • Monitor queue health
  
  - CLEANUP_COMPLETED:
    • Archive or remove completed tasks
    • Implement retention policies
    • Support configurable cleanup
    • Maintain processing history
  
  - CANCEL_TASK:
    • Cancel pending or processing task
    • Handle graceful cancellation
    • Update task status appropriately
    • Support bulk cancellation
  
  - REQUEUE_FAILED:
    • Requeue failed tasks for retry
    • Apply retry policies
    • Reset retry counters if needed
    • Handle permanent failures
  
  - PAUSE_RESUME_QUEUE:
    • Pause queue processing
    • Resume queue processing
    • Handle in-flight tasks
    • Support graceful shutdown
  
  - VALIDATE: npm test
  - IF_FAIL: Add comprehensive management and monitoring tests
```

## Validation Checkpoints

### Checkpoint 1: Task Enqueue
```
VALIDATE_TASK_ENQUEUE:
  - TEST_ENQUEUE_OPERATIONS:
    • Enqueue task with valid input
    • Verify task appears in database with correct status
    • Test priority assignment and ordering
    • Test scheduled task creation
  
  - TEST_BATCH_ENQUEUE:
    • Enqueue multiple tasks in batch
    • Verify transaction atomicity
    • Test partial failure handling
```

### Checkpoint 2: Task Dequeue
```
VALIDATE_TASK_DEQUEUE:
  - TEST_DEQUEUE_OPERATIONS:
    • Dequeue highest priority task
    • Verify status change to processing
    • Test concurrent dequeue handling
    • Verify FIFO within same priority
  
  - TEST_SCHEDULING:
    • Verify scheduled tasks not dequeued early
    • Test scheduled task execution timing
    • Check timezone handling
```

### Checkpoint 3: Status Management
```
VALIDATE_STATUS_MANAGEMENT:
  - TEST_STATUS_TRANSITIONS:
    • Mark task as processing
    • Complete task with result
    • Fail task with error
    • Test retry mechanism
  
  - TEST_RETRY_LOGIC:
    • Verify exponential backoff calculation
    • Test maximum retry limits
    • Check retry scheduling accuracy
```

### Checkpoint 4: Queue Management
```
VALIDATE_QUEUE_MANAGEMENT:
  - TEST_QUEUE_STATS:
    • Get accurate queue statistics
    • Verify task counts by status
    • Test performance metrics
  
  - TEST_CLEANUP_OPERATIONS:
    • Cleanup completed tasks
    • Verify retention policy enforcement
    • Test archive functionality
```

### Checkpoint 5: Integration Testing
```
VALIDATE_INTEGRATION:
  - START: npm run dev
  - TEST_FULL_WORKFLOW:
    • Enqueue tasks for different agents
    • Process tasks in priority order
    • Handle task failures and retries
    • Monitor queue performance
    • Test graceful shutdown
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example task enqueue input
const enqueueTaskInput: EnqueueTaskInput = {
  agentId: "agent-123-uuid",
  data: {
    type: "send_message",
    payload: {
      conversationId: "conv-456-uuid",
      content: "I've completed the analysis. Here are my findings...",
      attachments: []
    }
  },
  priority: 3,
  scheduledFor: null // Execute immediately
};

// Example scheduled task
const scheduledTaskInput: EnqueueTaskInput = {
  agentId: "agent-123-uuid",
  data: {
    type: "daily_summary",
    payload: {
      summaryType: "project_progress",
      projectId: "project-789-uuid"
    }
  },
  priority: 2,
  scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours later
};

// Example task processing result
const processingResult: TaskProcessingResult = {
  success: true,
  result: {
    messageId: "msg-101112-uuid",
    timestamp: new Date(),
    status: "sent"
  },
  error: null
};

// Example queue statistics
const queueStats: QueueStats = {
  pending: 15,
  processing: 3,
  completed: 247,
  failed: 8,
  totalProcessingTime: 4567, // milliseconds
  averageWaitTime: 234 // milliseconds
};
```

### Common Scenarios
1. **Message Sending**: Agent queues message sending tasks
2. **Code Analysis**: Agent queues code review and analysis tasks
3. **Scheduled Reports**: Agent schedules daily/weekly summary tasks
4. **Background Processing**: Agent processes tasks continuously
5. **Error Recovery**: Failed tasks retry with exponential backoff

### Business Rules & Constraints
- **Priority Ordering**: Higher priority tasks processed first
- **Agent Ownership**: Tasks belong to specific agents
- **Retry Limits**: Maximum retry attempts to prevent infinite loops
- **Scheduling Accuracy**: Scheduled tasks execute within reasonable time window
- **Concurrency Safety**: Multiple workers can safely process queue

### Edge Cases & Error Scenarios
- **Queue Overflow**: Handle excessive task accumulation
- **Agent Unavailable**: Handle tasks for offline agents
- **Processing Timeout**: Handle tasks that take too long
- **Database Errors**: Graceful handling of storage failures
- **Concurrent Processing**: Handle multiple workers safely

## Troubleshooting Guide

### Common Issues by Technology

#### Queue Operation Issues
```
PROBLEM: Task enqueue failures
SOLUTION: 
  - Verify agent exists before enqueueing task
  - Check JSON serialization of task data
  - Validate priority range (1-5)
  - Ensure database connection stability

PROBLEM: Dequeue concurrency issues
SOLUTION:
  - Use atomic database operations for dequeue
  - Implement proper locking mechanisms
  - Handle concurrent access gracefully
  - Test with multiple workers
```

#### Task Processing Issues
```
PROBLEM: Tasks stuck in processing status
SOLUTION:
  - Implement processing timeout detection
  - Add heartbeat mechanism for long tasks
  - Provide task cancellation capability
  - Monitor worker health and recovery

PROBLEM: Retry logic not working
SOLUTION:
  - Verify exponential backoff calculation
  - Check maximum retry limit enforcement
  - Ensure retry scheduling accuracy
  - Test retry under various failure conditions
```

#### Performance Issues
```
PROBLEM: Slow queue operations
SOLUTION:
  - Add database indexes on frequently queried fields
  - Optimize task queries with proper filtering
  - Implement queue partitioning for large volumes
  - Monitor and tune database performance

PROBLEM: Memory leaks in queue processing
SOLUTION:
  - Implement proper cleanup of completed tasks
  - Monitor memory usage in worker processes
  - Add garbage collection for stale tasks
  - Optimize task data storage
```

### Debug Commands
```bash
# Queue service testing
npm test task-queue.service.test.ts  # Specific service tests
npm run type-check --verbose         # Detailed type errors

# Database debugging
npm run db:studio                    # Visual queue inspection
sqlite3 project-wiz.db "SELECT status, priority, COUNT(*) FROM agent_tasks GROUP BY status, priority ORDER BY priority DESC"

# Queue monitoring
sqlite3 project-wiz.db "SELECT agentId, status, COUNT(*) FROM agent_tasks GROUP BY agentId, status"
sqlite3 project-wiz.db "SELECT * FROM agent_tasks WHERE status = 'processing' AND startedAt < datetime('now', '-1 hour')"
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] `TASK-002`: Agent task schema must exist
- [ ] `TASK-004`: Agent service for agent validation
- [ ] `TASK-005`: Memory service for integration
- [ ] `src/main/database/connection.ts`: Database connection utility

### Required Patterns/Conventions
- [ ] Service class with static methods pattern
- [ ] Database operations using getDatabase() and Drizzle
- [ ] JSON serialization for task data storage
- [ ] Atomic operations for concurrency safety
- [ ] Error handling with descriptive messages

### Environment Setup
- [ ] Database with agent_tasks table exists
- [ ] Agent service operational for integration testing
- [ ] Testing framework configured for async operations
- [ ] Performance monitoring tools for queue optimization

---

## Task Completion Checklist

- [ ] TaskQueueService class created with comprehensive queue operations
- [ ] Task enqueue methods with priority and scheduling support
- [ ] Task dequeue methods with concurrency safety
- [ ] Task status management with retry mechanism
- [ ] Queue management and monitoring capabilities
- [ ] Service follows existing project service patterns
- [ ] Database operations use established Drizzle query patterns
- [ ] Error handling consistent with project conventions
- [ ] Unit tests created and passing for all queue operations
- [ ] Integration tests verify multi-agent task processing
- [ ] Concurrency testing ensures safe parallel processing
- [ ] Performance testing validates queue scalability
- [ ] Retry logic tested under various failure scenarios
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without warnings

**Final Validation**: Run `npm test && npm run type-check` and verify all queue operations work correctly with proper priority processing, retry mechanisms, and concurrency safety.