import type {
  MemoryType,
  MemoryImportance,
  SelectAgentMemory,
  InsertAgentMemory,
  UpdateAgentMemory,
  SelectMemoryRelation,
  InsertMemoryRelation,
  AgentMemoryWithMetadata,
  MemorySearchCriteria,
  MemoryRelevanceScore,
} from "@/main/features/agent/memory/agent-memories.schema";

export type {
  MemoryType,
  MemoryImportance,
  SelectAgentMemory,
  InsertAgentMemory,
  UpdateAgentMemory,
  SelectMemoryRelation,
  InsertMemoryRelation,
  AgentMemoryWithMetadata,
  MemorySearchCriteria,
  MemoryRelevanceScore,
};

// Enhanced types for frontend consumption
export interface MemoryAnalytics {
  totalMemories: number;
  memoriesByType: Record<MemoryType, number>;
  memoriesByImportance: Record<MemoryImportance, number>;
  averageImportanceScore: number;
  mostAccessedMemories: AgentMemoryWithMetadata[];
  recentMemories: AgentMemoryWithMetadata[];
}

export interface MemoryInsight {
  type: "pattern" | "preference" | "behavior" | "context";
  title: string;
  description: string;
  confidence: number;
  relatedMemoryIds: string[];
  createdAt: Date;
}

export interface MemoryContextWindow {
  conversationMemories: AgentMemoryWithMetadata[];
  relevantMemories: MemoryRelevanceScore[];
  userPreferences: AgentMemoryWithMetadata[];
  recentLearnings: AgentMemoryWithMetadata[];
}

export interface MemoryCreationInput {
  content: string;
  summary?: string;
  type: MemoryType;
  importance: MemoryImportance;
  keywords?: string[];
  metadata?: Record<string, unknown>;
  conversationId?: string;
}

export interface MemoryUpdateInput {
  content?: string;
  summary?: string;
  type?: MemoryType;
  importance?: MemoryImportance;
  keywords?: string[];
  metadata?: Record<string, unknown>;
}

export interface MemorySearchInput {
  query?: string;
  type?: MemoryType;
  importance?: MemoryImportance;
  conversationId?: string;
  keywords?: string[];
  limit?: number;
  includeArchived?: boolean;
}

export interface MemoryManagementOptions {
  autoArchiveDays: number;
  minImportanceThreshold: number;
  maxMemoriesPerAgent: number;
  enableAutoLearning: boolean;
  memoryRetentionPolicy: "none" | "importance_based" | "time_based" | "hybrid";
}
