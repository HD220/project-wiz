import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { users } from "../authentication/users.schema";
import { agents } from "../../agents/worker/agents.schema";

export const dmConversations = sqliteTable("dm_conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  agentId: text("agent_id")
    .notNull()
    .references(() => agents.id),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  isPinned: integer("is_pinned", { mode: "boolean" }).default(false),
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
  lastReadAt: integer("last_read_at", { mode: "timestamp" }),
  unreadCount: integer("unread_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export type DmConversation = typeof dmConversations.$inferSelect;
export type NewDmConversation = typeof dmConversations.$inferInsert;
