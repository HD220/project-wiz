import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull().unique(),
  description: text('description'),
  localPath: text('local_path').notNull(),
  remoteUrl: text('remote_url'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull().unique(),
  description: text('description'),
  llmModel: text('llm_model').notNull(),
  configJson: text('config_json'), // JSON string
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  assignedAgentId: text('assigned_agent_id').references(() => agents.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull(), // e.g., 'pending', 'in_progress', 'completed', 'failed'
  priority: text('priority').notNull(), // e.g., 'low', 'medium', 'high', 'critical'
  type: text('type').notNull(), // e.g., 'feature', 'bug', 'refactor', 'documentation'
  dueDate: integer('due_date'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const messages = sqliteTable('messages', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  senderId: text('sender_id').notNull(), // User ID or Agent ID
  senderType: text('sender_type').notNull(), // 'user' or 'agent'
  channelId: text('channel_id').notNull(), // UUID for channel or direct message conversation
  content: text('content').notNull(),
  timestamp: integer('timestamp').notNull(),
  isRead: integer('is_read').notNull().default(0), // 0 for false, 1 for true
});

export const channels = sqliteTable('channels', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'text' or 'direct_message'
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const issues = sqliteTable('issues', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull(), // e.g., 'open', 'in_progress', 'resolved', 'closed'
  priority: text('priority').notNull(), // e.g., 'low', 'medium', 'high'
  assignedToAgentId: text('assigned_to_agent_id').references(() => agents.id),
  createdByUserId: text('created_by_user_id'), // Optional, for future user management
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const sprints = sqliteTable('sprints', {
  id: text('id').primaryKey(), // UUID
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  startDate: integer('start_date').notNull(),
  endDate: integer('end_date').notNull(),
  status: text('status').notNull(), // e.g., 'planned', 'active', 'completed'
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const sprintIssues = sqliteTable('sprint_issues', {
  sprintId: text('sprint_id').notNull().references(() => sprints.id),
  issueId: text('issue_id').notNull().references(() => issues.id),
});