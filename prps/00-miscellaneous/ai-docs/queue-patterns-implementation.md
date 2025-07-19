# Queue Patterns for Task Management

## Overview

This document covers queue implementation patterns for managing asynchronous tasks in Node.js/Electron applications. These patterns are essential for the Project Wiz agent system to handle task distribution efficiently.

## Basic Queue Patterns

### 1. FIFO (First In, First Out) Queue

The simplest and most common pattern for task processing:

```typescript
export class TaskQueue<T> {
  private queue: T[] = [];
  
  enqueue(task: T): void {
    this.queue.push(task);
  }
  
  dequeue(): T | undefined {
    return this.queue.shift();
  }
  
  peek(): T | undefined {
    return this.queue[0];
  }
  
  isEmpty(): boolean {
    return this.queue.length === 0;
  }
  
  get length(): number {
    return this.queue.length;
  }
  
  clear(): void {
    this.queue = [];
  }
}
```

### 2. Priority Queue

For tasks with different importance levels:

```typescript
// Using heap for efficient priority queue
import { BinaryHeap } from 'heap-js';

interface PrioritizedTask {
  id: string;
  priority: number; // Higher number = higher priority
  task: any;
  createdAt: Date;
}

export class PriorityTaskQueue {
  private heap: BinaryHeap<PrioritizedTask>;
  
  constructor() {
    // Max heap - highest priority first
    this.heap = new BinaryHeap<PrioritizedTask>(
      (a, b) => {
        // First by priority, then by creation time
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        return a.createdAt.getTime() - b.createdAt.getTime();
      }
    );
  }
  
  enqueue(task: any, priority: number = 0): void {
    this.heap.push({
      id: crypto.randomUUID(),
      priority,
      task,
      createdAt: new Date()
    });
  }
  
  dequeue(): PrioritizedTask | undefined {
    return this.heap.pop();
  }
}
```

### 3. Circular Buffer Queue

For fixed-size queues with overwrite behavior:

```typescript
export class CircularQueue<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private size: number = 0;
  
  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }
  
  enqueue(item: T): boolean {
    if (this.size === this.capacity) {
      // Overwrite oldest item
      this.head = (this.head + 1) % this.capacity;
      this.size--;
    }
    
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.size++;
    return true;
  }
  
  dequeue(): T | undefined {
    if (this.size === 0) return undefined;
    
    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return item;
  }
}
```

## Advanced Queue Patterns

### 1. Delayed Queue

For scheduling tasks to run after a delay:

```typescript
interface DelayedTask<T> {
  task: T;
  executeAt: number;
}

export class DelayedQueue<T> {
  private tasks: DelayedTask<T>[] = [];
  private timers: Map<string, NodeJS.Timeout> = new Map();
  
  enqueue(task: T, delayMs: number, onExecute: (task: T) => void): string {
    const id = crypto.randomUUID();
    const executeAt = Date.now() + delayMs;
    
    this.tasks.push({ task, executeAt });
    this.tasks.sort((a, b) => a.executeAt - b.executeAt);
    
    const timer = setTimeout(() => {
      this.dequeue();
      onExecute(task);
      this.timers.delete(id);
    }, delayMs);
    
    this.timers.set(id, timer);
    return id;
  }
  
  cancel(id: string): boolean {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
      return true;
    }
    return false;
  }
  
  private dequeue(): DelayedTask<T> | undefined {
    return this.tasks.shift();
  }
}
```

### 2. Rate-Limited Queue

For controlling task execution rate:

```typescript
export class RateLimitedQueue<T> {
  private queue: T[] = [];
  private processing: boolean = false;
  private lastProcessTime: number = 0;
  
  constructor(
    private minIntervalMs: number,
    private onProcess: (task: T) => Promise<void>
  ) {}
  
  enqueue(task: T): void {
    this.queue.push(task);
    this.processNext();
  }
  
  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;
    
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessTime;
    
    if (timeSinceLastProcess < this.minIntervalMs) {
      // Schedule for later
      setTimeout(
        () => this.processNext(),
        this.minIntervalMs - timeSinceLastProcess
      );
      return;
    }
    
    this.processing = true;
    const task = this.queue.shift()!;
    
    try {
      await this.onProcess(task);
      this.lastProcessTime = Date.now();
    } finally {
      this.processing = false;
      // Process next task
      setImmediate(() => this.processNext());
    }
  }
}
```

### 3. Batch Queue

For processing tasks in batches:

```typescript
export class BatchQueue<T> {
  private queue: T[] = [];
  private batchTimer?: NodeJS.Timeout;
  
  constructor(
    private batchSize: number,
    private batchTimeoutMs: number,
    private onBatch: (batch: T[]) => Promise<void>
  ) {}
  
  enqueue(task: T): void {
    this.queue.push(task);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flush(), this.batchTimeoutMs);
    }
  }
  
  private async flush(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = undefined;
    }
    
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0, this.batchSize);
    await this.onBatch(batch);
    
    // Process remaining items
    if (this.queue.length > 0) {
      setImmediate(() => this.flush());
    }
  }
}
```

## Database-Backed Queue

For persistent task queues that survive process restarts:

