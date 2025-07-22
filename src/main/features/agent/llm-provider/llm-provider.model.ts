import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/features/user/user.model";

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
    userId: text("user_id")
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
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    // Performance indexes for foreign keys and frequently queried columns
    userIdIdx: index("llm_providers_user_id_idx").on(table.userId),
    typeIdx: index("llm_providers_type_idx").on(table.type),
    isDefaultIdx: index("llm_providers_is_default_idx").on(table.isDefault),
    isActiveIdx: index("llm_providers_is_active_idx").on(table.isActive),
  }),
);

export type SelectLlmProvider = typeof llmProvidersTable.$inferSelect;
export type InsertLlmProvider = typeof llmProvidersTable.$inferInsert;
export type UpdateLlmProvider = Partial<InsertLlmProvider> & { id: string };
