# Task 09B: Background Worker System - Enhanced

## Overview

Implement the background worker system that processes agent tasks using worker threads and AI integration. This micro-task builds on the task queue foundation to enable autonomous agent task execution in the background without blocking the main application.

## User Value

After completing this task, users can:
- Watch agents autonomously process tasks in the background
- See real-time progress updates during task execution
- Benefit from parallel task processing capabilities
- Experience smooth UI while intensive tasks run

## Technical Requirements

### Prerequisites
- Task 09A: Task Queue Foundation must be completed
- Existing agent chat service with AI integration
- LLM provider system operational

### Additional Database Schema

```sql
-- Worker tracking table for managing background processes
CREATE TABLE task_workers (
    id TEXT PRIMARY KEY,
    worker_pid INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    current_task_id TEXT REFERENCES agent_tasks(id),
    last_heartbeat INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    started_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    processed_tasks_count INTEGER DEFAULT 0
);

-- Execution log for detailed task tracking
ALTER TABLE agent_tasks ADD COLUMN execution_log TEXT; -- JSON array of execution steps
ALTER TABLE agent_tasks ADD COLUMN started_at INTEGER; -- When execution began
ALTER TABLE agent_tasks ADD COLUMN completed_at INTEGER; -- When task finished
ALTER TABLE agent_tasks ADD COLUMN actual_duration INTEGER; -- Actual time taken
ALTER TABLE agent_tasks ADD COLUMN total_steps INTEGER;
```

### Core Types

```typescript
export interface TaskWorker {
  id: string;
  workerPid?: number;
  isActive: boolean;
  currentTaskId?: string;
  lastHeartbeat: Date;
  startedAt: Date;
  processedTasksCount: number;
}

export interface ExecutionLogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

export interface TaskResult {
  summary: string;
  output: any;
  artifacts?: string[]; // File paths to generated artifacts
  metrics?: {
    tokensUsed: number;
    requestCount: number;
    executionTime: number;
  };
}
```

## Implementation Steps

### 1. Enhanced Task Service

```typescript
// Update src/main/agents/task-queue/task-queue.service.ts
import { TaskWorkerManager } from './task-worker';

export class TaskQueueService {
  private static workerManager: TaskWorkerManager | null = null;

  // Initialize worker system
  static async initializeWorkers(): Promise<void> {
    if (!this.workerManager) {
      this.workerManager = new TaskWorkerManager();
      await this.workerManager.start();
    }
  }

  // Shutdown worker system
  static async shutdownWorkers(): Promise<void> {
    if (this.workerManager) {
      await this.workerManager.stop();
      this.workerManager = null;
    }
  }

  // Queue task for background processing
  static async queueTask(taskId: string): Promise<void> {
    const db = getDatabase();

    await db
      .update(agentTasksTable)
      .set({
        status: 'queued',
        updatedAt: new Date(),
      })
      .where(eq(agentTasksTable.id, taskId));

    // Ensure workers are running
    await this.initializeWorkers();
  }

  // Enhanced update with execution logging
  static async updateTaskProgress(
    taskId: string,
    updates: {
      status?: TaskStatus;
      progressPercentage?: number;
      currentStep?: string;
      totalSteps?: number;
      executionLog?: ExecutionLogEntry[];
      errorMessage?: string;
      result?: any;
    }
  ): Promise<void> {
    const db = getDatabase();

    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // Handle status-specific updates
    if (updates.status === 'running') {
      updateData.startedAt = new Date();
    } else if (updates.status === 'completed' || updates.status === 'failed') {
      updateData.completedAt = new Date();
      
      // Calculate actual duration
      const [current] = await db
        .select({ startedAt: agentTasksTable.startedAt })
        .from(agentTasksTable)
        .where(eq(agentTasksTable.id, taskId))
        .limit(1);

      if (current?.startedAt) {
        updateData.actualDuration = Math.floor(
          (Date.now() - new Date(current.startedAt).getTime()) / 1000
        );
      }
    }

    // Serialize complex objects
    if (updates.executionLog) {
      updateData.executionLog = JSON.stringify(updates.executionLog);
    }
    if (updates.result) {
      updateData.result = JSON.stringify(updates.result);
    }

    await db
      .update(agentTasksTable)
      .set(updateData)
      .where(eq(agentTasksTable.id, taskId));
  }

  // Get active workers
  static async getActiveWorkers(): Promise<TaskWorker[]> {
    const db = getDatabase();

    const workers = await db
      .select()
      .from(taskWorkersTable)
      .where(eq(taskWorkersTable.isActive, true));

    return workers.map(worker => ({
      ...worker,
      lastHeartbeat: new Date(worker.lastHeartbeat),
      startedAt: new Date(worker.startedAt),
    }));
  }
}
```

