import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const directMessages = sqliteTable("direct_messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id").notNull(),
  receiverId: text("receiver_id").notNull(),
  content: text("content").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});
