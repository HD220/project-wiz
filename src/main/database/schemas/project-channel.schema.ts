import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";

import { usersTable } from "./user.schema";

import { projectsTable } from "./project.schema";

export const projectChannelsTable = sqliteTable(
  "project_channels",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    projectId: text("project_id")
      .notNull()
      .references(() => projectsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(), // Explicit channel name
    description: text("description"),

    // Archiving fields - separate from soft deletion
    archivedAt: integer("archived_at", { mode: "timestamp_ms" }),
    archivedBy: text("archived_by").references(() => usersTable.id),

    // Soft deletion fields
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),
    deactivatedBy: text("deactivated_by").references(() => usersTable.id),

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
    ownerIdIdx: index("project_channels_owner_id_idx").on(table.ownerId),
    projectIdIdx: index("project_channels_project_id_idx").on(table.projectId),
    createdAtIdx: index("project_channels_created_at_idx").on(table.createdAt),
    archivedByIdx: index("project_channels_archived_by_idx").on(
      table.archivedBy,
    ),
    deactivatedByIdx: index("project_channels_deactivated_by_idx").on(
      table.deactivatedBy,
    ),

    // Soft deletion indexes
    isActiveIdx: index("project_channels_is_active_idx").on(table.isActive),
    isActiveCreatedAtIdx: index("project_channels_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),

    // Archiving indexes
    archivedAtIdx: index("project_channels_archived_at_idx").on(
      table.archivedAt,
    ),
    isActiveArchivedAtIdx: index(
      "project_channels_is_active_archived_at_idx",
    ).on(table.isActive, table.archivedAt),

    // Project-channel composite indexes
    projectActiveIdx: index("project_channels_project_active_idx").on(
      table.projectId,
      table.isActive,
    ),
    projectNameIdx: index("project_channels_project_name_idx").on(
      table.projectId,
      table.name,
    ),
  }),
);

export type SelectProjectChannel = typeof projectChannelsTable.$inferSelect;
export type InsertProjectChannel = typeof projectChannelsTable.$inferInsert;
