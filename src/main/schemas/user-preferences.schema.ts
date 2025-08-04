import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";

export type Theme = "dark" | "light" | "system";

export const userPreferencesTable = sqliteTable(
  "user_preferences",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    theme: text("theme").$type<Theme>().notNull().default("system"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // Composite primary key
    pk: primaryKey({ columns: [table.ownerId, table.id] }),
    
    // Performance indexes
    ownerIdIdx: index("user_preferences_owner_id_idx").on(table.ownerId),
    themeIdx: index("user_preferences_theme_idx").on(table.theme),
  }),
);

export type SelectUserPreferences = typeof userPreferencesTable.$inferSelect;
export type InsertUserPreferences = typeof userPreferencesTable.$inferInsert;
export type UpdateUserPreferences = Partial<InsertUserPreferences> & {
  id: string;
};
