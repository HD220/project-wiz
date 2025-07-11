import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { projects } from '../../project-management/persistence/schema';

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  assignedAgentId: text('assigned_agent_id'), // references to agents.id but agents table may not exist yet
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull(), // 'pending', 'in_progress', 'completed', 'failed', 'cancelled'
  priority: text('priority').notNull(), // 'low', 'medium', 'high', 'critical'
  type: text('type').notNull(), // 'feature', 'bug', 'refactor', 'documentation', 'test'
  parentTaskId: text('parent_task_id').references(() => tasks.id),
  estimatedHours: integer('estimated_hours'),
  actualHours: integer('actual_hours'),
  progressPercentage: integer('progress_percentage').notNull().default(0),
  dueDate: integer('due_date'),
  startedAt: integer('started_at'),
  completedAt: integer('completed_at'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const taskDependencies = sqliteTable('task_dependencies', {
  taskId: text('task_id').notNull().references(() => tasks.id),
  dependsOnTaskId: text('depends_on_task_id').notNull().references(() => tasks.id),
  createdAt: integer('created_at').notNull(),
});

export const taskLogs = sqliteTable('task_logs', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull().references(() => tasks.id),
  agentId: text('agent_id'), // references to agents.id but agents table may not exist yet
  logLevel: text('log_level').notNull(), // 'info', 'warning', 'error', 'debug'
  message: text('message').notNull(),
  metadata: text('metadata'), // JSON para dados adicionais
  timestamp: integer('timestamp').notNull(),
});