import { and, desc, eq, sql } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";

import {
  agentMemoriesTable,
  memoryRelationsTable,
  type SelectAgentMemory,
  type InsertAgentMemory,
  type UpdateAgentMemory,
  type AgentMemoryWithMetadata,
  type MemorySearchCriteria,
  type MemoryRelevanceScore,
} from "./agent-memories.schema";

export class AgentMemoryService {
  /**
   * Create a new memory entry for an agent
   */
  static async create(
    input: InsertAgentMemory,
  ): Promise<AgentMemoryWithMetadata> {
    const db = getDatabase();

    // Parse keywords and metadata if provided as strings
    const processedInput = {
      ...input,
      keywords:
        typeof input.keywords === "string"
          ? input.keywords
          : JSON.stringify(input.keywords || []),
      metadata:
        typeof input.metadata === "string"
          ? input.metadata
          : JSON.stringify(input.metadata || {}),
      importanceScore:
        input.importanceScore ??
        AgentMemoryService.calculateImportanceScore(
          input.importance || "medium",
        ),
    };

    const [newMemory] = await db
      .insert(agentMemoriesTable)
      .values(processedInput)
      .returning();

    if (!newMemory) {
      throw new Error("Failed to create agent memory");
    }

    return AgentMemoryService.parseMemoryMetadata(newMemory);
  }

  /**
   * Retrieve a specific memory by ID
   */
  static async findById(id: string): Promise<AgentMemoryWithMetadata | null> {
    const db = getDatabase();

    const [memory] = await db
      .select()
      .from(agentMemoriesTable)
      .where(eq(agentMemoriesTable.id, id))
      .limit(1);

    if (!memory) return null;

    // Update access tracking
    await AgentMemoryService.updateAccessTracking(id);

    return AgentMemoryService.parseMemoryMetadata(memory);
  }

  /**
   * Search memories with relevance scoring
   */
  static async search(
    criteria: MemorySearchCriteria,
  ): Promise<MemoryRelevanceScore[]> {
    const db = getDatabase();

    // Build base query conditions
    const conditions = [
      eq(agentMemoriesTable.agentId, criteria.agentId),
      eq(agentMemoriesTable.userId, criteria.userId),
    ];

    if (!criteria.includeArchived) {
      conditions.push(eq(agentMemoriesTable.isArchived, false));
    }

    if (criteria.type) {
      conditions.push(eq(agentMemoriesTable.type, criteria.type));
    }

    if (criteria.importance) {
      conditions.push(eq(agentMemoriesTable.importance, criteria.importance));
    }

    if (criteria.conversationId) {
      conditions.push(
        eq(agentMemoriesTable.conversationId, criteria.conversationId),
      );
    }

    // Execute query
    const memories = await db
      .select()
      .from(agentMemoriesTable)
      .where(and(...conditions))
      .orderBy(
        desc(agentMemoriesTable.importanceScore),
        desc(agentMemoriesTable.lastAccessedAt),
        desc(agentMemoriesTable.createdAt),
      )
      .limit(criteria.limit || 50);

    // Parse and score memories
    const parsedMemories = memories.map((memory) =>
      AgentMemoryService.parseMemoryMetadata(memory),
    );

    // Apply text and keyword filtering with relevance scoring
    let scoredMemories = parsedMemories.map((memory) => ({
      memory,
      relevanceScore: AgentMemoryService.calculateRelevanceScore(
        memory,
        criteria,
      ),
      reasoning: AgentMemoryService.getRelevanceReasoning(memory, criteria),
    }));

    // Filter by query if provided
    if (criteria.query) {
      const queryLower = criteria.query.toLowerCase();
      scoredMemories = scoredMemories.filter(
        ({ memory }) =>
          memory.content.toLowerCase().includes(queryLower) ||
          memory.summary?.toLowerCase().includes(queryLower) ||
          memory.keywords?.some((keyword) =>
            keyword.toLowerCase().includes(queryLower),
          ),
      );
    }

    // Filter by keywords if provided
    if (criteria.keywords && criteria.keywords.length > 0) {
      scoredMemories = scoredMemories.filter(({ memory }) =>
        memory.keywords?.some((keyword) =>
          criteria.keywords!.some((searchKeyword) =>
            keyword.toLowerCase().includes(searchKeyword.toLowerCase()),
          ),
        ),
      );
    }

    // Sort by relevance score
    return scoredMemories
      .sort(
        (memoryA, memoryB) => memoryB.relevanceScore - memoryA.relevanceScore,
      )
      .slice(0, criteria.limit || 50);
  }

