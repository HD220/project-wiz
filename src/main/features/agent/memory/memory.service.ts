import { desc, eq } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import {
  agentMemoriesTable,
  type SelectAgentMemory,
  type InsertAgentMemory,
} from "@/main/features/agent/memory/memory.model";

export class SimplifiedMemoryService {
  /**
   * Store a new memory entry for an agent
   */
  static async store(input: InsertAgentMemory): Promise<SelectAgentMemory> {
    const db = getDatabase();

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
      importanceScore: input.importanceScore ?? 0.5,
    };

    const [newMemory] = await db
      .insert(agentMemoriesTable)
      .values(processedInput)
      .returning();

    if (!newMemory) {
      throw new Error("Failed to create agent memory");
    }

    return newMemory;
  }

  /**
   * Retrieve memories for an agent, ordered by creation date
   */
  static async retrieve(
    agentId: string,
    limit: number = 50,
  ): Promise<SelectAgentMemory[]> {
    const db = getDatabase();

    return await db
      .select()
      .from(agentMemoriesTable)
      .where(eq(agentMemoriesTable.agentId, agentId))
      .orderBy(desc(agentMemoriesTable.createdAt))
      .limit(limit);
  }

  /**
   * Find memory by ID
   */
  static async findById(id: string): Promise<SelectAgentMemory | null> {
    const db = getDatabase();

    const [memory] = await db
      .select()
      .from(agentMemoriesTable)
      .where(eq(agentMemoriesTable.id, id))
      .limit(1);

    return memory || null;
  }

  /**
   * Update a memory entry
   */
  static async update(
    id: string,
    input: Partial<InsertAgentMemory>,
  ): Promise<SelectAgentMemory> {
    const db = getDatabase();

    const processedInput = {
      ...input,
      keywords: input.keywords
        ? typeof input.keywords === "string"
          ? input.keywords
          : JSON.stringify(input.keywords)
        : undefined,
      metadata: input.metadata
        ? typeof input.metadata === "string"
          ? input.metadata
          : JSON.stringify(input.metadata)
        : undefined,
    };

    const [updatedMemory] = await db
      .update(agentMemoriesTable)
      .set(processedInput)
      .where(eq(agentMemoriesTable.id, id))
      .returning();

    if (!updatedMemory) {
      throw new Error("Memory not found or update failed");
    }

    return updatedMemory;
  }

  /**
   * Delete a memory entry
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();

    await db.delete(agentMemoriesTable).where(eq(agentMemoriesTable.id, id));
  }
}
