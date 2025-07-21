import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/user/users.schema";

export type Theme = "dark" | "light" | "system";

export const userPreferencesTable = sqliteTable("user_preferences", {
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
});

export type SelectUserPreferences = typeof userPreferencesTable.$inferSelect;
export type InsertUserPreferences = typeof userPreferencesTable.$inferInsert;
export type UpdateUserPreferences = Partial<InsertUserPreferences> & {
  id: string;
};
