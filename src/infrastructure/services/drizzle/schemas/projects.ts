// src/infrastructure/services/drizzle/schemas/projects.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const projectsTable = sqliteTable('projects', {
    id: text('id').primaryKey(), // From ProjectId.getValue() (string UUID)
    name: text('name').notNull(), // From ProjectName.getValue() (string)
    description: text('description').notNull(), // From ProjectDescription.getValue() (string)
    // TODO: Add createdAt, updatedAt if they become part of Project entity
    // createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    // updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export type ProjectDbInsert = typeof projectsTable.$inferInsert;
export type ProjectDbSelect = typeof projectsTable.$inferSelect;
