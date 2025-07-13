import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { randomUUID } from 'crypto';

export const personasTable = sqliteTable('personas', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  nome: text('nome').notNull(),
  papel: text('papel').notNull(),
  goal: text('goal').notNull(),
  backstory: text('backstory').notNull(),
  llmProviderId: text('llm_provider_id'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Project-Persona relationship table
export const projectPersonasTable = sqliteTable('project_personas', {
  projectId: text('project_id').notNull(),
  personaId: text('persona_id').notNull(),
  addedAt: integer('added_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  addedBy: text('added_by').notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.projectId, table.personaId] }),
}));

export type PersonaSchema = typeof personasTable.$inferSelect;
export type PersonaInsert = typeof personasTable.$inferInsert;
export type ProjectPersonaSchema = typeof projectPersonasTable.$inferSelect;
export type ProjectPersonaInsert = typeof projectPersonasTable.$inferInsert;