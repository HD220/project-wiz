// src/infrastructure/services/drizzle/schemas/memory.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';

export const memoryItemsTable = sqliteTable('memory_items', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  content: text('content').notNull(),
  agentId: text('agent_id'), // Added
  tags: text('tags', { mode: 'json' }).$type<string[] | null>(), // Store as JSON string array
  source: text('source'),
  embedding: blob('embedding', { mode: 'buffer' }), // Changed from embeddingJson
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type InsertMemoryItem = typeof memoryItemsTable.$inferInsert;
export type SelectMemoryItem = typeof memoryItemsTable.$inferSelect;
