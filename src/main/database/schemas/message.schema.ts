import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index, primaryKey } from "drizzle-orm/sqlite-core";

import { usersTable } from "./user.schema";

export type MessageSourceType = "dm" | "channel";

export const messagesTable = sqliteTable(
  "messages",
  {
    id: text("id")
      .$defaultFn(() => crypto.randomUUID()),

    // Polymorphic reference - can point to DM or Channel
    sourceType: text("source_type").$type<MessageSourceType>().notNull(),
    sourceId: text("source_id").notNull(), // dm_conversation_id or project_channel_id

    ownerId: text("owner_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),

    // Soft deletion fields
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),
    deactivatedBy: text("deactivated_by").references(() => usersTable.id),

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
    deactivatedByIdx: index("messages_deactivated_by_idx").on(
      table.deactivatedBy,
    ),

    // Soft deletion indexes
    isActiveIdx: index("messages_is_active_idx").on(table.isActive),
    isActiveCreatedAtIdx: index("messages_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),

    // Query optimization indexes
    sourceTimeIdx: index("messages_source_time_idx").on(
      table.sourceType,
      table.sourceId,
      table.createdAt,
    ),
    sourceActiveTimeIdx: index("messages_source_active_time_idx").on(
      table.sourceType,
      table.sourceId,
      table.isActive,
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
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),
    deactivatedBy: text("deactivated_by").references(() => usersTable.id),

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
    deactivatedByIdx: index("llm_messages_deactivated_by_idx").on(
      table.deactivatedBy,
    ),

    // Soft deletion indexes
    isActiveIdx: index("llm_messages_is_active_idx").on(table.isActive),
    isActiveCreatedAtIdx: index("llm_messages_is_active_created_at_idx").on(
      table.isActive,
      table.createdAt,
    ),
  }),
);

export type SelectMessage = typeof messagesTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectLlmMessage = typeof llmMessagesTable.$inferSelect;
export type InsertLlmMessage = typeof llmMessagesTable.$inferInsert;
