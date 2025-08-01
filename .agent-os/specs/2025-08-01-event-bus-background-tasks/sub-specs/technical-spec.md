# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-01-event-bus-background-tasks/spec.md

## Architecture Overview

### Current State Analysis

**Existing Event Bus Implementation:**
- Type-safe EventBus class extending Node.js EventEmitter in `src/shared/events/event-bus.ts`
- Current events: `user-sent-message`, `agent-status-changed`, `conversation-updated`
- Successfully used in AgenticWorkerHandler for AI task processing
- Global singleton pattern with proper logging and lifecycle management

**Current IPC Pattern Limitations:**
- Synchronous request-response pattern using `createIpcHandler` utility
- Frontend blocks waiting for results from main process
- No timeout handling for long-running operations
- No progress reporting mechanism
- All tasks execute on main thread

### Target Architecture

**Event-Driven Background Task System:**
```
Frontend Request → Task Registry → Background Queue → Event Bus Updates → Frontend Response
```

## Technical Requirements

### 1. Event Bus Extensions

**New SystemEvents Interface Extensions:**
```typescript
export interface SystemEvents {
  // Existing events...
  "task-queued": {
    taskId: string;
    taskType: string;
    priority: number;
    estimatedDuration?: number;
    metadata?: Record<string, any>;
    timestamp: Date;
  };
  "task-started": {
    taskId: string;
    taskType: string;
    startedAt: Date;
  };
  "task-progress": {
    taskId: string;
    progress: number; // 0-100
    currentOperation?: string;
    estimatedTimeRemaining?: number;
    timestamp: Date;
  };
  "task-completed": {
    taskId: string;
    taskType: string;
    result: any;
    duration: number;
    timestamp: Date;
  };
  "task-failed": {
    taskId: string;
    taskType: string;
    error: string;
    retryable: boolean;
    attemptCount: number;
    timestamp: Date;
  };
  "task-cancelled": {
    taskId: string;
    taskType: string;
    reason?: string;
    timestamp: Date;
  };
}
```

### 2. Background Task Queue System

**Core Components:**

**TaskQueue Class (`src/shared/tasks/task-queue.ts`):**
- Generic task queue supporting any task type
- Priority-based execution (1-10 priority levels)
- Concurrency control with configurable worker count
- Retry mechanism with exponential backoff
- Graceful shutdown with task completion
- Memory-based (no persistence required for Phase 1)

**TaskRegistry Class (`src/shared/tasks/task-registry.ts`):**
- Centralized registry for task type definitions
- Metadata storage: timeout, retry policy, concurrency limits
- Validation functions for task inputs
- Handler function mapping for execution

**TaskExecutor Class (`src/shared/tasks/task-executor.ts`):**
- Wrapper for individual task execution
- Progress reporting standardization
- Error handling and classification
- Timeout enforcement
- Cancellation support

### 3. IPC Handler Migration Pattern

**New Pattern Structure:**

**AsyncIpcHandler Utility (`src/main/utils/async-ipc-handler.ts`):**
```typescript
export function createAsyncIpcHandler<TInput, TResult>(
  channel: string,
  taskType: string,
  options: {
    timeout?: number; // Auto-background if exceeds timeout
    immediate?: boolean; // Force immediate background processing
    priority?: number; // Task queue priority
  }
): void
```

**Migration Strategy:**
1. **Immediate Response Pattern**: Operations < 2 seconds remain synchronous
2. **Background Task Pattern**: Operations ≥ 2 seconds become async with task tracking
3. **Hybrid Pattern**: Smart detection with fallback to background processing

### 4. Task Type Definitions

**Built-in Task Types:**
- `file-operations`: File I/O, directory scanning, file system operations
- `database-operations`: Complex queries, migrations, bulk operations
- `analysis-operations`: Code analysis, dependency scanning, project analysis
- `external-api`: Third-party API calls with variable response times
- `computation-heavy`: CPU-intensive calculations, data processing

**Task Metadata Schema:**
```typescript
interface TaskDefinition {
  type: string;
  timeout: number; // milliseconds
  retryPolicy: {
    maxAttempts: number;
    backoffMultiplier: number;
    baseDelay: number;
  };
  concurrency: number; // max concurrent tasks of this type
  estimatedDuration?: number; // for progress calculation
  description: string;
}
```

### 5. Progress Broadcasting System

