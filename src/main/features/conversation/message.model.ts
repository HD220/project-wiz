import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { conversationsTable } from "@/main/features/conversation/conversation.model";
import { usersTable } from "@/main/features/user/user.model";

export const messagesTable = sqliteTable(
  "messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversationsTable.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    content: text("content").notNull(),

    // Soft deletion fields
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    deactivatedAt: integer("deactivated_at", { mode: "timestamp_ms" }),
    deactivatedBy: text("deactivated_by").references(() => usersTable.id),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => Date.now()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (table) => ({
    // Performance indexes
    conversationIdIdx: index("messages_conversation_id_idx").on(
      table.conversationId,
    ),
    authorIdIdx: index("messages_author_id_idx").on(table.authorId),
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

    // Composite index for conversation messages ordered by time
    conversationTimeIdx: index("messages_conversation_time_idx").on(
      table.conversationId,
      table.createdAt,
    ),
  }),
);

export const llmMessagesTable = sqliteTable(
  "llm_messages",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
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
      .$defaultFn(() => Date.now()),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .$defaultFn(() => Date.now()),
  },
  (table) => ({
    // Performance indexes
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
