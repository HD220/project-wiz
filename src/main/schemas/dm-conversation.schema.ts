import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";

export const dmConversationsTable = sqliteTable(
  "dm_conversations",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    name: text("name"), // Auto-generated from participants
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
    ownerIdIdx: index("dm_conversations_owner_id_idx").on(table.ownerId),
    createdAtIdx: index("dm_conversations_created_at_idx").on(table.createdAt),
    archivedByIdx: index("dm_conversations_archived_by_idx").on(
      table.archivedBy,
    ),
    deactivatedByIdx: index("dm_conversations_deactivated_by_idx").on(
      table.deactivatedBy,
    ),

    // Soft deletion indexes
    isActiveIdx: index("dm_conversations_is_active_idx").on(table.isActive),
    isActiveCreatedAtIdx: index("dm_conversations_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),

    // Archiving indexes
    archivedAtIdx: index("dm_conversations_archived_at_idx").on(
      table.archivedAt,
    ),
    isActiveArchivedAtIdx: index(
      "dm_conversations_is_active_archived_at_idx",
    ).on(table.isActive, table.archivedAt),
  }),
);

export const dmParticipantsTable = sqliteTable(
  "dm_participants",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    dmConversationId: text("dm_conversation_id")
      .notNull()
      .references(() => dmConversationsTable.id, { onDelete: "cascade" }),
    participantId: text("participant_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

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
    ownerIdIdx: index("dm_participants_owner_id_idx").on(table.ownerId),
    dmConversationIdIdx: index("dm_participants_dm_conversation_id_idx").on(
      table.dmConversationId,
    ),
    participantIdIdx: index("dm_participants_participant_id_idx").on(
      table.participantId,
    ),
    deactivatedByIdx: index("dm_participants_deactivated_by_idx").on(
      table.deactivatedBy,
    ),

    // Soft deletion indexes
    isActiveIdx: index("dm_participants_is_active_idx").on(table.isActive),
    isActiveCreatedAtIdx: index("dm_participants_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),

    // Composite index for unique participant in DM
    dmParticipantIdx: index("dm_participants_dm_participant_idx").on(
      table.dmConversationId,
      table.participantId,
    ),
  }),
);

export type SelectDMConversation = typeof dmConversationsTable.$inferSelect;
export type InsertDMConversation = typeof dmConversationsTable.$inferInsert;
export type SelectDMParticipant = typeof dmParticipantsTable.$inferSelect;
export type InsertDMParticipant = typeof dmParticipantsTable.$inferInsert;
