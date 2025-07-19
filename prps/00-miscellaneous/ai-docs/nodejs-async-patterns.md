# Node.js Async Patterns for AI Applications

## Overview

This document covers asynchronous programming patterns in Node.js that are particularly relevant for AI applications and the Project Wiz agent system. Understanding these patterns is crucial for building efficient, non-blocking systems.

## Core Async Concepts

### Event Loop Fundamentals

The Node.js event loop processes asynchronous operations in phases:

```
   ┌───────────────────────────┐
┌─>│           timers          │ (setTimeout, setInterval)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │ (I/O callbacks)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │ (internal use)
│  └─────────────┬─────────────┘      ┌───────────────┐
│  ┌─────────────┴─────────────┐      │   incoming:   │
│  │           poll            │<─────┤  connections, │
│  └─────────────┬─────────────┘      │   data, etc.  │
│  ┌─────────────┴─────────────┐      └───────────────┘
│  │           check           │ (setImmediate)
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │ (socket.on('close'))
   └───────────────────────────┘
```

## Basic Async Patterns

### 1. Callback Pattern (Legacy)

While callbacks are considered legacy, understanding them helps with older APIs:

```typescript
// Anti-pattern: Callback Hell
function processTask(data, callback) {
  validateData(data, (err, valid) => {
    if (err) return callback(err);
    
    transformData(valid, (err, transformed) => {
      if (err) return callback(err);
      
      saveData(transformed, (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
    });
  });
}
```

### 2. Promise Pattern

Modern approach using Promises:

```typescript
async function processTask(data: any): Promise<Result> {
  const valid = await validateData(data);
  const transformed = await transformData(valid);
  const result = await saveData(transformed);
  return result;
}

// Error handling
async function safeProcessTask(data: any): Promise<Result | null> {
  try {
    return await processTask(data);
  } catch (error) {
    console.error('Task processing failed:', error);
    return null;
  }
}
```

### 3. Async Iteration

For processing streams of data:

```typescript
// Async generator for AI responses
async function* generateAIResponses(prompts: string[]) {
  for (const prompt of prompts) {
    const response = await callAIModel(prompt);
    yield response;
  }
}

// Consuming async iterator
async function processResponses() {
  for await (const response of generateAIResponses(prompts)) {
    console.log('AI Response:', response);
  }
}
```

## Advanced Async Patterns

### 1. Parallel Execution

Running multiple async operations simultaneously:

```typescript
// Process multiple AI tasks in parallel
async function processMultipleAgentTasks(tasks: AgentTask[]) {
  // All tasks run in parallel
  const results = await Promise.all(
    tasks.map(task => processAgentTask(task))
  );
  
  return results;
}

// With error handling for individual tasks
async function processTasksSafely(tasks: AgentTask[]) {
  const results = await Promise.allSettled(
    tasks.map(task => processAgentTask(task))
  );
  
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
    
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => r.reason);
    
  return { successful, failed };
}
```

### 2. Controlled Concurrency

Limiting parallel operations to prevent resource exhaustion:

```typescript
import pLimit from 'p-limit';

// Limit to 3 concurrent AI API calls
const limit = pLimit(3);

async function processWithConcurrencyLimit(prompts: string[]) {
  const promises = prompts.map(prompt => 
    limit(() => callAIModel(prompt))
  );
  
  return Promise.all(promises);
}

// Manual implementation
async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(item => processor(item))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

### 3. Retry Pattern

Handling transient failures in AI API calls:

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}

// Usage with AI API
const response = await retryWithBackoff(
  () => openai.generateText({ prompt }),
  5,  // max retries
  2000 // base delay
);
```

### 4. Circuit Breaker Pattern

Preventing cascading failures:

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private threshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}
  
  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailTime > this.timeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}
```

## Stream Processing Patterns

### 1. Transform Streams for AI Processing

```typescript
import { Transform } from 'stream';

class AIProcessingStream extends Transform {
  constructor(private model: AIModel) {
    super({ objectMode: true });
  }
  
  async _transform(chunk: any, encoding: string, callback: Function) {
    try {
      const processed = await this.model.process(chunk);
      callback(null, processed);
    } catch (error) {
      callback(error);
    }
  }
}

// Pipeline for processing
import { pipeline } from 'stream/promises';

await pipeline(
  inputStream,
  new AIProcessingStream(model),
  outputStream
);
```

### 2. Backpressure Handling

Managing flow control in streams:

```typescript
class RateLimitedStream extends Transform {
  private lastProcessTime = 0;
  
  constructor(private minInterval: number) {
    super({ objectMode: true });
  }
  
  async _transform(chunk: any, encoding: string, callback: Function) {
    const now = Date.now();
    const timeSinceLastProcess = now - this.lastProcessTime;
    
    if (timeSinceLastProcess < this.minInterval) {
      // Apply backpressure
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastProcess)
      );
    }
    
    this.lastProcessTime = Date.now();
    callback(null, chunk);
  }
}
```

## Event-Driven Patterns

### 1. Event Emitter for Agent Communication

```typescript
import { EventEmitter } from 'events';

