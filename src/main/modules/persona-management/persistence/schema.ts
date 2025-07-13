import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const personasTable = sqliteTable('personas', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  papel: text('papel').notNull(),
  goal: text('goal').notNull(),
  backstory: text('backstory').notNull(),
  llmProviderId: text('llm_provider_id'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export type PersonaSchema = typeof personasTable.$inferSelect;
export type PersonaInsert = typeof personasTable.$inferInsert;