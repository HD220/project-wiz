import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const models = sqliteTable("models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  path: text("path").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: blob("value", { mode: "json" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  metadata: blob("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  title: text("title"),
  status: text("status").notNull().default("active"), // active, paused, closed
  metadata: blob("metadata", { mode: "json" }), // repository, task, workflow
});

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});

// =============================
// Custom Prompts Table
// =============================
export const prompts = sqliteTable("prompts", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull().unique(), // Unique name
  content: text("content").notNull(), // Prompt content
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  version: integer("version").notNull().default(1), // Version control
  isDefault: integer("is_default").notNull().default(0), // Boolean (0/1)
  isShared: integer("is_shared").notNull().default(0), // Boolean (0/1)
  sharedLink: text("shared_link"), // Optional shared link
});

// =============================
// Prompt Variables Table
// =============================
export const variables = sqliteTable("variables", {
  id: text("id").primaryKey(), // Variable UUID
  promptId: text("prompt_id").notNull(), // FK to prompt
  name: text("name").notNull(), // Variable name
  type: text("type").notNull(), // Type: string, number, boolean, date, enum
  required: integer("required").notNull().default(0), // Boolean (0/1)
  defaultValue: blob("default_value", { mode: "json" }), // Optional default value
  options: blob("options", { mode: "json" }), // Optional options for enum
});