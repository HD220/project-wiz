import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { usersTable } from "./user.schema";

export type ProjectStatus = "active" | "archived";

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
    status: text("status").$type<ProjectStatus>().notNull().default("active"),

    // Soft deletion fields
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
    // Performance indexes for foreign keys
    ownerIdIdx: index("projects_owner_id_idx").on(table.ownerId),
    statusIdx: index("projects_status_idx").on(table.status),
    deactivatedByIdx: index("projects_deactivated_by_idx").on(
      table.deactivatedBy,
    ),

    // Soft deletion indexes
    isActiveIdx: index("projects_is_active_idx").on(table.isActive),
    isActiveCreatedAtIdx: index("projects_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),
  }),
);

export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
export type UpdateProject = Partial<InsertProject> & { id: string };
