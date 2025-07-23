import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";

import { agentsTable } from "@/main/features/agent/agent.model";
import { conversationsTable } from "@/main/features/conversation/conversation.model";
import { usersTable } from "@/main/features/user/user.model";

export type MemoryType =
  | "conversation"
  | "preference"
  | "learning"
  | "context"
  | "fact";
export type MemoryImportance = "low" | "medium" | "high" | "critical";

export const agentMemoriesTable = sqliteTable(
  "agent_memories",
  {
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
    lastAccessedAt: integer("last_accessed_at", { mode: "timestamp_ms" }),

    // Context and metadata
    keywords: text("keywords"), // JSON array of keywords for search
    metadata: text("metadata"), // JSON object for additional context

    // Archival
    isArchived: integer("is_archived", { mode: "boolean" })
      .notNull()
      .default(false),
    archivedAt: integer("archived_at", { mode: "timestamp_ms" }),

    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    // Performance indexes for foreign keys
    agentIdIdx: index("agent_memories_agent_id_idx").on(table.agentId),
    userIdIdx: index("agent_memories_user_id_idx").on(table.userId),
    conversationIdIdx: index("agent_memories_conversation_id_idx").on(
      table.conversationId,
    ),

    // Indexes for frequently queried columns
    typeIdx: index("agent_memories_type_idx").on(table.type),
    importanceIdx: index("agent_memories_importance_idx").on(table.importance),
    importanceScoreIdx: index("agent_memories_importance_score_idx").on(
      table.importanceScore,
    ),
    accessCountIdx: index("agent_memories_access_count_idx").on(
      table.accessCount,
    ),
    lastAccessedAtIdx: index("agent_memories_last_accessed_at_idx").on(
      table.lastAccessedAt,
    ),
    isArchivedIdx: index("agent_memories_is_archived_idx").on(table.isArchived),
    createdAtIdx: index("agent_memories_created_at_idx").on(table.createdAt),

    // Composite indexes for common query patterns
    agentUserIdx: index("agent_memories_agent_user_idx").on(
      table.agentId,
      table.userId,
    ),
    agentTypeIdx: index("agent_memories_agent_type_idx").on(
      table.agentId,
      table.type,
    ),
    agentImportanceIdx: index("agent_memories_agent_importance_idx").on(
      table.agentId,
      table.importance,
    ),
    userConversationIdx: index("agent_memories_user_conversation_idx").on(
      table.userId,
      table.conversationId,
    ),
  }),
);

export const memoryRelationsTable = sqliteTable(
  "memory_relations",
  {
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
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(strftime('%s', 'now'))`),
  },
  (table) => ({
    // Performance indexes for foreign keys
    sourceMemoryIdIdx: index("memory_relations_source_memory_id_idx").on(
      table.sourceMemoryId,
    ),
    targetMemoryIdIdx: index("memory_relations_target_memory_id_idx").on(
      table.targetMemoryId,
    ),
    relationTypeIdx: index("memory_relations_relation_type_idx").on(
      table.relationType,
    ),
    strengthIdx: index("memory_relations_strength_idx").on(table.strength),

    // Composite indexes for relationship queries
    sourceRelationIdx: index("memory_relations_source_relation_idx").on(
      table.sourceMemoryId,
      table.relationType,
    ),
    targetRelationIdx: index("memory_relations_target_relation_idx").on(
      table.targetMemoryId,
      table.relationType,
    ),
  }),
);

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
