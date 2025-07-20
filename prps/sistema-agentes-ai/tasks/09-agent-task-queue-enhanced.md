# Task 09: Agent Task Queue - Enhanced

## Overview

Implement a background task queue system that allows agents to work autonomously on long-running tasks without blocking the UI. This task creates a robust worker-based architecture using Node.js worker threads to process agent tasks in the background with priority management, retry logic, and real-time status updates.

## User Value

After completing this task, users can:
- Assign complex tasks to agents that run in the background
- Monitor task progress with real-time status updates
- Set task priorities for optimal workflow management
- Review task history and results
- Have agents work on multiple tasks simultaneously without UI blocking

## Technical Requirements

### Database Schema

```sql
-- Task queue for background agent processing
CREATE TABLE agent_tasks (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    
    -- Task management
    priority INTEGER NOT NULL DEFAULT 5, -- 1-10 scale
    status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed, cancelled
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0,
    current_step TEXT,
    total_steps INTEGER,
    
    -- Results and errors
    result TEXT, -- JSON with task results
    error_message TEXT,
    execution_log TEXT, -- JSON array of execution steps
    
    -- Timing
    scheduled_at INTEGER, -- When to start the task
    started_at INTEGER, -- When execution began
    completed_at INTEGER, -- When task finished
    estimated_duration INTEGER, -- Estimated completion time in seconds
    actual_duration INTEGER, -- Actual time taken
    
    -- Metadata
    task_type TEXT NOT NULL DEFAULT 'general', -- general, analysis, coding, research
    context_data TEXT, -- JSON with additional context
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Task queue workers for tracking active processors
CREATE TABLE task_workers (
    id TEXT PRIMARY KEY,
    worker_pid INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    current_task_id TEXT REFERENCES agent_tasks(id),
    last_heartbeat INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    started_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    processed_tasks_count INTEGER DEFAULT 0
);

-- Task dependencies for complex workflows
CREATE TABLE task_dependencies (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
    depends_on_task_id TEXT NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

### Core Types

```typescript
// Task management types
export interface AgentTask {
  id: string;
  agentId: string;
  userId: string;
  title: string;
  description: string;
  instructions: string;
  
  // Management
  priority: number; // 1-10, higher = more important
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
  
  // Progress
  progressPercentage: number;
  currentStep?: string;
  totalSteps?: number;
  
  // Results
  result?: TaskResult;
  errorMessage?: string;
  executionLog: ExecutionLogEntry[];
  
