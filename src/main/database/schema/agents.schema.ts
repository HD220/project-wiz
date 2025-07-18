import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './users.schema';

export const agents = sqliteTable('agents', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  role: text('role').notNull(), // 'developer', 'designer', 'tester', 'architect', 'pm'
  expertise: text('expertise'), // JSON array: ['frontend', 'react', 'typescript']
  personality: text('personality'), // JSON: { tone, communication_style, etc. }
  systemPrompt: text('system_prompt').notNull(), // LLM system prompt
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('online'), // 'online', 'busy', 'offline'
  isGlobal: integer('is_global', { mode: 'boolean' }).default(true),
  llmProvider: text('llm_provider').default('deepseek'), // 'openai', 'deepseek'
  llmModel: text('llm_model').default('deepseek-chat'),
  temperature: real('temperature').default(0.7),
  maxTokens: integer('max_tokens').default(4000),
  createdBy: text('created_by').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;