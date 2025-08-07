import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";
import { projectsTable } from "@/main/schemas/project.schema";

export const projectChannelsTable = sqliteTable(
  "project_channels",
  {
    id: text("id")
      .notNull()
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

    // Soft deletion fields
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),

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
    // Soft deletion indexes
    deactivatedAtIdx: index("project_channels_deactivated_at_idx").on(table.deactivatedAt),

    // Archiving indexes
    archivedAtIdx: index("project_channels_archived_at_idx").on(
      table.archivedAt,
    ),
    projectNameIdx: index("project_channels_project_name_idx").on(
      table.projectId,
      table.name,
    ),
  }),
);

export type SelectProjectChannel = typeof projectChannelsTable.$inferSelect;
export type InsertProjectChannel = typeof projectChannelsTable.$inferInsert;
