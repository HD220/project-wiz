import type {
  AgentMemoryWithMetadata,
  MemorySearchCriteria,
  MemoryRelevanceScore,
  InsertAgentMemory,
  UpdateAgentMemory,
  IpcResponse,
} from "@/renderer/types/agent-memory.types";

export const agentMemoryApi = {
  /**
   * Create a new memory entry
   */
  create: (
    input: InsertAgentMemory,
  ): Promise<IpcResponse<AgentMemoryWithMetadata>> =>
    window.api.agentMemory.create(input) as Promise<
      IpcResponse<AgentMemoryWithMetadata>
    >,

  /**
   * Find memory by ID
   */
  findById: (
    id: string,
  ): Promise<IpcResponse<AgentMemoryWithMetadata | null>> =>
    window.api.agentMemory.findById(id) as Promise<
      IpcResponse<AgentMemoryWithMetadata | null>
    >,

  /**
   * Search memories with criteria
   */
  search: (
    criteria: MemorySearchCriteria,
  ): Promise<IpcResponse<MemoryRelevanceScore[]>> =>
    window.api.agentMemory.search(criteria) as Promise<
      IpcResponse<MemoryRelevanceScore[]>
    >,

  /**
   * Get recent memories for an agent
   */
  getRecent: (
    agentId: string,
    userId: string,
    limit?: number,
  ): Promise<IpcResponse<AgentMemoryWithMetadata[]>> =>
    window.api.agentMemory.getRecent(agentId, userId, limit) as Promise<
      IpcResponse<AgentMemoryWithMetadata[]>
    >,

  /**
   * Get memories by conversation
   */
  getByConversation: (
    conversationId: string,
    limit?: number,
  ): Promise<IpcResponse<AgentMemoryWithMetadata[]>> =>
    window.api.agentMemory.getByConversation(conversationId, limit) as Promise<
      IpcResponse<AgentMemoryWithMetadata[]>
    >,

  /**
   * Update a memory
   */
  update: (
    id: string,
    updates: Partial<UpdateAgentMemory>,
  ): Promise<IpcResponse<AgentMemoryWithMetadata>> =>
    window.api.agentMemory.update(id, updates) as Promise<
      IpcResponse<AgentMemoryWithMetadata>
    >,

  /**
   * Archive a memory
   */
  archive: (id: string): Promise<IpcResponse<void>> =>
    window.api.agentMemory.archive(id) as Promise<IpcResponse<void>>,

  /**
   * Delete a memory
   */
  delete: (id: string): Promise<IpcResponse<void>> =>
    window.api.agentMemory.delete(id) as Promise<IpcResponse<void>>,

  /**
   * Create memory relation
   */
  createRelation: (
    sourceMemoryId: string,
    targetMemoryId: string,
    relationType: string,
    strength?: number,
  ): Promise<IpcResponse<void>> =>
    window.api.agentMemory.createRelation(
      sourceMemoryId,
      targetMemoryId,
      relationType,
      strength,
    ) as Promise<IpcResponse<void>>,

  /**
   * Get related memories
   */
  getRelated: (
    memoryId: string,
  ): Promise<IpcResponse<AgentMemoryWithMetadata[]>> =>
    window.api.agentMemory.getRelated(memoryId) as Promise<
      IpcResponse<AgentMemoryWithMetadata[]>
    >,

  /**
   * Prune old memories
   */
  prune: (
    agentId: string,
    daysOld?: number,
    minImportanceScore?: number,
  ): Promise<IpcResponse<number>> =>
    window.api.agentMemory.prune(
      agentId,
      daysOld,
      minImportanceScore,
    ) as Promise<IpcResponse<number>>,
};

export const agentChatApi = {
  /**
   * Send message to agent with memory
   */
  sendMessageWithMemory: (input: {
    agentId: string;
    userId: string;
    content: string;
  }) => window.api.agentChat.sendMessageWithMemory(input),

  /**
   * Get agent conversation with memory context
   */
  getConversationWithMemory: (userId: string, agentId: string) =>
    window.api.agentChat.getConversationWithMemory(userId, agentId),
};
