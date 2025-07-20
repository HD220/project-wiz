// Renderer-specific types for agent memory to avoid boundary violations
// These types mirror the main types but are separated for architectural compliance

export type MemoryType =
  | "conversation"
  | "preference"
  | "learning"
  | "context"
  | "fact";

export type MemoryImportance = "low" | "medium" | "high" | "critical";

export interface AgentMemoryWithMetadata {
  id: string;
  agentId: string;
  userId: string;
  conversationId?: string | null;
  content: string;
  summary?: string | null;
  type: MemoryType;
  importance: MemoryImportance;
  importanceScore: number;
  accessCount: number;
  lastAccessedAt?: Date | null;
  keywords?: string[];
  metadata?: Record<string, unknown>;
  isArchived: boolean;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemoryRelevanceScore {
  memory: AgentMemoryWithMetadata;
  relevanceScore: number;
  reasoning: string;
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

export interface InsertAgentMemory {
  agentId: string;
  userId: string;
  conversationId?: string;
  content: string;
  summary?: string;
  type: MemoryType;
  importance: MemoryImportance;
  importanceScore?: number;
  keywords?: string;
  metadata?: string;
}

export interface UpdateAgentMemory {
  id: string;
  content?: string;
  summary?: string;
  type?: MemoryType;
  importance?: MemoryImportance;
  importanceScore?: number;
  keywords?: string;
  metadata?: string;
}

export interface IpcResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
