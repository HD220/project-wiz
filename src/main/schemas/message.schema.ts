import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";

export type MessageSourceType = "dm" | "channel";

export const messagesTable = sqliteTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    // Polymorphic reference - can point to DM or Channel
    sourceType: text("source_type").$type<MessageSourceType>().notNull(),
    sourceId: text("source_id").notNull(), // dm_conversation_id or project_channel_id

    // Who OWNS/CONTROLS this message (user who owns the conversation)
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    // Who AUTHORED/SENT this message (user or agent who wrote it)
    authorId: text("author_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    content: text("content").notNull(),

    // Soft deletion fields
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    // Performance indexes for foreign keys
    ownerIdIdx: index("messages_owner_id_idx").on(table.ownerId),
    authorIdIdx: index("messages_author_id_idx").on(table.authorId),
    sourceTypeIdx: index("messages_source_type_idx").on(table.sourceType),
    sourceIdIdx: index("messages_source_id_idx").on(table.sourceId),
    createdAtIdx: index("messages_created_at_idx").on(table.createdAt),

    // Soft deletion indexes
    deactivatedAtIdx: index("messages_deactivated_at_idx").on(
      table.deactivatedAt,
    ),

    // Query optimization indexes
    sourceTimeIdx: index("messages_source_time_idx").on(
      table.sourceType,
      table.sourceId,
      table.createdAt,
    ),
    sourceDeactivatedTimeIdx: index("messages_source_deactivated_time_idx").on(
      table.sourceType,
      table.sourceId,
      table.deactivatedAt,
      table.createdAt,
    ),
  }),
);


export type SelectMessage = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
