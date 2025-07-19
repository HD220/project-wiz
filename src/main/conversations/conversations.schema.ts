import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

import { usersTable } from "@/main/user/users.schema";

export const conversationsTable = sqliteTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  description: text("description"),
  type: text("type").$type<"dm">().notNull().default("dm"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const conversationParticipantsTable = sqliteTable(
  "conversation_participants",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversationsTable.id),
    participantId: text("participant_id")
      .notNull()
      .references(() => usersTable.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
);

export type SelectConversation = typeof conversationsTable.$inferSelect;
export type InsertConversation = typeof conversationsTable.$inferInsert;
export type SelectConversationParticipant =
  typeof conversationParticipantsTable.$inferSelect;
export type InsertConversationParticipant =
  typeof conversationParticipantsTable.$inferInsert;