### 2. Task Worker Implementation

```typescript
// src/main/agents/task-queue/task-worker.ts
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { getDatabase } from '../../database/connection';
import { TaskQueueService } from './task-queue.service';
import { AgentService } from '../agent.service';
import { LlmProviderService } from '../../llm/llm-provider.service';
import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { generateText } from 'ai';
import type { AgentTask, ExecutionLogEntry } from './task-queue.types';

export class TaskWorker {
  private workerId: string;
  private isRunning = false;
  private currentTask: AgentTask | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(workerId: string) {
    this.workerId = workerId;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log(`Task worker ${this.workerId} started`);

    // Start heartbeat
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 30000); // Every 30 seconds

    // Main processing loop
    while (this.isRunning) {
      try {
        const task = await TaskQueueService.getNextTask();
        
        if (task) {
          await this.processTask(task);
        } else {
          // No tasks available, wait before checking again
          await this.sleep(5000);
        }
      } catch (error) {
        console.error(`Worker ${this.workerId} error:`, error);
        await this.sleep(10000); // Wait longer on error
      }
    }

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    
    if (this.currentTask) {
      await TaskQueueService.updateTaskProgress(this.currentTask.id, {
        status: 'failed',
        errorMessage: 'Worker shutdown during task execution',
      });
    }
  }

  private async processTask(task: AgentTask): Promise<void> {
    this.currentTask = task;
    
    try {
      // Update task status to running
      await TaskQueueService.updateTaskProgress(task.id, {
        status: 'running',
        progressPercentage: 0,
        currentStep: 'Initializing task',
        totalSteps: 5, // Standard steps: init, setup, execute, process, finalize
      });

      // Get agent and provider details
      const agent = await AgentService.findById(task.agentId);
      if (!agent) {
        throw new Error('Agent not found');
      }

      const provider = await LlmProviderService.findById(agent.llmProviderId);
      if (!provider) {
        throw new Error('LLM provider not found');
      }

      // Execute the task
      const result = await this.executeAgentTask(task, agent, provider);

      // Mark task as completed
      await TaskQueueService.updateTaskProgress(task.id, {
        status: 'completed',
        progressPercentage: 100,
        currentStep: 'Task completed',
        result,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if we should retry
      if (task.retryCount < task.maxRetries) {
        await TaskQueueService.updateTaskProgress(task.id, {
          status: 'queued', // Put back in queue for retry
          errorMessage,
          executionLog: [...(task.executionLog || []), {
            timestamp: new Date(),
            level: 'error',
            message: `Retry ${task.retryCount + 1}/${task.maxRetries}: ${errorMessage}`,
          }],
        });
      } else {
        await TaskQueueService.updateTaskProgress(task.id, {
          status: 'failed',
          errorMessage,
          executionLog: [...(task.executionLog || []), {
            timestamp: new Date(),
            level: 'error',
            message: `Task failed after ${task.maxRetries} retries: ${errorMessage}`,
          }],
        });
      }
    } finally {
      this.currentTask = null;
    }
  }

  private async executeAgentTask(task: AgentTask, agent: any, provider: any): Promise<any> {
    // Log execution start
    const executionLog: ExecutionLogEntry[] = [...(task.executionLog || [])];
    
    const addLog = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
      executionLog.push({
        timestamp: new Date(),
        level,
        message,
        data,
      });
    };

    addLog('info', 'Starting task execution');

    // Update progress: Configuring AI provider
    await TaskQueueService.updateTaskProgress(task.id, {
      progressPercentage: 20,
      currentStep: 'Configuring AI provider',
      executionLog,
    });

    // Create AI provider instance
    const aiProvider = this.createAIProvider(provider);
    const modelConfig = JSON.parse(agent.modelParameters || '{}');

    addLog('info', 'AI provider configured', { provider: provider.type });

    // Update progress: Preparing agent context
    await TaskQueueService.updateTaskProgress(task.id, {
      progressPercentage: 40,
      currentStep: 'Preparing agent context',
      executionLog,
    });

    // Prepare system prompt with agent personality and task context
    const systemPrompt = `You are ${agent.name}, a ${agent.role}.