  /**
   * Get recent memories for an agent
   */
  static async getRecent(
    agentId: string,
    userId: string,
    limit: number = 10,
  ): Promise<AgentMemoryWithMetadata[]> {
    const db = getDatabase();

    const memories = await db
      .select()
      .from(agentMemoriesTable)
      .where(
        and(
          eq(agentMemoriesTable.agentId, agentId),
          eq(agentMemoriesTable.userId, userId),
          eq(agentMemoriesTable.isArchived, false),
        ),
      )
      .orderBy(desc(agentMemoriesTable.createdAt))
      .limit(limit);

    return memories.map((memory) =>
      AgentMemoryService.parseMemoryMetadata(memory),
    );
  }

  /**
   * Get memories by conversation
   */
  static async getByConversation(
    conversationId: string,
    limit: number = 20,
  ): Promise<AgentMemoryWithMetadata[]> {
    const db = getDatabase();

    const memories = await db
      .select()
      .from(agentMemoriesTable)
      .where(
        and(
          eq(agentMemoriesTable.conversationId, conversationId),
          eq(agentMemoriesTable.isArchived, false),
        ),
      )
      .orderBy(desc(agentMemoriesTable.createdAt))
      .limit(limit);

    return memories.map((memory) =>
      AgentMemoryService.parseMemoryMetadata(memory),
    );
  }

  /**
   * Update a memory entry
   */
  static async update(
    id: string,
    updates: Partial<UpdateAgentMemory>,
  ): Promise<AgentMemoryWithMetadata> {
    const db = getDatabase();

    // Process keywords and metadata
    const processedUpdates = {
      ...updates,
      ...(updates.keywords && {
        keywords:
          typeof updates.keywords === "string"
            ? updates.keywords
            : JSON.stringify(updates.keywords),
      }),
      ...(updates.metadata && {
        metadata:
          typeof updates.metadata === "string"
            ? updates.metadata
            : JSON.stringify(updates.metadata),
      }),
      ...(updates.importance && {
        importanceScore: AgentMemoryService.calculateImportanceScore(
          updates.importance,
        ),
      }),
      updatedAt: new Date(),
    };

    const [updatedMemory] = await db
      .update(agentMemoriesTable)
      .set(processedUpdates)
      .where(eq(agentMemoriesTable.id, id))
      .returning();

    if (!updatedMemory) {
      throw new Error("Failed to update agent memory");
    }

    return AgentMemoryService.parseMemoryMetadata(updatedMemory);
  }

