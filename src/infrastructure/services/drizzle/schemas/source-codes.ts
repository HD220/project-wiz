// src/infrastructure/services/drizzle/schemas/source-codes.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { projectsTable } from './projects'; // For foreign key

export const sourceCodesTable = sqliteTable('source_codes', {
    id: text('id').primaryKey(), // From RepositoryId.getValue() (string UUID or unique path part)
    path: text('path').notNull(), // From RepositoryPath.getValue() (string)
    docsPath: text('docs_path').notNull(), // From RepositoryDocsPath.getValue() (string)

    projectId: text('project_id').notNull()
        .references(() => projectsTable.id, { onDelete: 'cascade' }), // Foreign Key

    // TODO: Add createdAt, updatedAt if they become part of SourceCode entity
    // createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    // updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export type SourceCodeDbInsert = typeof sourceCodesTable.$inferInsert;
export type SourceCodeDbSelect = typeof sourceCodesTable.$inferSelect;
