import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";

export type ProviderType =
  | "openai"
  | "deepseek"
  | "anthropic"
  | "google"
  | "custom";

export const llmProvidersTable = sqliteTable(
  "llm_providers",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").$type<ProviderType>().notNull(),
    apiKey: text("api_key").notNull(), // Will store encrypted
    baseUrl: text("base_url"),
    defaultModel: text("default_model").notNull().default("gpt-3.5-turbo"),
    isDefault: integer("is_default", { mode: "boolean" })
      .notNull()
      .default(false),

    // Soft deletion fields (keeping existing isActive for backward compatibility)
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),
    deactivatedBy: text("deactivated_by").references(() => usersTable.id),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    // Composite primary key
    pk: primaryKey({ columns: [table.ownerId, table.id] }),
    
    // Performance indexes for foreign keys and frequently queried columns
    ownerIdIdx: index("llm_providers_owner_id_idx").on(table.ownerId),
    typeIdx: index("llm_providers_type_idx").on(table.type),
    isDefaultIdx: index("llm_providers_is_default_idx").on(table.isDefault),
    isActiveIdx: index("llm_providers_is_active_idx").on(table.isActive),
    deactivatedByIdx: index("llm_providers_deactivated_by_idx").on(
      table.deactivatedBy,
    ),

    // Soft deletion composite indexes
    isActiveCreatedAtIdx: index("llm_providers_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),
  }),
);

export type SelectLlmProvider = typeof llmProvidersTable.$inferSelect;
export type InsertLlmProvider = typeof llmProvidersTable.$inferInsert;
export type UpdateLlmProvider = Partial<InsertLlmProvider> & { id: string };
