// src/infrastructure/services/drizzle/schemas/memory.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';

export const memoryItemsTable = sqliteTable('memory_items', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  content: text('content').notNull(),
  tags: text('tags', { mode: 'json' }).$type<string[] | null>(), // Store as JSON string array
  source: text('source'),
  // embedding column might be text for JSON string of numbers, or point to a vector DB
  embeddingJson: text('embedding_json'), // Store embedding as JSON string for now
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type InsertMemoryItem = typeof memoryItemsTable.$inferInsert;
export type SelectMemoryItem = typeof memoryItemsTable.$inferSelect;
