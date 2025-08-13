import { sqliteTable, text, index } from "drizzle-orm/sqlite-core";

import { llmProvidersTable } from "@/main/schemas/llm-provider.schema";
import { usersTable } from "@/main/schemas/user.schema";

export const agentsTable = sqliteTable(
  "agents",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID())
      .references(() => usersTable.id, { onDelete: "cascade" }),
    ownerId: text("owner_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    providerId: text("provider_id")
      .notNull()
      .references(() => llmProvidersTable.id, { onDelete: "restrict" }),
    role: text("role").notNull(),
    backstory: text("backstory").notNull(),
    goal: text("goal").notNull(),
    modelConfig: text("model_config").notNull(), // JSON string
  },
  (table) => ({
    // Performance indexes for foreign keys
    ownerIdIdx: index("agents_owner_id_idx").on(table.ownerId),
    providerIdIdx: index("agents_provider_id_idx").on(table.providerId),
  }),
);

export type SelectAgent = typeof agentsTable.$inferSelect;
export type InsertAgent = typeof agentsTable.$inferInsert;
export type UpdateAgent = Partial<InsertAgent> & { id: string };
