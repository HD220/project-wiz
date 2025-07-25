import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/features/user/user.model";

export type ConversationType = "dm" | "channel";

export const conversationsTable = sqliteTable(
  "conversations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    description: text("description"),
    type: text("type").$type<ConversationType>().notNull().default("dm"),

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
    // Performance indexes
    typeIdx: index("conversations_type_idx").on(table.type),
    createdAtIdx: index("conversations_created_at_idx").on(table.createdAt),
    deactivatedByIdx: index("conversations_deactivated_by_idx").on(
      table.deactivatedBy,
    ),
    archivedByIdx: index("conversations_archived_by_idx").on(table.archivedBy),

    // Soft deletion indexes
    isActiveIdx: index("conversations_is_active_idx").on(table.isActive),
    isActiveCreatedAtIdx: index("conversations_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),

    // Archiving indexes
    archivedAtIdx: index("conversations_archived_at_idx").on(table.archivedAt),
    isActiveArchivedAtIdx: index("conversations_is_active_archived_at_idx").on(
      table.isActive,
      table.archivedAt,
    ),
  }),
);

export const conversationParticipantsTable = sqliteTable(
  "conversation_participants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversationsTable.id, { onDelete: "cascade" }),
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
    // Performance indexes
    conversationIdIdx: index(
      "conversation_participants_conversation_id_idx",
    ).on(table.conversationId),
    participantIdIdx: index("conversation_participants_participant_id_idx").on(
      table.participantId,
    ),
    deactivatedByIdx: index("conversation_participants_deactivated_by_idx").on(
      table.deactivatedBy,
    ),

    // Soft deletion indexes
    isActiveIdx: index("conversation_participants_is_active_idx").on(
      table.isActive,
    ),
    isActiveCreatedAtIdx: index(
      "conversation_participants_is_active_created_at_idx",
    ).on(table.isActive, table.createdAt),

    // Composite index for finding participants in a conversation
    conversationParticipantIdx: index(
      "conversation_participants_conversation_participant_idx",
    ).on(table.conversationId, table.participantId),
  }),
);

export type SelectConversation = typeof conversationsTable.$inferSelect;
export type InsertConversation = typeof conversationsTable.$inferInsert;
export type SelectConversationParticipant =
  typeof conversationParticipantsTable.$inferSelect;
export type InsertConversationParticipant =
  typeof conversationParticipantsTable.$inferInsert;
