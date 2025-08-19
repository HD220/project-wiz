import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  index,
  primaryKey,
  foreignKey,
} from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";

export const directMessagesTable = sqliteTable(
  "direct_messages",
  {
    id: text("id")
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    name: text("name"), // Auto-generated from participants
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
    ownerIdIdx: index("direct_messages_owner_id_idx").on(table.ownerId),
    createdAtIdx: index("direct_messages_created_at_idx").on(table.createdAt),

    // Soft deletion indexes
    deactivatedAtIdx: index("direct_messages_deactivated_at_idx").on(
      table.deactivatedAt,
    ),

    // Archiving indexes
    archivedAtIdx: index("direct_messages_archived_at_idx").on(
      table.archivedAt,
    ),
    // Combined archiving index
    deactivatedArchivedAtIdx: index(
      "direct_messages_deactivated_archived_at_idx",
    ).on(table.deactivatedAt, table.archivedAt),
  }),
);

export const directMessageParticipantsTable = sqliteTable(
  "direct_message_participants",
  {
    id: text("id")
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    directMessageId: text("direct_message_id").notNull(),
    participantId: text("participant_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

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

    // Foreign key composta para direct_messages
    directMessageFk: foreignKey({
      columns: [table.ownerId, table.directMessageId],
      foreignColumns: [directMessagesTable.ownerId, directMessagesTable.id],
    }),

    // Performance indexes
    ownerIdIdx: index("direct_message_participants_owner_id_idx").on(table.ownerId),
    directMessageIdIdx: index("direct_message_participants_direct_message_id_idx").on(
      table.directMessageId,
    ),
    participantIdIdx: index("direct_message_participants_participant_id_idx").on(
      table.participantId,
    ),

    // Soft deletion indexes
    deactivatedAtIdx: index("direct_message_participants_deactivated_at_idx").on(
      table.deactivatedAt,
    ),

    // Composite index for unique participant in DM
    directMessageParticipantIdx: index("direct_message_participants_dm_participant_idx").on(
      table.directMessageId,
      table.participantId,
    ),
  }),
);

export type SelectDirectMessage = typeof directMessagesTable.$inferSelect;
export type InsertDirectMessage = typeof directMessagesTable.$inferInsert;
export type SelectDirectMessageParticipant = typeof directMessageParticipantsTable.$inferSelect;
export type InsertDirectMessageParticipant = typeof directMessageParticipantsTable.$inferInsert;
