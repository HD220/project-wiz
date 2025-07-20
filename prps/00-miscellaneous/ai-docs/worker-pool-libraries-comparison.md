# Worker Pool Libraries Comparison

## Overview

This document compares popular Node.js worker pool libraries to help choose the best option for the Project Wiz agent system. Each library has different strengths and use cases.

## Library Comparison Table

| Feature                 | Piscina           | Workerpool                                 | Poolifier               | threads.js                  |
| ----------------------- | ----------------- | ------------------------------------------ | ----------------------- | --------------------------- |
| **GitHub Stars**        | 2.9k+             | 2k+                                        | 2.7k+                   | 3k+                         |
| **TypeScript Support**  | Excellent         | Good                                       | Excellent               | Excellent                   |
| **Worker Types**        | Worker Threads    | Worker Threads, Child Process, Web Workers | Worker Threads, Cluster | Worker Threads, Web Workers |
| **Dynamic Pool Sizing** | Yes               | Yes                                        | Yes                     | No                          |
| **Task Cancellation**   | Yes               | Yes                                        | Yes                     | Limited                     |
| **Task Priority**       | No                | No                                         | Yes                     | No                          |
| **Built-in Retry**      | No                | No                                         | Yes                     | No                          |
| **Memory Sharing**      | SharedArrayBuffer | Limited                                    | SharedArrayBuffer       | Yes                         |
| **Learning Curve**      | Low               | Low                                        | Medium                  | High                        |
| **Performance**         | Excellent         | Good                                       | Excellent               | Good                        |
| **Bundle Size**         | Small             | Medium                                     | Small                   | Large                       |

## Detailed Analysis

### 1. Piscina (Recommended for Project Wiz)

**Repository**: https://github.com/piscinajs/piscina

**Strengths**:

- Designed specifically for Node.js worker threads
- Excellent TypeScript support with full type definitions
- Simple, clean API inspired by Web Workers
- Automatic pool management
- Built-in resource limits (memory, time)
- Supports transferable objects for zero-copy data transfer
- Maintained by Node.js contributors

**Example Usage**:

```typescript
import Piscina from "piscina";
import path from "path";

const pool = new Piscina({
  filename: path.resolve(__dirname, "worker.js"),
  maxThreads: 4,
  idleTimeout: 30000,
  maxQueue: "auto",
  resourceLimits: {
    maxOldGenerationSizeMb: 256,
    maxYoungGenerationSizeMb: 64,
  },
});

// Execute task
const result = await pool.run({
  action: "processCode",
  data: codeContent,
});

// With AbortController for cancellation
const abortController = new AbortController();
const task = pool.run(data, { signal: abortController.signal });

// Cancel if needed
abortController.abort();
```

**Best For**:

- CPU-intensive tasks
- Applications requiring strict resource limits
- Projects prioritizing performance and simplicity

### 2. Workerpool

**Repository**: https://github.com/josdejong/workerpool

**Strengths**:

- Supports multiple worker types (threads, child processes, web workers)
- Works in both Node.js and browsers
- Proxy-based API for calling worker methods
- Automatic function offloading
- Good error handling and debugging

**Example Usage**:

```typescript
import workerpool from "workerpool";

// Create pool
const pool = workerpool.pool("./worker.js", {
  minWorkers: 2,
  maxWorkers: 4,
  workerType: "thread", // or 'process', 'web'
});

// Method 1: Execute named function
const result = await pool.exec("processTask", [taskData]);

// Method 2: Execute anonymous function
const result = await pool.exec(
  (data) => {
    // This runs in worker
    return data.map((x) => x * 2);
  },
  [arrayData],
);

// Proxy API
const worker = await pool.proxy();
const result = await worker.processTask(taskData);
```

**Best For**:

- Cross-platform applications (Node.js + Browser)
- Projects needing different worker types
- Simple function offloading

### 3. Poolifier

**Repository**: https://github.com/poolifier/poolifier

**Strengths**:

- High performance with benchmarks
- Multiple pool types (Fixed, Dynamic)
- Task priority support
- Built-in retry mechanism
- Comprehensive event system
- Worker choice strategies (Round Robin, Least Used, etc.)
- Both sync and async task execution

**Example Usage**:

