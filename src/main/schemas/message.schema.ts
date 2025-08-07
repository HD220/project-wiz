import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/schemas/user.schema";

export type MessageSourceType = "dm" | "channel";

export const messagesTable = sqliteTable(
  "messages",
  {
    id: text("id")
      .notNull()
      .$defaultFn(() => crypto.randomUUID()),

    // Polymorphic reference - can point to DM or Channel
    sourceType: text("source_type").$type<MessageSourceType>().notNull(),
    sourceId: text("source_id").notNull(), // dm_conversation_id or project_channel_id

    ownerId: text("owner_id")
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
    // Composite primary key
    pk: primaryKey({ columns: [table.ownerId, table.id] }),
    
    // Performance indexes for foreign keys
    ownerIdIdx: index("messages_owner_id_idx").on(table.ownerId),
    sourceTypeIdx: index("messages_source_type_idx").on(table.sourceType),
    sourceIdIdx: index("messages_source_id_idx").on(table.sourceId),
    createdAtIdx: index("messages_created_at_idx").on(table.createdAt),

    // Soft deletion indexes
    deactivatedAtIdx: index("messages_deactivated_at_idx").on(table.deactivatedAt),

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

export const llmMessagesTable = sqliteTable(
  "llm_messages",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID()),
    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    messageId: text("message_id")
      .notNull()
      .references(() => messagesTable.id, { onDelete: "cascade" }),
    role: text("role")
      .$type<"user" | "assistant" | "system" | "tool">()
      .notNull(),
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
    // Composite primary key
    pk: primaryKey({ columns: [table.ownerId, table.id] }),
    
    // Performance indexes
    ownerIdIdx: index("llm_messages_owner_id_idx").on(table.ownerId),
    messageIdIdx: index("llm_messages_message_id_idx").on(table.messageId),
    roleIdx: index("llm_messages_role_idx").on(table.role),
    createdAtIdx: index("llm_messages_created_at_idx").on(table.createdAt),

    // Soft deletion indexes
    deactivatedAtIdx: index("llm_messages_deactivated_at_idx").on(table.deactivatedAt),
  }),
);

export type SelectMessage = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectLlmMessage = typeof llmMessagesTable.$inferSelect;
export type InsertLlmMessage = typeof llmMessagesTable.$inferInsert;
