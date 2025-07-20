# Electron Worker Threads Guide

## Overview

This document covers best practices for implementing worker threads in Electron applications, specifically for the Project Wiz agent system.

## Worker Threads in Electron

### Key Configuration

To use Node.js features in Electron's Web Workers:

```javascript
// In main.ts - BrowserWindow configuration
mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegrationInWorker: true, // CRITICAL: Enable Node.js in workers
    nodeIntegration: false, // Keep false for security
    contextIsolation: true, // Keep true for security
    sandbox: false, // Must be false for nodeIntegrationInWorker
  },
});
```

### Important Limitations

1. **No Electron APIs in Workers**: Workers cannot access Electron's built-in modules
2. **Node.js APIs Available**: All Node.js built-in modules work in workers
3. **Asar Support**: Can read from asar archives using Node.js APIs
4. **Multi-threaded Environment**: Avoid Electron's built-in modules

## Worker Pool Pattern

### Why Use a Worker Pool?

> "In practice, use a pool of Workers for these kinds of tasks. Otherwise, the overhead of creating Workers would likely exceed their benefit."

Creating workers has significant overhead. A pool allows:

- Reusable workers for multiple tasks
- Capped maximum workers (typically CPU count - 1)
- Queue management for incoming tasks
- Efficient resource utilization

### Basic Worker Pool Implementation

```typescript
// worker-pool.ts
import { Worker } from "worker_threads";
import { cpus } from "os";

export class WorkerPool {
  private workers: Worker[] = [];
  private idleWorkers: Worker[] = [];
  private taskQueue: Array<{ task: any; resolve: Function; reject: Function }> =
    [];
  private maxWorkers: number;

  constructor(workerScript: string, maxWorkers?: number) {
    this.maxWorkers = maxWorkers || cpus().length - 1;
    this.initializeWorkers(workerScript);
  }

  private initializeWorkers(workerScript: string) {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(workerScript);

      worker.on("message", (result) => {
        // Mark worker as idle and process next task
        this.idleWorkers.push(worker);
        this.processNextTask();
      });

      worker.on("error", (error) => {
        console.error("Worker error:", error);
      });

      this.workers.push(worker);
      this.idleWorkers.push(worker);
    }
  }

  async execute(task: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ task, resolve, reject });
      this.processNextTask();
    });
  }

  private processNextTask() {
    if (this.taskQueue.length === 0 || this.idleWorkers.length === 0) {
      return;
    }

    const worker = this.idleWorkers.pop()!;
    const { task, resolve, reject } = this.taskQueue.shift()!;

    worker.once("message", (result) => {
      this.idleWorkers.push(worker);
      resolve(result);
      this.processNextTask();
    });

    worker.once("error", (error) => {
      this.idleWorkers.push(worker);
      reject(error);
      this.processNextTask();
    });

    worker.postMessage(task);
  }
}
```

## Recommended Libraries

Instead of implementing your own pool, consider battle-tested libraries:

### 1. **Piscina** (Recommended)

```bash
npm install piscina
```

```typescript
import Piscina from "piscina";

const pool = new Piscina({
  filename: path.resolve(__dirname, "worker.js"),
  maxThreads: 4,
  idleTimeout: 30000,
});

const result = await pool.run({ task: "process-code" });
```

### 2. **Workerpool**

```bash
npm install workerpool
```

```typescript
import workerpool from "workerpool";

const pool = workerpool.pool("./worker.js", {
  minWorkers: 2,
  maxWorkers: 4,
});

const result = await pool.exec("processTask", [taskData]);
```

### 3. **Poolifier**

```bash
npm install poolifier
```

## TypeScript Integration

### Worker Thread with TypeScript

```typescript
// agent.worker.ts
import { parentPort, workerData } from "worker_threads";

interface WorkerMessage {
  type: "PROCESS_TASK" | "SHUTDOWN";
  taskId: string;
  data: any;
}

if (parentPort) {
  parentPort.on("message", async (message: WorkerMessage) => {
    try {
      switch (message.type) {
        case "PROCESS_TASK":
          const result = await processTask(message.data);
          parentPort.postMessage({
            type: "TASK_COMPLETE",
            taskId: message.taskId,
            result,
          });
          break;

        case "SHUTDOWN":
          process.exit(0);
          break;
      }
    } catch (error) {
      parentPort.postMessage({
        type: "TASK_ERROR",
        taskId: message.taskId,
        error: error.message,
      });
    }
  });
}

async function processTask(data: any) {
  // Task processing logic
  return { success: true };
}
```

### TypeScript Compilation

```json
// tsconfig.json adjustments
{
  "compilerOptions": {
    "module": "commonjs", // Important for worker compatibility
    "esModuleInterop": true,
    "preserveConstEnums": true
  }
}
```

## Electron-Specific Patterns

### Launching Workers from Preload Scripts

In Electron, workers can be launched from preload scripts:

```typescript
// preload.ts
import { Worker } from "worker_threads";

const worker = new Worker("./worker.js");

contextBridge.exposeInMainWorld("workerAPI", {
  runTask: (data: any) => {
    return new Promise((resolve, reject) => {
      worker.postMessage(data);
      worker.once("message", resolve);
      worker.once("error", reject);
    });
  },
});
```

### IPC Communication Pattern

For Project Wiz, use IPC to coordinate between main process and workers:

```typescript
// main process
ipcMain.handle("agent:process-task", async (event, taskData) => {
  const result = await workerPool.execute(taskData);
  return { success: true, data: result };
});

// worker thread
parentPort.on("message", async (task) => {
  // Process task
  const result = await processWithAI(task);

  // Send result back to main process via IPC
  parentPort.postMessage(result);
});
```

## Best Practices

### 1. When to Use Worker Threads

**Use Workers for:**

- CPU-intensive tasks (code parsing, analysis)
- Long-running AI model inference
- Blocking operations that would freeze UI

**Don't Use Workers for:**

- I/O operations (use async Node.js APIs)
- Simple async tasks (use Promises)
- Short-lived operations (overhead exceeds benefit)

### 2. Resource Management

```typescript
class ManagedWorkerPool {
  async shutdown() {
    // Gracefully shutdown all workers
    await Promise.all(
      this.workers.map((worker) => {
        return new Promise((resolve) => {
          worker.postMessage({ type: "SHUTDOWN" });
          worker.once("exit", resolve);
        });
      }),
    );
  }
}
```

### 3. Error Handling

```typescript
worker.on("error", (error) => {
  logger.error("Worker thread error:", error);
  // Restart worker or handle gracefully
});

worker.on("exit", (code) => {
  if (code !== 0) {
    logger.error(`Worker stopped with exit code ${code}`);
    // Replace worker in pool
  }
});
```

## Performance Considerations

1. **Worker Pool Size**: Default to `os.cpus().length - 1`
2. **Idle Timeout**: Terminate idle workers after 30-60 seconds
3. **Task Batching**: Group small tasks to reduce overhead
4. **Memory Limits**: Set max memory per worker
5. **Monitoring**: Track worker utilization and queue depth

## References

- [Node.js Worker Threads Documentation](https://nodejs.org/api/worker_threads.html)
- [Electron Multithreading Guide](https://www.electronjs.org/docs/latest/tutorial/multithreading)
- [Piscina - Worker Thread Pool](https://github.com/piscinajs/piscina)
- [Node.js AsyncResource for Worker Pools](https://nodejs.org/api/async_context.html#class-asyncresource)