```typescript
import { DynamicThreadPool, WorkerChoiceStrategies } from "poolifier";

const pool = new DynamicThreadPool(
  2, // min workers
  4, // max workers
  "./worker.js",
  {
    workerChoiceStrategy: WorkerChoiceStrategies.LEAST_USED,
    enableTasksQueue: true,
    tasksQueueOptions: {
      concurrency: 1,
      queueMaxSize: 100,
    },
    errorHandler: (error) => console.error(error),
    messageHandler: (message) => console.log(message),
  },
);

// Execute with priority
const result = await pool.execute(taskData, "processTask", {
  priority: 10, // Higher number = higher priority
});

// With retry
pool.setTasksQueueOptions({
  concurrency: 1,
  retries: 3,
  retryDelay: 1000,
});
```

**Best For**:

- Applications requiring fine-grained control
- Systems with task prioritization needs
- High-performance requirements with specific strategies

### 4. threads.js

**Repository**: https://github.com/andywer/threads.js

**Strengths**:

- Modern API with Observables support
- Excellent TypeScript integration
- Supports async generators
- Built-in RPC-style communication
- Transfer of complex objects
- Works with webpack

**Example Usage**:

```typescript
import { spawn, Thread, Worker } from "threads";

// Spawn a worker
const worker = await spawn(new Worker("./worker"));

// Type-safe method calls
const result = await worker.processTask(data);

// Observable support
const observable = worker.streamData();
observable.subscribe((chunk) => console.log(chunk));

// Transfer ownership
const buffer = new ArrayBuffer(1024);
await worker.processBuffer(Transfer(buffer));

// Cleanup
await Thread.terminate(worker);
```

**Best For**:

- Modern TypeScript applications
- Projects using RxJS/Observables
- Complex data streaming scenarios

## Decision Matrix for Project Wiz

### Requirements Analysis

1. **TypeScript Support**: Critical ✓
2. **Worker Threads Only**: Preferred (no need for child processes)
3. **Simple API**: Important for maintainability
4. **Resource Limits**: Important for agent safety
5. **Task Cancellation**: Required for long-running AI tasks
6. **Performance**: High priority
7. **Active Maintenance**: Critical

### Recommendation: Piscina

For Project Wiz's agent system, **Piscina** is the recommended choice because:

1. **Purpose-Built**: Designed specifically for Node.js worker threads
2. **Resource Control**: Built-in memory and CPU limits for agent safety
3. **Simple API**: Easy to integrate with existing service patterns
4. **TypeScript**: Excellent type definitions
5. **Performance**: Optimized for CPU-intensive tasks like AI processing
6. **Cancellation**: Native AbortController support for stopping tasks
7. **Maintenance**: Actively maintained by Node.js contributors

### Implementation Strategy

```typescript
// agent-pool.ts for Project Wiz
import Piscina from "piscina";
import path from "path";

export class AgentWorkerPool {
  private pool: Piscina;

  constructor() {
    this.pool = new Piscina({
      filename: path.resolve(__dirname, "agent.worker.js"),
      maxThreads: Math.max(2, cpus().length - 1),
      idleTimeout: 60000, // 1 minute
      resourceLimits: {
        maxOldGenerationSizeMb: 512,
        maxYoungGenerationSizeMb: 128,
      },
    });
  }

  async processAgentTask(task: AgentTask): Promise<TaskResult> {
    return this.pool.run(task, {
      name: "processAgentTask",
    });
  }

  async shutdown(): Promise<void> {
    await this.pool.destroy();
  }

  getStats() {
    return {
      threads: this.pool.threads.length,
      queueSize: this.pool.queueSize,
      utilization: this.pool.utilization,
    };
  }
}
```

## Migration Guide

If you need to switch libraries later:

### From Piscina to Workerpool:

```typescript
// Piscina
const result = await pool.run(data);

// Workerpool equivalent
const result = await pool.exec("processTask", [data]);
```

### From Piscina to Poolifier:

```typescript
// Piscina
const pool = new Piscina({ filename: "./worker.js" });

// Poolifier equivalent
const pool = new FixedThreadPool(4, "./worker.js");
```

## Performance Benchmarks

Based on community benchmarks for CPU-intensive tasks:

1. **Poolifier**: ~100% (baseline)
2. **Piscina**: ~95-98%
3. **Workerpool**: ~85-90%
4. **threads.js**: ~80-85%

Note: Performance varies based on task type and configuration.

## Conclusion

While all libraries are production-ready, Piscina offers the best balance of simplicity, performance, and features for Project Wiz's agent system. Its focus on worker threads, resource management, and clean API makes it ideal for managing AI agent workers safely and efficiently.
