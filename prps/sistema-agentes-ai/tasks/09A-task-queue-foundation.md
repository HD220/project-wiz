# Task 09A: Task Queue Foundation - Enhanced

## Overview

Establish the foundational task queue system with database schema, core service layer, and basic IPC handlers. This micro-task focuses on creating the essential infrastructure for agent task management without the complexity of background workers or advanced UI.

## User Value

After completing this task, users can:
- Create tasks for agents with priorities and basic metadata
- Store and retrieve tasks from the database
- Access task operations through the frontend API
- Foundation for background processing and monitoring

## Technical Requirements

### Database Schema

```sql
-- Core task queue table for agent task management
CREATE TABLE agent_tasks (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    
    -- Task management
    priority INTEGER NOT NULL DEFAULT 5, -- 1-10 scale
    status TEXT NOT NULL DEFAULT 'pending', -- pending, queued, running, completed, failed, cancelled
    retry_count INTEGER NOT NULL DEFAULT 0,
    max_retries INTEGER NOT NULL DEFAULT 3,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0,
    current_step TEXT,
    
    -- Results and errors
    result TEXT, -- JSON with task results
    error_message TEXT,
    
    -- Timing
    scheduled_at INTEGER, -- When to start the task
    estimated_duration INTEGER, -- Estimated completion time in seconds
    
    -- Metadata
    task_type TEXT NOT NULL DEFAULT 'general', -- general, analysis, coding, research
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Simple task dependencies for workflow support
CREATE TABLE task_dependencies (
    id TEXT PRIMARY KEY,
    task_id TEXT NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
    depends_on_task_id TEXT NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

### Core Types

```typescript
export interface AgentTask {
  id: string;
  agentId: string;
  userId: string;
  title: string;
  description: string;
  instructions: string;
  
  priority: number; // 1-10, higher = more important
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
  
  progressPercentage: number;
  currentStep?: string;
  
  result?: TaskResult;
  errorMessage?: string;
  
  scheduledAt?: Date;
  estimatedDuration?: number;
  
  taskType: TaskType;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 
  | 'pending' 
  | 'queued' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type TaskType = 
  | 'general' 
  | 'analysis' 
  | 'coding' 
  | 'research' 
  | 'review' 
  | 'documentation';

export interface CreateTaskInput {
  agentId: string;
  title: string;
  description: string;
  instructions: string;
  priority?: number;
  taskType?: TaskType;
  scheduledAt?: Date;
  dependencies?: string[]; // Other task IDs this depends on
}
```

## Implementation Steps

### 1. Database Schema Implementation

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
  
  priority: integer('priority').notNull().default(5),
  status: text('status').notNull().default('pending'),
  retryCount: integer('retry_count').notNull().default(0),
  maxRetries: integer('max_retries').notNull().default(3),
  
  progressPercentage: integer('progress_percentage').default(0),
  currentStep: text('current_step'),
  
  result: text('result'), // JSON
  errorMessage: text('error_message'),
  
  scheduledAt: integer('scheduled_at', { mode: 'timestamp' }),
  estimatedDuration: integer('estimated_duration'),
  
  taskType: text('task_type').notNull().default('general'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
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

// Type inference
export type SelectAgentTask = typeof agentTasksTable.$inferSelect;
export type InsertAgentTask = typeof agentTasksTable.$inferInsert;
```

### 2. Core Task Service

```typescript
// src/main/agents/task-queue/task-queue.service.ts
import { eq, and, desc, asc, inArray, sql } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { agentTasksTable, taskDependenciesTable } from './task-queue.schema';
import { AgentService } from '../agent.service';
import type { CreateTaskInput, AgentTask, TaskStatus } from './task-queue.types';

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

    return this.parseTask(newTask);
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

  // Update task status and progress
  static async updateTaskProgress(
    taskId: string,
    updates: {
      status?: TaskStatus;
      progressPercentage?: number;
      currentStep?: string;
      errorMessage?: string;
      result?: any;
    }
  ): Promise<void> {
    const db = getDatabase();

    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // Serialize complex objects
    if (updates.result) {
      updateData.result = JSON.stringify(updates.result);
    }

    await db
      .update(agentTasksTable)
      .set(updateData)
      .where(eq(agentTasksTable.id, taskId));
  }

  // Get next available task for processing
  static async getNextTask(): Promise<AgentTask | null> {
    const db = getDatabase();

    // Find highest priority pending task with no blocking dependencies
    const [task] = await db
      .select()
      .from(agentTasksTable)
      .where(
        and(
          eq(agentTasksTable.status, 'pending'),
          sql`${agentTasksTable.scheduledAt} IS NULL OR ${agentTasksTable.scheduledAt} <= ${Math.floor(Date.now() / 1000)}`
        )
      )
      .orderBy(desc(agentTasksTable.priority), asc(agentTasksTable.createdAt))
      .limit(1);

    return task ? this.parseTask(task) : null;
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
        updatedAt: new Date(),
      })
      .where(eq(agentTasksTable.id, taskId));
  }

  // Get queue statistics
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
      result: dbTask.result ? JSON.parse(dbTask.result) : undefined,
      createdAt: new Date(dbTask.createdAt),
      updatedAt: new Date(dbTask.updatedAt),
      scheduledAt: dbTask.scheduledAt ? new Date(dbTask.scheduledAt) : undefined,
    };
  }
}
```

### 3. IPC Handlers

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
}
```

### 4. Frontend API Integration

```typescript
// Update src/renderer/preload.ts
taskQueue: {
  create: (input: CreateTaskInput) => 
    ipcRenderer.invoke('task-queue:create', input),
  getUserTasks: (filters?: any) => 
    ipcRenderer.invoke('task-queue:getUserTasks', filters),
  cancel: (taskId: string) => 
    ipcRenderer.invoke('task-queue:cancel', taskId),
  getStats: () => 
    ipcRenderer.invoke('task-queue:getStats'),
}

// Update src/renderer/window.d.ts
taskQueue: {
  create: (input: CreateTaskInput) => Promise<IpcResponse>;
  getUserTasks: (filters?: any) => Promise<IpcResponse>;
  cancel: (taskId: string) => Promise<IpcResponse>;
  getStats: () => Promise<IpcResponse>;
};
```

## Validation Checkpoints

### Checkpoint 1: Database Foundation
- Verify tables created with proper relationships
- Test task creation and storage
- Validate data integrity and constraints

### Checkpoint 2: Service Layer
- Test CRUD operations for tasks
- Verify filtering and pagination
- Test task status updates and cancellation

### Checkpoint 3: IPC Integration
- Test all IPC handlers
- Verify error handling and validation
- Test frontend API access

## Success Criteria

✅ **Task Creation**: Users can create tasks for agents with all required metadata
✅ **Task Management**: Basic task operations (read, update, cancel) work correctly
✅ **Data Persistence**: Tasks are stored reliably with proper relationships
✅ **API Foundation**: Frontend can access task operations through IPC
✅ **Queue Statistics**: Basic queue metrics are available

## Next Steps

After completing this foundation:
1. **Move to Task 09B**: Implement background worker system for task execution
2. **Task Dependencies**: Enhance dependency resolution logic
3. **Performance**: Add database indexes and query optimization

This foundational task provides the essential infrastructure for agent task management while keeping complexity manageable and delivering immediate value.