import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { projects } from './projects.schema';

export const issues = sqliteTable('issues', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  
  // Informações básicas
  title: text('title').notNull(),
  description: text('description'),
  
  // Status e tipo
  status: text('status').notNull().default('todo'), // 'todo', 'in_progress', 'review', 'done', 'cancelled'
  priority: text('priority').default('medium'), // 'low', 'medium', 'high', 'urgent'
  type: text('type').default('task'), // 'task', 'bug', 'feature', 'epic', 'story'
  
  // Atribuição
  assigneeId: text('assignee_id'), // Pode ser user_id ou agent_id
  assigneeType: text('assignee_type'), // 'user', 'agent'
  
  // Estimativas e tracking
  estimatedHours: real('estimated_hours'),
  actualHours: real('actual_hours'),
  storyPoints: integer('story_points'),
  
  // Labels e categorização
  labels: text('labels'), // JSON array: ['frontend', 'urgent', 'bug']
  
  // Git integration
  gitBranch: text('git_branch'), // Branch criada para esta issue
  gitCommits: text('git_commits'), // JSON array de commit hashes
  pullRequestUrl: text('pull_request_url'),
  
  // Metadata
  metadata: text('metadata'), // JSON: { attachments, checklists, etc. }
  
  // Tracking
  createdBy: text('created_by').notNull(),
  createdByType: text('created_by_type').notNull(), // 'user', 'agent'
  
  // Timestamps
  dueDate: integer('due_date', { mode: 'timestamp' }),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const issueComments = sqliteTable('issue_comments', {
  id: text('id').primaryKey(),
  issueId: text('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  
  content: text('content').notNull(),
  contentType: text('content_type').default('markdown'),
  
  // Author
  authorId: text('author_id').notNull(),
  authorType: text('author_type').notNull(), // 'user', 'agent'
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  deletedAt: integer('deleted_at', { mode: 'timestamp' }),
});

export const issueActivities = sqliteTable('issue_activities', {
  id: text('id').primaryKey(),
  issueId: text('issue_id').notNull().references(() => issues.id, { onDelete: 'cascade' }),
  
  activityType: text('activity_type').notNull(), // 'status_change', 'assignment', 'comment', 'git_commit'
  description: text('description').notNull(), // "Status changed from 'todo' to 'in_progress'"
  
  // Mudanças
  oldValue: text('old_value'),
  newValue: text('new_value'),
  
  // Actor
  actorId: text('actor_id').notNull(),
  actorType: text('actor_type').notNull(), // 'user', 'agent', 'system'
  
  metadata: text('metadata'), // JSON com dados específicos da atividade
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type Issue = typeof issues.$inferSelect;
export type NewIssue = typeof issues.$inferInsert;
export type IssueComment = typeof issueComments.$inferSelect;
export type NewIssueComment = typeof issueComments.$inferInsert;
export type IssueActivity = typeof issueActivities.$inferSelect;
export type NewIssueActivity = typeof issueActivities.$inferInsert;