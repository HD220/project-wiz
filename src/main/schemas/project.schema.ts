import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";

export const projectsTable = sqliteTable(
  "projects",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),
    avatarUrl: text("avatar_url"),
    gitUrl: text("git_url"),
    branch: text("branch"),
    localPath: text("local_path").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

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
    // Performance indexes for foreign keys
    ownerIdIdx: index("projects_owner_id_idx").on(table.ownerId),

    // Soft deletion indexes
    deactivatedAtIdx: index("projects_deactivated_at_idx").on(table.deactivatedAt),
  }),
);

export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
export type UpdateProject = Partial<InsertProject> & { id: string };