  /**
   * Archive a memory
   */
  static async archive(id: string): Promise<void> {
    const db = getDatabase();

    await db
      .update(agentMemoriesTable)
      .set({
        isArchived: true,
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(agentMemoriesTable.id, id));
  }

  /**
   * Delete a memory permanently
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();

    // Delete related memory relations first
    await db
      .delete(memoryRelationsTable)
      .where(
        sql`${memoryRelationsTable.sourceMemoryId} = ${id} OR ${memoryRelationsTable.targetMemoryId} = ${id}`,
      );

    // Delete the memory
    await db.delete(agentMemoriesTable).where(eq(agentMemoriesTable.id, id));
  }

  /**
   * Create a relation between two memories
   */
  static async createRelation(
    sourceMemoryId: string,
    targetMemoryId: string,
    relationType: string,
    strength: number = 0.5,
  ): Promise<void> {
    const db = getDatabase();

    await db.insert(memoryRelationsTable).values({
      sourceMemoryId,
      targetMemoryId,
      relationType,
      strength,
    });
  }

  /**
   * Get related memories
   */
  static async getRelatedMemories(
    memoryId: string,
  ): Promise<AgentMemoryWithMetadata[]> {
    const db = getDatabase();

    const relations = await db
      .select({
        memory: agentMemoriesTable,
        relationType: memoryRelationsTable.relationType,
        strength: memoryRelationsTable.strength,
      })
      .from(memoryRelationsTable)
      .innerJoin(
        agentMemoriesTable,
        eq(agentMemoriesTable.id, memoryRelationsTable.targetMemoryId),
      )
      .where(eq(memoryRelationsTable.sourceMemoryId, memoryId))
      .orderBy(desc(memoryRelationsTable.strength));

    return relations.map((relation) =>
      AgentMemoryService.parseMemoryMetadata(relation.memory),
    );
  }

  /**
   * Prune old, low-importance memories
   */
  static async pruneOldMemories(
    agentId: string,
    daysOld: number = 90,
    minImportanceScore: number = 0.3,
  ): Promise<number> {
    const db = getDatabase();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db
      .update(agentMemoriesTable)
      .set({
        isArchived: true,
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(agentMemoriesTable.agentId, agentId),
          eq(agentMemoriesTable.isArchived, false),
          sql`${agentMemoriesTable.createdAt} < ${Math.floor(cutoffDate.getTime() / 1000)}`,
          sql`${agentMemoriesTable.importanceScore} < ${minImportanceScore}`,
        ),
      );

    return result.changes || 0;
  }

  /**
   * Update access tracking for a memory
   */
  private static async updateAccessTracking(memoryId: string): Promise<void> {
    const db = getDatabase();

    await db
      .update(agentMemoriesTable)
      .set({
        accessCount: sql`${agentMemoriesTable.accessCount} + 1`,
        lastAccessedAt: new Date(),
      })
      .where(eq(agentMemoriesTable.id, memoryId));
  }

  /**
   * Parse memory metadata from JSON strings
   */
  private static parseMemoryMetadata(
    memory: SelectAgentMemory,
  ): AgentMemoryWithMetadata {
    return {
      ...memory,
      keywords: memory.keywords ? JSON.parse(memory.keywords) : [],
      metadata: memory.metadata ? JSON.parse(memory.metadata) : {},
    };
  }

  /**
   * Calculate importance score from importance level
   */
  private static calculateImportanceScore(importance: string): number {
    const scoreMap: Record<string, number> = {
      low: 0.25,
      medium: 0.5,
      high: 0.75,
      critical: 1.0,
    };
    return scoreMap[importance] || 0.5;
  }

  /**
   * Calculate relevance score for memory search
   */
  private static calculateRelevanceScore(
    memory: AgentMemoryWithMetadata,
    criteria: MemorySearchCriteria,
  ): number {
    let score = memory.importanceScore;

    // Boost recent memories
    if (memory.lastAccessedAt) {
      const daysSinceAccess =
        (Date.now() - memory.lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24);
      score += Math.max(0, (30 - daysSinceAccess) / 30) * 0.2;
    }

    // Boost frequently accessed memories
    if (memory.accessCount > 0) {
      score += Math.min(memory.accessCount / 10, 0.3);
    }

    // Boost conversation-specific memories
    if (
      criteria.conversationId &&
      memory.conversationId === criteria.conversationId
    ) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get relevance reasoning for debugging
   */
  private static getRelevanceReasoning(
    memory: AgentMemoryWithMetadata,
    criteria: MemorySearchCriteria,
  ): string {
    const reasons: string[] = [];

    reasons.push(
      `Base importance: ${memory.importance} (${memory.importanceScore})`,
    );

    if (memory.accessCount > 0) {
      reasons.push(`Accessed ${memory.accessCount} times`);
    }

    if (
      criteria.conversationId &&
      memory.conversationId === criteria.conversationId
    ) {
      reasons.push("Same conversation context");
    }

    return reasons.join(", ");
  }
}
