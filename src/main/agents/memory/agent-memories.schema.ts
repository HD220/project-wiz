import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

import { agentsTable } from "@/main/agents/agents.schema";
import { conversationsTable } from "@/main/conversations/conversations.schema";
import { usersTable } from "@/main/user/users.schema";

export type MemoryType =
  | "conversation"
  | "preference"
  | "learning"
  | "context"
  | "fact";
export type MemoryImportance = "low" | "medium" | "high" | "critical";

export const agentMemoriesTable = sqliteTable("agent_memories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id")
    .notNull()
    .references(() => agentsTable.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  conversationId: text("conversation_id").references(
    () => conversationsTable.id,
    { onDelete: "set null" },
  ),

  // Memory content
  content: text("content").notNull(),
  summary: text("summary"), // Brief summary for quick retrieval
  type: text("type").$type<MemoryType>().notNull().default("conversation"),
  importance: text("importance")
    .$type<MemoryImportance>()
    .notNull()
    .default("medium"),

  // Scoring and retrieval
  importanceScore: real("importance_score").notNull().default(0.5), // 0.0 to 1.0
  accessCount: integer("access_count").notNull().default(0),
  lastAccessedAt: integer("last_accessed_at", { mode: "timestamp" }),

  // Context and metadata
  keywords: text("keywords"), // JSON array of keywords for search
  metadata: text("metadata"), // JSON object for additional context

  // Archival
  isArchived: integer("is_archived", { mode: "boolean" })
    .notNull()
    .default(false),
  archivedAt: integer("archived_at", { mode: "timestamp" }),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export const memoryRelationsTable = sqliteTable("memory_relations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  sourceMemoryId: text("source_memory_id")
    .notNull()
    .references(() => agentMemoriesTable.id, { onDelete: "cascade" }),
  targetMemoryId: text("target_memory_id")
    .notNull()
    .references(() => agentMemoriesTable.id, { onDelete: "cascade" }),
  relationType: text("relation_type").notNull(), // "relates_to", "caused_by", "contradicts", etc.
  strength: real("strength").notNull().default(0.5), // 0.0 to 1.0
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
});

export type SelectAgentMemory = typeof agentMemoriesTable.$inferSelect;
export type InsertAgentMemory = typeof agentMemoriesTable.$inferInsert;
export type UpdateAgentMemory = Partial<InsertAgentMemory> & { id: string };

export type SelectMemoryRelation = typeof memoryRelationsTable.$inferSelect;
export type InsertMemoryRelation = typeof memoryRelationsTable.$inferInsert;

// Extended types with metadata parsing
export interface AgentMemoryWithMetadata
  extends Omit<SelectAgentMemory, "keywords" | "metadata"> {
  keywords?: string[];
  metadata?: Record<string, unknown>;
}

export interface MemorySearchCriteria {
  agentId: string;
  userId: string;
  query?: string;
  type?: MemoryType;
  importance?: MemoryImportance;
  conversationId?: string;
  keywords?: string[];
  limit?: number;
  includeArchived?: boolean;
}

export interface MemoryRelevanceScore {
  memory: AgentMemoryWithMetadata;
  relevanceScore: number;
  reasoning: string;
}
