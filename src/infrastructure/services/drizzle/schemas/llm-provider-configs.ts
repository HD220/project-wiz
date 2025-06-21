// src/infrastructure/services/drizzle/schemas/llm-provider-configs.ts
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { llmProvidersTable } from './llm-providers'; // For foreign key

export const llmProviderConfigsTable = sqliteTable('llm_provider_configs', {
    id: text('id').primaryKey(), // From LLMProviderConfigId.getValue() (string UUID)
    name: text('name').notNull(), // From LLMProviderConfigName.getValue() (string)
    apiKey: text('api_key').notNull(), // From LLMProviderConfigApiKey.getValue() (string)

    llmProviderId: text('llm_provider_id').notNull()
        .references(() => llmProvidersTable.id, { onDelete: 'cascade' }), // Foreign Key

    modelId: text('model_id').notNull(), // String ID/slug of the LLMModel (e.g., "gpt-4", "claude-2")
                                         // This is not a direct FK to a separate llmModelsTable in this schema,
                                         // as LLMModels are part of the LLMProvider's JSON blob.
                                         // Validation that this modelId exists for the llmProviderId happens at entity/service level.

    // TODO: Add createdAt, updatedAt if they become part of LLMProviderConfig entity
    // createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
    // updatedAt: integer('updated_at', { mode: 'timestamp_ms' }),
});

export type LLMProviderConfigDbInsert = typeof llmProviderConfigsTable.$inferInsert;
export type LLMProviderConfigDbSelect = typeof llmProviderConfigsTable.$inferSelect;