Background: ${agent.backstory}

Current Goal: ${agent.instructions}

Task Instructions:
${task.instructions}

Please complete this task step by step, providing detailed explanations of your approach and reasoning.
Focus on delivering high-quality results that match the task requirements.`;

    addLog('info', 'System prompt prepared');

    // Update progress: Executing AI task
    await TaskQueueService.updateTaskProgress(task.id, {
      progressPercentage: 60,
      currentStep: 'Executing AI task',
      executionLog,
    });

    // Execute the task with the AI
    const response = await generateText({
      model: aiProvider(provider.model || 'gpt-3.5-turbo'),
      system: systemPrompt,
      prompt: `Task: ${task.title}\n\nDescription: ${task.description}\n\nPlease complete this task thoroughly and provide your results.`,
      temperature: modelConfig.temperature || 0.7,
      maxTokens: modelConfig.maxTokens || 2000,
    });

    addLog('info', 'AI task completed', { 
      tokensUsed: response.usage?.totalTokens || 0 
    });

    // Update progress: Processing results
    await TaskQueueService.updateTaskProgress(task.id, {
      progressPercentage: 80,
      currentStep: 'Processing results',
      executionLog,
    });

    // Prepare final result
    const result = {
      summary: `Task "${task.title}" completed successfully`,
      output: response.text,
      metrics: {
        tokensUsed: response.usage?.totalTokens || 0,
        requestCount: 1,
        executionTime: task.actualDuration || 0,
      },
    };

    addLog('info', 'Task results processed', result.metrics);

    // Final progress update
    await TaskQueueService.updateTaskProgress(task.id, {
      progressPercentage: 100,
      currentStep: 'Finalizing',
      executionLog,
    });

    return result;
  }

  private createAIProvider(provider: any) {
    switch (provider.type) {
      case 'openai':
        return createOpenAI({
          apiKey: provider.apiKey, // Assume decrypted
        });
      case 'deepseek':
        return createDeepSeek({
          apiKey: provider.apiKey,
        });
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }

  private async sendHeartbeat(): Promise<void> {
    // Update worker heartbeat in database
    try {
      const db = getDatabase();
      await db
        .update(taskWorkersTable)
        .set({
          lastHeartbeat: new Date(),
          currentTaskId: this.currentTask?.id || null,
        })
        .where(eq(taskWorkersTable.id, this.workerId));
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Worker Manager for spawning and managing workers
export class TaskWorkerManager {
  private workers: Worker[] = [];
  private maxWorkers = 3;

  async start(): Promise<void> {
    console.log('Starting task worker manager');
    
    for (let i = 0; i < this.maxWorkers; i++) {
      await this.spawnWorker();
    }
  }

  async stop(): Promise<void> {
    console.log('Stopping task worker manager');
    
    await Promise.all(
      this.workers.map(worker => {
        return new Promise<void>((resolve) => {
          worker.terminate().then(() => resolve());
        });
      })
    );
    
    this.workers = [];
  }

  private async spawnWorker(): Promise<void> {
    const worker = new Worker(__filename, {
      workerData: { workerId: `worker-${Date.now()}-${Math.random()}` }
    });

    worker.on('error', (error) => {
      console.error('Worker error:', error);
      this.respawnWorker(worker);
    });

    worker.on('exit', (code) => {
      console.log(`Worker exited with code ${code}`);
      this.respawnWorker(worker);
    });

    this.workers.push(worker);
  }

  private async respawnWorker(deadWorker: Worker): Promise<void> {
    const index = this.workers.indexOf(deadWorker);
    if (index !== -1) {
      this.workers.splice(index, 1);
      await this.spawnWorker();
    }
  }
}

// Worker thread execution
if (!isMainThread && parentPort) {
  const { workerId } = workerData;
  const worker = new TaskWorker(workerId);
  
  worker.start().catch(console.error);
  
  parentPort.on('message', (message) => {
    if (message === 'stop') {
      worker.stop().then(() => {
        process.exit(0);
      });
    }
  });
}
```

