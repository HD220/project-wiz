import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/features/user/user.model";

export type Theme = "dark" | "light" | "system";

export const userPreferencesTable = sqliteTable(
  "user_preferences",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    theme: text("theme").$type<Theme>().notNull().default("system"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // Performance indexes
    userIdIdx: index("user_preferences_user_id_idx").on(table.userId),
    themeIdx: index("user_preferences_theme_idx").on(table.theme),
  }),
);

export type SelectUserPreferences = typeof userPreferencesTable.$inferSelect;
export type InsertUserPreferences = typeof userPreferencesTable.$inferInsert;
export type UpdateUserPreferences = Partial<InsertUserPreferences> & {
  id: string;
};