```typescript
// Using SQLite with Drizzle ORM
import { eq, and, lt, isNull } from 'drizzle-orm';

export class PersistentQueue {
  constructor(private db: Database) {}
  
  async enqueue(task: any, priority: number = 0): Promise<string> {
    const [inserted] = await this.db
      .insert(queueTable)
      .values({
        data: JSON.stringify(task),
        priority,
        status: 'pending',
        createdAt: new Date(),
      })
      .returning();
    
    return inserted.id;
  }
  
  async dequeue(workerId: string): Promise<QueuedTask | null> {
    // Atomic claim of next task
    const [task] = await this.db
      .update(queueTable)
      .set({
        status: 'processing',
        workerId,
        startedAt: new Date(),
      })
      .where(
        and(
          eq(queueTable.status, 'pending'),
          isNull(queueTable.workerId)
        )
      )
      .orderBy(desc(queueTable.priority), asc(queueTable.createdAt))
      .limit(1)
      .returning();
    
    return task || null;
  }
  
  async complete(taskId: string, result: any): Promise<void> {
    await this.db
      .update(queueTable)
      .set({
        status: 'completed',
        result: JSON.stringify(result),
        completedAt: new Date(),
      })
      .where(eq(queueTable.id, taskId));
  }
  
  async fail(taskId: string, error: string): Promise<void> {
    await this.db
      .update(queueTable)
      .set({
        status: 'failed',
        error,
        failedAt: new Date(),
      })
      .where(eq(queueTable.id, taskId));
  }
  
  // Recover stalled tasks
  async recoverStalledTasks(timeoutMs: number): Promise<number> {
    const cutoff = new Date(Date.now() - timeoutMs);
    
    const result = await this.db
      .update(queueTable)
      .set({
        status: 'pending',
        workerId: null,
        startedAt: null,
      })
      .where(
        and(
          eq(queueTable.status, 'processing'),
          lt(queueTable.startedAt, cutoff)
        )
      );
    
    return result.changes;
  }
}
```

## Queue Monitoring and Metrics

### Queue Health Metrics

```typescript
export class QueueMetrics {
  private metrics = {
    enqueued: 0,
    dequeued: 0,
    processed: 0,
    failed: 0,
    currentSize: 0,
    processingTime: [] as number[],
  };
  
  recordEnqueue(): void {
    this.metrics.enqueued++;
    this.metrics.currentSize++;
  }
  
  recordDequeue(): void {
    this.metrics.dequeued++;
    this.metrics.currentSize--;
  }
  
  recordCompletion(durationMs: number): void {
    this.metrics.processed++;
    this.metrics.processingTime.push(durationMs);
    
    // Keep only last 100 measurements
    if (this.metrics.processingTime.length > 100) {
      this.metrics.processingTime.shift();
    }
  }
  
  recordFailure(): void {
    this.metrics.failed++;
  }
  
  getStats() {
    const avgProcessingTime = this.metrics.processingTime.length > 0
      ? this.metrics.processingTime.reduce((a, b) => a + b) / this.metrics.processingTime.length
      : 0;
    
    return {
      ...this.metrics,
      avgProcessingTime,
      successRate: this.metrics.processed / (this.metrics.processed + this.metrics.failed),
    };
  }
}
```

## Best Practices

### 1. Error Handling

Always implement robust error handling:

```typescript
class SafeQueue<T> {
  async processTask(task: T): Promise<void> {
    try {
      await this.handler(task);
    } catch (error) {
      // Log error
      console.error('Task processing failed:', error);
      
      // Retry logic
      if (task.retries < this.maxRetries) {
        task.retries++;
        this.enqueue(task); // Re-queue for retry
      } else {
        // Move to dead letter queue
        await this.deadLetterQueue.enqueue(task);
      }
    }
  }
}
```

### 2. Graceful Shutdown

Implement clean shutdown procedures:

```typescript
class GracefulQueue {
  private isShuttingDown = false;
  
  async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    
    // Stop accepting new tasks
    this.enqueue = () => {
      throw new Error('Queue is shutting down');
    };
    
    // Wait for current tasks to complete
    while (this.processingCount > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Save unprocessed tasks
    await this.persistUnprocessedTasks();
  }
}
```

### 3. Memory Management

Prevent memory leaks with queue size limits:

```typescript
class BoundedQueue<T> {
  constructor(private maxSize: number) {}
  
  enqueue(task: T): boolean {
    if (this.queue.length >= this.maxSize) {
      // Reject or implement overflow strategy
      return false;
    }
    
    this.queue.push(task);
    return true;
  }
}
```

## Integration with Project Wiz

For the agent system, combine these patterns:

```typescript
export class AgentTaskQueue {
  private priorityQueue: PriorityTaskQueue;
  private persistentQueue: PersistentQueue;
  private metrics: QueueMetrics;
  
  constructor(db: Database) {
    this.priorityQueue = new PriorityTaskQueue();
    this.persistentQueue = new PersistentQueue(db);
    this.metrics = new QueueMetrics();
  }
  
  async enqueueTask(
    task: AgentTask,
    priority: TaskPriority = 'normal'
  ): Promise<string> {
    // Persist to database
    const taskId = await this.persistentQueue.enqueue(task, priority);
    
    // Add to memory queue for fast access
    this.priorityQueue.enqueue({ ...task, id: taskId }, priority);
    
    this.metrics.recordEnqueue();
    return taskId;
  }
}
```