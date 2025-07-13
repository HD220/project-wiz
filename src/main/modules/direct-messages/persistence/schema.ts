import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";

export const conversations = sqliteTable("conversations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  participants: text("participants").notNull(), // JSON string array
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const messages = sqliteTable("messages", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  content: text("content").notNull(),
  senderId: text("sender_id").notNull(),
  senderName: text("sender_name").notNull(),
  senderType: text("sender_type", {
    enum: ["user", "agent", "system"],
  }).notNull(),
  conversationId: text("conversation_id").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type ConversationSchema = typeof conversations.$inferSelect;
export type CreateConversationSchema = typeof conversations.$inferInsert;
export type MessageSchema = typeof messages.$inferSelect;
export type CreateMessageSchema = typeof messages.$inferInsert;