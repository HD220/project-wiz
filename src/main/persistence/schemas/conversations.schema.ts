import { randomUUID } from "node:crypto";

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const conversations = sqliteTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  type: text("type", {
    enum: ["direct", "group"],
  })
    .notNull()
    .default("direct"),
  participants: text("participants").notNull(), // JSON string array
  lastMessageAt: text("last_message_at"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type ConversationSchema = typeof conversations.$inferSelect;
export type CreateConversationSchema = typeof conversations.$inferInsert;
