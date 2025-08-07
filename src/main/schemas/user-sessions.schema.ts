import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";

export const userSessionsTable = sqliteTable(
  "user_sessions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),

    // Soft deletion fields
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  },
  (table) => ({
    // Performance indexes
    userIdIdx: index("user_sessions_user_id_idx").on(table.userId),
    tokenIdx: index("user_sessions_token_idx").on(table.token),
    expiresAtIdx: index("user_sessions_expires_at_idx").on(table.expiresAt),
    // Soft deletion indexes
    deactivatedAtIdx: index("user_sessions_deactivated_at_idx").on(
      table.deactivatedAt,
    ),
  }),
);

export type SelectUserSession = typeof userSessionsTable.$inferSelect;
export type InsertUserSession = typeof userSessionsTable.$inferInsert;