### 3. Enhanced IPC Handlers

```typescript
// Update src/main/agents/task-queue/task-queue.handlers.ts
export function setupTaskQueueHandlers(): void {
  // ... existing handlers ...

  // Start background processing
  ipcMain.handle(
    'task-queue:startProcessing',
    async (): Promise<IpcResponse> => {
      try {
        await TaskQueueService.initializeWorkers();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to start processing',
        };
      }
    }
  );

  // Stop background processing
  ipcMain.handle(
    'task-queue:stopProcessing',
    async (): Promise<IpcResponse> => {
      try {
        await TaskQueueService.shutdownWorkers();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to stop processing',
        };
      }
    }
  );

  // Get active workers
  ipcMain.handle(
    'task-queue:getWorkers',
    async (): Promise<IpcResponse> => {
      try {
        const workers = await TaskQueueService.getActiveWorkers();
        return { success: true, data: workers };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get workers',
        };
      }
    }
  );

  // Queue task for processing
  ipcMain.handle(
    'task-queue:queueTask',
    async (_, taskId: string): Promise<IpcResponse> => {
      try {
        await TaskQueueService.queueTask(taskId);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to queue task',
        };
      }
    }
  );
}
```

### 4. Integration with Main Process

```typescript
// Update src/main/main.ts
import { TaskQueueService } from './agents/task-queue/task-queue.service';

// Initialize workers on app start
app.whenReady().then(async () => {
  // ... existing initialization ...
  
  // Initialize task workers
  await TaskQueueService.initializeWorkers();
});

// Cleanup on app quit
app.on('before-quit', async () => {
  await TaskQueueService.shutdownWorkers();
});
```

## Validation Checkpoints

### Checkpoint 1: Worker System
- Verify worker threads spawn and manage correctly
- Test worker heartbeat and health monitoring
- Validate task assignment to workers

### Checkpoint 2: AI Integration
- Test task execution with different AI providers
- Verify agent context and personality preservation
- Test progress tracking during execution

### Checkpoint 3: Error Handling
- Test retry logic for failed tasks
- Verify worker recovery from errors
- Test graceful shutdown procedures

## Success Criteria

✅ **Background Processing**: Tasks execute in background without blocking UI
✅ **Worker Management**: Multiple workers process tasks concurrently
✅ **AI Integration**: Agents execute tasks using their LLM providers
✅ **Progress Tracking**: Real-time updates during task execution
✅ **Error Recovery**: Robust retry and error handling mechanisms

## Next Steps

After completing this worker system:
1. **Move to Task 09C**: Implement comprehensive task management interface
2. **Performance Tuning**: Optimize worker allocation and task scheduling
3. **Monitoring**: Enhanced worker health monitoring and metrics

This task provides the core autonomous processing capabilities that transform agents from simple chat interfaces into powerful background workers.