  // Timing
  scheduledAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  
  // Metadata
  taskType: TaskType;
  contextData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 
  | 'pending' 
  | 'queued' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'paused';

export type TaskType = 
  | 'general' 
  | 'analysis' 
  | 'coding' 
  | 'research' 
  | 'review' 
  | 'documentation';

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

export interface ExecutionLogEntry {
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

export interface CreateTaskInput {
  agentId: string;
  title: string;
  description: string;
  instructions: string;
  priority?: number;
  taskType?: TaskType;
  scheduledAt?: Date;
  contextData?: Record<string, any>;
  dependencies?: string[]; // Other task IDs this depends on
}

export interface TaskWorker {
  id: string;
  workerPid?: number;
  isActive: boolean;
  currentTaskId?: string;
  lastHeartbeat: Date;
  startedAt: Date;
  processedTasksCount: number;
}
```

## Implementation Steps

### 1. Database Schema and Types

```typescript
// src/main/agents/task-queue/task-queue.schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { agentsTable } from '../agents.schema';
import { usersTable } from '../../user/users.schema';

export const agentTasksTable = sqliteTable('agent_tasks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text('agent_id').notNull().references(() => agentsTable.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => usersTable.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  instructions: text('instructions').notNull(),
  
  // Management
  priority: integer('priority').notNull().default(5),
  status: text('status').notNull().default('pending'),
  retryCount: integer('retry_count').notNull().default(0),
  maxRetries: integer('max_retries').notNull().default(3),
  
  // Progress
  progressPercentage: integer('progress_percentage').default(0),
  currentStep: text('current_step'),
  totalSteps: integer('total_steps'),
  
  // Results
  result: text('result'), // JSON
  errorMessage: text('error_message'),
  executionLog: text('execution_log'), // JSON array
  
  // Timing
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  estimatedDuration: integer('estimated_duration'),
  actualDuration: integer('actual_duration'),
  
  // Metadata
  taskType: text('task_type').notNull().default('general'),
  contextData: text('context_data'), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const taskWorkersTable = sqliteTable('task_workers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workerPid: integer('worker_pid'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  currentTaskId: text('current_task_id').references(() => agentTasksTable.id),
  lastHeartbeat: integer('last_heartbeat', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  processedTasksCount: integer('processed_tasks_count').default(0),
});

export const taskDependenciesTable = sqliteTable('task_dependencies', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  taskId: text('task_id').notNull().references(() => agentTasksTable.id, { onDelete: 'cascade' }),
  dependsOnTaskId: text('depends_on_task_id').notNull().references(() => agentTasksTable.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const agentTasksRelations = relations(agentTasksTable, ({ one, many }) => ({
  agent: one(agentsTable, {
    fields: [agentTasksTable.agentId],
    references: [agentsTable.id],
  }),
  user: one(usersTable, {
    fields: [agentTasksTable.userId],
    references: [usersTable.id],
  }),
  dependencies: many(taskDependenciesTable),
}));

export const taskWorkersRelations = relations(taskWorkersTable, ({ one }) => ({
  currentTask: one(agentTasksTable, {
    fields: [taskWorkersTable.currentTaskId],
    references: [agentTasksTable.id],
  }),
}));

// Type inference
export type SelectAgentTask = typeof agentTasksTable.$inferSelect;
export type InsertAgentTask = typeof agentTasksTable.$inferInsert;
export type SelectTaskWorker = typeof taskWorkersTable.$inferSelect;
export type InsertTaskWorker = typeof taskWorkersTable.$inferInsert;
```

### 2. Task Queue Service

```typescript
// src/main/agents/task-queue/task-queue.service.ts
import { eq, and, desc, asc, inArray, sql } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { agentTasksTable, taskWorkersTable, taskDependenciesTable } from './task-queue.schema';
import { AgentService } from '../agent.service';
import type { CreateTaskInput, AgentTask, TaskStatus, TaskWorker } from './task-queue.types';

export class TaskQueueService {
  // Create a new task
  static async createTask(input: CreateTaskInput, userId: string): Promise<AgentTask> {
    const db = getDatabase();

    // Verify agent exists and user has access
    const agent = await AgentService.findById(input.agentId);
    if (!agent || agent.userId !== userId) {
      throw new Error('Agent not found or access denied');
    }

    // Estimate duration based on task type and complexity
    const estimatedDuration = this.estimateTaskDuration(input);

    const taskData = {
      ...input,
      userId,
      status: 'pending' as TaskStatus,
      priority: input.priority || 5,
      taskType: input.taskType || 'general',
      estimatedDuration,
      executionLog: JSON.stringify([]),
      contextData: input.contextData ? JSON.stringify(input.contextData) : null,
    };

    const [newTask] = await db
      .insert(agentTasksTable)
      .values(taskData)
      .returning();

    if (!newTask) {
      throw new Error('Failed to create task');
    }

    // Create dependencies if provided
    if (input.dependencies?.length) {
      const dependencyData = input.dependencies.map(depId => ({
        taskId: newTask.id,
        dependsOnTaskId: depId,
      }));

      await db.insert(taskDependenciesTable).values(dependencyData);
    }

    // Add to queue if no dependencies or all dependencies are complete
    if (await this.canStartTask(newTask.id)) {
      await this.queueTask(newTask.id);
    }

    return this.parseTask(newTask);
  }

  // Get next available task from queue
  static async getNextTask(): Promise<AgentTask | null> {
    const db = getDatabase();

    // Find highest priority pending task with no blocking dependencies
    const [task] = await db
      .select()
      .from(agentTasksTable)
      .where(
        and(
          eq(agentTasksTable.status, 'queued'),
          sql`${agentTasksTable.scheduledAt} IS NULL OR ${agentTasksTable.scheduledAt} <= ${Math.floor(Date.now() / 1000)}`
        )
      )
      .orderBy(desc(agentTasksTable.priority), asc(agentTasksTable.createdAt))
      .limit(1);

    return task ? this.parseTask(task) : null;
  }

  // Update task status and progress
  static async updateTaskProgress(
    taskId: string,
    updates: {
      status?: TaskStatus;
      progressPercentage?: number;
      currentStep?: string;
      executionLog?: any[];
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
    if (updates.status === 'running' && !updates.status) {
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

    // If task completed, check for dependent tasks
    if (updates.status === 'completed') {
      await this.checkDependentTasks(taskId);
    }
  }

  // Get user tasks with filtering
  static async getUserTasks(
    userId: string,
    filters: {
      status?: TaskStatus[];
      agentId?: string;
      taskType?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ tasks: AgentTask[]; total: number }> {
    const db = getDatabase();

    let query = db
      .select()
      .from(agentTasksTable)
      .where(eq(agentTasksTable.userId, userId));

    // Apply filters
    if (filters.status?.length) {
      query = query.where(inArray(agentTasksTable.status, filters.status));
    }
    if (filters.agentId) {
      query = query.where(eq(agentTasksTable.agentId, filters.agentId));
    }
    if (filters.taskType) {
      query = query.where(eq(agentTasksTable.taskType, filters.taskType));
    }

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(agentTasksTable)
      .where(eq(agentTasksTable.userId, userId));

    // Apply pagination and ordering
    const tasks = await query
      .orderBy(desc(agentTasksTable.priority), desc(agentTasksTable.createdAt))
      .limit(filters.limit || 50)
      .offset(filters.offset || 0);

    return {
      tasks: tasks.map(task => this.parseTask(task)),
      total: count,
    };
  }

  // Cancel a task
  static async cancelTask(taskId: string, userId: string): Promise<void> {
    const db = getDatabase();

    const [task] = await db
      .select()
      .from(agentTasksTable)
      .where(and(
        eq(agentTasksTable.id, taskId),
        eq(agentTasksTable.userId, userId)
      ))
      .limit(1);

    if (!task) {
      throw new Error('Task not found or access denied');
    }

    if (task.status === 'completed' || task.status === 'cancelled') {
      throw new Error('Cannot cancel completed or already cancelled task');
    }

    await db
      .update(agentTasksTable)
      .set({
        status: 'cancelled',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentTasksTable.id, taskId));
  }

  // Queue management
  private static async queueTask(taskId: string): Promise<void> {
    const db = getDatabase();

    await db
      .update(agentTasksTable)
      .set({
        status: 'queued',
        updatedAt: new Date(),
      })
      .where(eq(agentTasksTable.id, taskId));
  }

  private static async canStartTask(taskId: string): Promise<boolean> {
    const db = getDatabase();

    // Check if all dependencies are completed
    const dependencies = await db
      .select({ status: agentTasksTable.status })
      .from(taskDependenciesTable)
      .innerJoin(agentTasksTable, eq(taskDependenciesTable.dependsOnTaskId, agentTasksTable.id))
      .where(eq(taskDependenciesTable.taskId, taskId));

    return dependencies.every(dep => dep.status === 'completed');
  }

  private static async checkDependentTasks(completedTaskId: string): Promise<void> {
    const db = getDatabase();

    // Find tasks that depend on this completed task
    const dependentTasks = await db
      .select({ taskId: taskDependenciesTable.taskId })
      .from(taskDependenciesTable)
      .where(eq(taskDependenciesTable.dependsOnTaskId, completedTaskId));

    // Check each dependent task to see if it can now start
    for (const { taskId } of dependentTasks) {
      if (await this.canStartTask(taskId)) {
        await this.queueTask(taskId);
      }
    }
  }

  private static estimateTaskDuration(input: CreateTaskInput): number {
    // Simple estimation based on task type and description length
    const baseTime = {
      general: 300, // 5 minutes
      analysis: 600, // 10 minutes
      coding: 1800, // 30 minutes
      research: 900, // 15 minutes
      review: 420, // 7 minutes
      documentation: 720, // 12 minutes
    };

    const base = baseTime[input.taskType || 'general'];
    const complexity = Math.min(input.description.length / 100, 5); // Cap at 5x
    
    return Math.floor(base * (1 + complexity * 0.5));
  }

  private static parseTask(dbTask: any): AgentTask {
    return {
      ...dbTask,
      executionLog: dbTask.executionLog ? JSON.parse(dbTask.executionLog) : [],
      result: dbTask.result ? JSON.parse(dbTask.result) : undefined,
      contextData: dbTask.contextData ? JSON.parse(dbTask.contextData) : undefined,
      createdAt: new Date(dbTask.createdAt),
      updatedAt: new Date(dbTask.updatedAt),
      startedAt: dbTask.startedAt ? new Date(dbTask.startedAt) : undefined,
      completedAt: dbTask.completedAt ? new Date(dbTask.completedAt) : undefined,
      scheduledAt: dbTask.scheduledAt ? new Date(dbTask.scheduledAt) : undefined,
    };
  }

  // Worker management
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

  static async getQueueStats(): Promise<{
    pending: number;
    queued: number;
    running: number;
    completed: number;
    failed: number;
  }> {
    const db = getDatabase();

    const stats = await db
      .select({
        status: agentTasksTable.status,
        count: sql<number>`count(*)`,
      })
      .from(agentTasksTable)
      .groupBy(agentTasksTable.status);

    const result = {
      pending: 0,
      queued: 0,
      running: 0,
      completed: 0,
      failed: 0,
    };

    stats.forEach(({ status, count }) => {
      if (status in result) {
        result[status as keyof typeof result] = count;
      }
    });

    return result;
  }
}
```

### 3. Task Worker Implementation

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

    // Update progress
    await TaskQueueService.updateTaskProgress(task.id, {
      progressPercentage: 10,
      currentStep: 'Configuring AI provider',
      executionLog,
    });

    // Create AI provider instance
    const aiProvider = this.createAIProvider(provider);
    const modelConfig = JSON.parse(agent.modelParameters || '{}');

    addLog('info', 'AI provider configured', { provider: provider.type });

    // Update progress
    await TaskQueueService.updateTaskProgress(task.id, {
      progressPercentage: 20,
      currentStep: 'Preparing agent context',
      executionLog,
    });

    // Prepare system prompt with agent personality and task context
    const systemPrompt = `You are ${agent.name}, a ${agent.role}.

Background: ${agent.backstory}

Current Goal: ${agent.instructions}

Task Instructions:
${task.instructions}

Additional Context:
${task.contextData ? JSON.stringify(task.contextData, null, 2) : 'No additional context provided.'}

Please complete this task step by step, providing detailed explanations of your approach and reasoning.`;

    addLog('info', 'System prompt prepared');

    // Update progress
    await TaskQueueService.updateTaskProgress(task.id, {
      progressPercentage: 30,
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

    // Update progress
    await TaskQueueService.updateTaskProgress(task.id, {
      progressPercentage: 90,
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
    // This would be implemented to track worker health
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

### 4. IPC Handlers

```typescript
// src/main/agents/task-queue/task-queue.handlers.ts
import { ipcMain } from 'electron';
import { TaskQueueService } from './task-queue.service';
import type { IpcResponse } from '../../types';
import type { CreateTaskInput } from './task-queue.types';

export function setupTaskQueueHandlers(): void {
  // Create a new task
  ipcMain.handle(
    'task-queue:create',
    async (_, input: CreateTaskInput): Promise<IpcResponse> => {
      try {
        // TODO: Get current user ID from auth system
        const userId = 'current-user-id';
        const task = await TaskQueueService.createTask(input, userId);
        return { success: true, data: task };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create task',
        };
      }
    }
  );

  // Get user tasks
  ipcMain.handle(
    'task-queue:getUserTasks',
    async (_, filters?: any): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const result = await TaskQueueService.getUserTasks(userId, filters);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get tasks',
        };
      }
    }
  );

  // Cancel a task
  ipcMain.handle(
    'task-queue:cancel',
    async (_, taskId: string): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        await TaskQueueService.cancelTask(taskId, userId);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to cancel task',
        };
      }
    }
  );

