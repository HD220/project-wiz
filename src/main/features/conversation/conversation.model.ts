import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

import { agentsTable } from "@/main/features/agent/agent.model";
import { usersTable } from "@/main/features/user/user.model";

export type ConversationType = "dm" | "agent_chat";

export const conversationsTable = sqliteTable(
  "conversations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    description: text("description"),
    type: text("type").$type<ConversationType>().notNull().default("dm"),
    agentId: text("agent_id").references(() => agentsTable.id, {
      onDelete: "cascade",
    }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    // Performance indexes
    agentIdIdx: index("conversations_agent_id_idx").on(table.agentId),
    typeIdx: index("conversations_type_idx").on(table.type),
    createdAtIdx: index("conversations_created_at_idx").on(table.createdAt),
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
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
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
