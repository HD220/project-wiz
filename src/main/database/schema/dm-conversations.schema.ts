import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { users } from './users.schema';
import { agents } from './agents.schema';

export const dmConversations = sqliteTable('dm_conversations', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: text('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  
  // Estado da conversa
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
  
  // Tracking
  lastMessageAt: integer('last_message_at', { mode: 'timestamp' }),
  lastReadAt: integer('last_read_at', { mode: 'timestamp' }),
  unreadCount: integer('unread_count').default(0),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type DmConversation = typeof dmConversations.$inferSelect;
export type NewDmConversation = typeof dmConversations.$inferInsert;