class AgentEventBus extends EventEmitter {
  // Type-safe event emitter
  emit(event: 'task:started', taskId: string): boolean;
  emit(event: 'task:completed', taskId: string, result: any): boolean;
  emit(event: 'task:failed', taskId: string, error: Error): boolean;
  emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }
  
  on(event: 'task:started', listener: (taskId: string) => void): this;
  on(event: 'task:completed', listener: (taskId: string, result: any) => void): this;
  on(event: 'task:failed', listener: (taskId: string, error: Error) => void): this;
  on(event: string, listener: Function): this {
    return super.on(event, listener);
  }
}
```

### 2. Async Event Handling

```typescript
class AsyncEventEmitter extends EventEmitter {
  async emitAsync(event: string, ...args: any[]): Promise<void> {
    const listeners = this.listeners(event);
    
    await Promise.all(
      listeners.map(listener => 
        Promise.resolve(listener(...args))
      )
    );
  }
}
```

## Memory-Efficient Patterns

### 1. Lazy Evaluation

```typescript
class LazyAIProcessor {
  private cache = new Map<string, Promise<any>>();
  
  async process(key: string, generator: () => Promise<any>): Promise<any> {
    if (!this.cache.has(key)) {
      // Store the promise, not the result
      this.cache.set(key, generator());
    }
    
    return this.cache.get(key)!;
  }
}
```

### 2. Resource Pooling

```typescript
class AIModelPool {
  private available: AIModel[] = [];
  private inUse = new Set<AIModel>();
  
  async acquire(): Promise<AIModel> {
    // Wait for available model
    while (this.available.length === 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const model = this.available.pop()!;
    this.inUse.add(model);
    return model;
  }
  
  release(model: AIModel): void {
    this.inUse.delete(model);
    this.available.push(model);
  }
  
  async withModel<T>(fn: (model: AIModel) => Promise<T>): Promise<T> {
    const model = await this.acquire();
    try {
      return await fn(model);
    } finally {
      this.release(model);
    }
  }
}
```

## Performance Optimization Patterns

### 1. Debouncing Async Operations

```typescript
function debounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T {
  let timeoutId: NodeJS.Timeout;
  let pending: Promise<any> | null = null;
  
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    
    if (!pending) {
      pending = new Promise(resolve => {
        timeoutId = setTimeout(async () => {
          const result = await fn(...args);
          pending = null;
          resolve(result);
        }, delay);
      });
    }
    
    return pending;
  }) as T;
}
```

### 2. Request Coalescing

```typescript
class RequestCoalescer {
  private pending = new Map<string, Promise<any>>();
  
  async request(key: string, fetcher: () => Promise<any>): Promise<any> {
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }
    
    const promise = fetcher().finally(() => {
      this.pending.delete(key);
    });
    
    this.pending.set(key, promise);
    return promise;
  }
}
```

## Best Practices for AI Applications

### 1. Graceful Degradation

```typescript
async function callAIWithFallback(prompt: string): Promise<string> {
  try {
    // Try primary AI model
    return await primaryModel.generate(prompt);
  } catch (error) {
    console.warn('Primary model failed, trying fallback:', error);
    
    try {
      // Fallback to secondary model
      return await secondaryModel.generate(prompt);
    } catch (fallbackError) {
      // Final fallback to cached/default response
      return getCachedResponse(prompt) || 'Unable to process request';
    }
  }
}
```

### 2. Progress Tracking

```typescript
interface ProgressTracker {
  onProgress: (progress: number) => void;
}

async function processWithProgress(
  tasks: Task[],
  tracker: ProgressTracker
): Promise<Result[]> {
  const results: Result[] = [];
  const total = tasks.length;
  
  for (let i = 0; i < total; i++) {
    results.push(await processTask(tasks[i]));
    tracker.onProgress((i + 1) / total * 100);
  }
  
  return results;
}
```

## Integration with Project Wiz

For the agent system, combine these patterns:

```typescript
export class AgentTaskProcessor {
  private circuitBreaker = new CircuitBreaker();
  private requestCoalescer = new RequestCoalescer();
  private concurrencyLimit = pLimit(3);
  
  async processAgentTask(task: AgentTask): Promise<TaskResult> {
    // Circuit breaker protection
    return this.circuitBreaker.call(async () => {
      // Request coalescing for similar prompts
      return this.requestCoalescer.request(
        task.promptHash,
        async () => {
          // Concurrency limiting
          return this.concurrencyLimit(async () => {
            // Retry with backoff
            return retryWithBackoff(
              () => this.callAI(task),
              3,
              1000
            );
          });
        }
      );
    });
  }
}
```

## Conclusion

These async patterns form the foundation for building robust, scalable AI applications. By combining appropriate patterns, you can create systems that handle failures gracefully, manage resources efficiently, and provide optimal performance for AI workloads.