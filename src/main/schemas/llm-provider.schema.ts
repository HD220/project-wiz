import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

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
      .primaryKey()
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

    // Soft deletion
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    // Performance indexes for foreign keys and frequently queried columns
    ownerIdIdx: index("llm_providers_owner_id_idx").on(table.ownerId),
    typeIdx: index("llm_providers_type_idx").on(table.type),
    isDefaultIdx: index("llm_providers_is_default_idx").on(table.isDefault),
    deactivatedAtIdx: index("llm_providers_deactivated_at_idx").on(
      table.deactivatedAt,
    ),
  }),
);

export type SelectLlmProvider = typeof llmProvidersTable.$inferSelect;
export type InsertLlmProvider = typeof llmProvidersTable.$inferInsert;
export type UpdateLlmProvider = Partial<InsertLlmProvider> & { id: string };
