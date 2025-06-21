// src/infrastructure/services/drizzle/schemas/personas.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const personasTable = sqliteTable('personas', {
    id: text('id').primaryKey(), // From PersonaId.getValue() (string UUID)
    name: text('name').notNull(), // From PersonaName.getValue() (string)
    role: text('role').notNull(), // From PersonaRole.getValue() (string)
    goal: text('goal').notNull(), // From PersonaGoal.getValue() (string)
    backstory: text('backstory').notNull(), // From PersonaBackstory.getValue() (string)
});

export type PersonaDbInsert = typeof personasTable.$inferInsert;
export type PersonaDbSelect = typeof personasTable.$inferSelect;
