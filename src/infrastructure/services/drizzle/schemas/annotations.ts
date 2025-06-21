// src/infrastructure/services/drizzle/schemas/annotations.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';

export const annotationsTable = sqliteTable('annotations', {
  id: text('id').primaryKey().$defaultFn(() => randomUUID()),
  text: text('text').notNull(),
  agentId: text('agent_id'), // Foreign key to an agent/persona table if one exists
  jobId: text('job_id'),     // Foreign key to jobsTable if strict relation is needed
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type InsertAnnotation = typeof annotationsTable.$inferInsert;
export type SelectAnnotation = typeof annotationsTable.$inferSelect;
