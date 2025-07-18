import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { projects } from './projects.schema';
import { agents } from './agents.schema';
import { users } from './users.schema';

export const projectAgents = sqliteTable('project_agents', {
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  
  role: text('role'), // 'developer', 'reviewer', 'tester', 'lead'
  permissions: text('permissions'), // JSON array: ['read', 'write', 'admin']
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  
  addedBy: text('added_by').notNull().references(() => users.id),
  addedAt: integer('added_at', { mode: 'timestamp' }).notNull(),
  removedAt: integer('removed_at', { mode: 'timestamp' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.agentId] }),
}));

export const projectUsers = sqliteTable('project_users', {
  projectId: text('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  role: text('role').default('member'), // 'owner', 'admin', 'member', 'viewer'
  permissions: text('permissions'), // JSON array
  
  joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull(),
  leftAt: integer('left_at', { mode: 'timestamp' }),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.userId] }),
}));

export type ProjectAgent = typeof projectAgents.$inferSelect;
export type NewProjectAgent = typeof projectAgents.$inferInsert;
export type ProjectUser = typeof projectUsers.$inferSelect;
export type NewProjectUser = typeof projectUsers.$inferInsert;