  // Get queue statistics
  ipcMain.handle(
    'task-queue:getStats',
    async (): Promise<IpcResponse> => {
      try {
        const stats = await TaskQueueService.getQueueStats();
        return { success: true, data: stats };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get queue stats',
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
}
```

### 5. Frontend Components

```typescript
// src/renderer/components/task-queue/task-creation-dialog.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import type { CreateTaskInput } from '@/types/task-queue';

const taskSchema = z.object({
  agentId: z.string().min(1, 'Agent is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  instructions: z.string().min(20, 'Instructions must be at least 20 characters'),
  priority: z.number().min(1).max(10),
  taskType: z.enum(['general', 'analysis', 'coding', 'research', 'review', 'documentation']),
});

interface TaskCreationDialogProps {
  agents: Array<{ id: string; name: string; role: string }>;
  onTaskCreated: (task: any) => void;
}

export function TaskCreationDialog({ agents, onTaskCreated }: TaskCreationDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<CreateTaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 5,
      taskType: 'general',
    },
  });

  const onSubmit = async (data: CreateTaskInput) => {
    setIsCreating(true);
    try {
      const response = await window.api.taskQueue.create(data);
      
      if (response.success) {
        onTaskCreated(response.data);
        toast({
          title: 'Task Created',
          description: 'Your task has been added to the queue.',
        });
        setOpen(false);
        form.reset();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create task',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Agent Task</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agent</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an agent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {agent.name} - {agent.role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="taskType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="analysis">Analysis</SelectItem>
                        <SelectItem value="coding">Coding</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="documentation">Documentation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief task description" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Detailed task description and context"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Specific instructions for the agent"
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Priority: {field.value}
                  </FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={([value]) => field.onChange(value)}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 6. Task Management Interface

```typescript
// src/renderer/app/agents/tasks/index.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskCreationDialog } from '@/components/task-queue/task-creation-dialog';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Play, Pause, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import type { AgentTask, TaskStatus } from '@/types/task-queue';

export default function TaskManagementPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    queued: 0,
    running: 0,
    completed: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus[]>([]);

  useEffect(() => {
    loadTasks();
    loadStats();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      loadTasks();
      loadStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [selectedStatus]);

  const loadTasks = async () => {
    try {
      const response = await window.api.taskQueue.getUserTasks({
        status: selectedStatus.length ? selectedStatus : undefined,
        limit: 50,
      });
      
      if (response.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await window.api.taskQueue.getStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const cancelTask = async (taskId: string) => {
    try {
      const response = await window.api.taskQueue.cancel(taskId);
      if (response.success) {
        loadTasks();
        loadStats();
      }
    } catch (error) {
      console.error('Failed to cancel task:', error);
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
      case 'queued':
        return <Clock className="h-4 w-4" />;
      case 'running':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <Pause className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'queued':
        return 'outline';
      case 'running':
        return 'default';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Task Queue</h1>
            <p className="text-muted-foreground">
              Manage and monitor agent background tasks
            </p>
          </div>
          
          <TaskCreationDialog
            agents={[]} // TODO: Load from agent store
            onTaskCreated={() => {
              loadTasks();
              loadStats();
            }}
          />
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queued</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.queued}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Running</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.running}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setSelectedStatus([])}>
              All Tasks
            </TabsTrigger>
            <TabsTrigger value="active" onClick={() => setSelectedStatus(['pending', 'queued', 'running'])}>
              Active
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => setSelectedStatus(['completed'])}>
              Completed
            </TabsTrigger>
            <TabsTrigger value="failed" onClick={() => setSelectedStatus(['failed'])}>
              Failed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="h-24" />
                  </Card>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No tasks found. Create your first task to get started.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <Card key={task.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            {task.title}
                            <Badge 
                              variant={getStatusColor(task.status as any)}
                              className="flex items-center gap-1"
                            >
                              {getStatusIcon(task.status)}
                              {task.status}
                            </Badge>
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{task.taskType}</span>
                            <span>Priority: {task.priority}</span>
                            <span>
                              Created {formatDistanceToNow(task.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        
                        {(task.status === 'pending' || task.status === 'queued' || task.status === 'running') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => cancelTask(task.id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {task.description}
                      </p>
                      
                      {task.status === 'running' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progressPercentage}%</span>
                          </div>
                          <Progress value={task.progressPercentage} />
                          {task.currentStep && (
                            <p className="text-xs text-muted-foreground">
                              Current step: {task.currentStep}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {task.errorMessage && (
                        <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                          <p className="text-sm text-destructive">
                            Error: {task.errorMessage}
                          </p>
                        </div>
                      )}
                      
                      {task.result && (
                        <div className="p-3 bg-muted rounded-md">
                          <p className="text-sm font-medium mb-2">Result:</p>
                          <p className="text-sm text-muted-foreground">
                            {task.result.summary}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

## Validation & Testing

### Manual Testing Checklist

- [ ] **Task Creation**: Create tasks with different priorities and types
- [ ] **Queue Processing**: Verify tasks are processed in correct order
- [ ] **Progress Tracking**: Monitor real-time progress updates
- [ ] **Error Handling**: Test retry logic and failure scenarios
- [ ] **Task Cancellation**: Cancel running tasks successfully
- [ ] **Dependencies**: Test task dependency resolution

### Implementation Validation

1. **Database Schema**: Verify all tables created with proper relationships
2. **Worker System**: Test worker spawning and task processing
3. **Service Layer**: Test all CRUD operations and business logic
4. **IPC Communication**: Verify all handlers work correctly
5. **Frontend Components**: Test task creation and monitoring interfaces

## Success Criteria

✅ **Background Processing**: Tasks run in worker threads without blocking UI
✅ **Priority Management**: High-priority tasks are processed first
✅ **Progress Tracking**: Real-time progress updates and status monitoring
✅ **Error Handling**: Robust retry logic and error reporting
✅ **Task Management**: Complete task lifecycle management interface

## Next Steps

After completing this task:
1. **Move to Task 10**: Implement Agent Tools Integration for enhanced capabilities
2. **Consider Task 11**: Add intelligent agent hiring system
3. **Performance Optimization**: Monitor worker performance and optimize queue processing

This task enables agents to work autonomously on complex tasks, transforming the system from a simple chat interface into a powerful automation platform.