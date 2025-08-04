import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    avatar: text("avatar"),
    type: text("type").$type<"human" | "agent">().notNull().default("human"),

    // Soft deletion fields
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),
    deactivatedBy: text("deactivated_by"), // Remove circular reference for now

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // Soft deletion indexes
    isActiveIdx: index("users_is_active_idx").on(table.isActive),
    isActiveCreatedAtIdx: index("users_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),
    deactivatedByIdx: index("users_deactivated_by_idx").on(table.deactivatedBy),
  }),
);

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type UpdateUser = Partial<InsertUser> & { id: string };
