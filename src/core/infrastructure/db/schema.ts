import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

// Tabela de modelos LLM
export const models = sqliteTable("models", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  path: text("path").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Tabela de configurações
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: blob("value", { mode: "json" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Tabela de histórico de atividades
export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  metadata: blob("metadata", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Tabela de conversas
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  title: text("title"),
});

// Tabela de mensagens
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
});

// =============================
// Tabela de Prompts Personalizados
// =============================
export const prompts = sqliteTable("prompts", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull().unique(), // Nome único
  content: text("content").notNull(), // Conteúdo do prompt
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  version: integer("version").notNull().default(1), // Controle de versão
  isDefault: integer("is_default").notNull().default(0), // Booleano (0/1)
  isShared: integer("is_shared").notNull().default(0), // Booleano (0/1)
  sharedLink: text("shared_link"), // Link compartilhado opcional
});

// =============================
// Tabela de Variáveis dos Prompts
// =============================
export const variables = sqliteTable("variables", {
  id: text("id").primaryKey(), // UUID da variável
  promptId: text("prompt_id").notNull(), // FK para prompt
  name: text("name").notNull(), // Nome da variável
  type: text("type").notNull(), // Tipo: string, number, boolean, date, enum
  required: integer("required").notNull().default(0), // Booleano (0/1)
  defaultValue: blob("default_value", { mode: "json" }), // Valor padrão opcional
  options: blob("options", { mode: "json" }), // Opções para enum, opcional
});