**Progress Reporting Interface:**
```typescript
interface TaskProgress {
  taskId: string;
  progress: number; // 0-100
  currentOperation: string;
  estimatedTimeRemaining?: number;
  additionalData?: Record<string, any>;
}
```

**Broadcasting Mechanism:**
- Event bus emission for real-time updates
- Debounced updates (max 10 updates/second) to prevent UI flooding
- Automatic IPC forwarding to renderer process
- WebSocket-like push mechanism for instant UI updates

### 6. Error Handling Strategy

**Error Classification:**
- **Retryable**: Network timeouts, temporary resource conflicts
- **Fatal**: Invalid inputs, authentication failures, system errors
- **User-actionable**: Permission errors, missing files, configuration issues

**Error Response Pattern:**
```typescript
interface TaskError {
  taskId: string;
  errorType: 'retryable' | 'fatal' | 'user-actionable';
  message: string;
  retryAfter?: number; // milliseconds
  suggestedAction?: string;
  technicalDetails?: string;
}
```

### 7. Performance Requirements

**Responsiveness:**
- Frontend acknowledgment within 100ms for all requests
- Progress updates with <50ms latency
- Task queue processing with <10ms overhead per task

**Scalability:**
- Support 100+ concurrent background tasks
- Memory usage <50MB for task queue system
- Graceful degradation under high load

**Reliability:**
- 99.9% task completion rate for retryable operations
- Zero data loss during graceful shutdown
- Complete recovery from system crashes

## File Organization Strategy

### Repository Structure Recommendations

**Current Structure Analysis:**
- Feature-based organization in `src/main/features/`
- Shared utilities in `src/shared/`
- Event bus in `src/shared/events/`

**Proposed New Structure:**
```
src/shared/tasks/
├── task-queue.ts          # Generic task queue implementation
├── task-registry.ts       # Centralized task type definitions
├── task-executor.ts       # Individual task execution wrapper
├── task-types.ts          # Built-in task type definitions
└── index.ts              # Public API exports

src/main/utils/
├── async-ipc-handler.ts   # New async IPC handler utility
└── task-migration.ts     # Helper for migrating existing handlers

src/main/services/
└── background-task.service.ts  # High-level service API
```

### Pros and Cons Analysis

**Pros of Event-Driven Background Architecture:**

**Developer Experience:**
- Consistent async pattern across all long-running operations
- Real-time progress feedback improves user confidence
- Simplified error handling with standardized error types
- Easy to add new background task types

**Performance Benefits:**
- UI remains responsive under heavy load
- Better resource utilization with controlled concurrency
- Reduced memory pressure on main thread
- Scalable to handle increasing task complexity

**Maintainability:**
- Centralized task management reduces code duplication
- Event-driven architecture enables loose coupling
- Standardized patterns reduce onboarding time
- Built-in logging and monitoring capabilities

**Cons and Mitigation Strategies:**

**Complexity Introduction:**
- More complex debugging due to async nature
- **Mitigation**: Comprehensive logging with task correlation IDs
- Additional moving parts in the system
- **Mitigation**: Well-documented interfaces and clear separation of concerns

**Memory Usage:**
- Task queue requires memory for tracking
- **Mitigation**: Configurable queue size limits and automatic cleanup
- Event listeners increase memory footprint
- **Mitigation**: Proper cleanup in shutdown procedures

**Testing Complexity:**
- Async operations harder to test
- **Mitigation**: Deterministic test helpers and mock event bus
- Race conditions in concurrent scenarios
- **Mitigation**: Comprehensive integration tests with various load patterns

## Migration Strategy

### Phase 1: Core Infrastructure (Week 1)
- Implement TaskQueue, TaskRegistry, TaskExecutor
- Extend EventBus with new event types
- Create AsyncIpcHandler utility
- Add basic task types (file-operations, database-operations)

### Phase 2: Handler Migration (Week 2)
- Identify long-running handlers through performance analysis
- Migrate top 5 most time-consuming handlers
- Implement progress reporting for migrated handlers
- Add comprehensive error handling

### Phase 3: Integration & Polish (Week 3)
- Frontend integration for progress display
- Performance optimization and memory management
- Comprehensive testing and error scenarios
- Documentation and developer guidelines

## External Dependencies

No new external dependencies required. Implementation uses existing technology stack:
- Node.js EventEmitter (already in use)
- TypeScript type system (already in use)
- Existing logging infrastructure (already in use)
- Current IPC patterns (evolution, not replacement)