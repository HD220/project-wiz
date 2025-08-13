import { createDatabaseConnection } from "@/shared/config/database";

// Use the same connection pattern as VectorService (no vec extension needed here)
const { getDatabase } = createDatabaseConnection(true, false);
import {
  memoryTable,
  agentMemoryTable,
  teamMemoryTable,
  projectMemoryTable,
} from "@/main/schemas/memory.schema";
import { eq, desc } from "drizzle-orm";
import { getLogger } from "@/shared/services/logger/config";
import { VectorService } from "./vector.service";

const logger = getLogger("memory-service");

export type MemoryLevel = "agent" | "team" | "project";

export class MemoryService {
  /**
   * Save memory at specified level with vec0 embedding
   */
  static async save(
    content: string,
    level: MemoryLevel,
    createdBy: string,
    context: {
      agentId?: string;
      projectId?: string;
    },
  ): Promise<string> {
    const db = getDatabase();

    // Create the memory record (no embedding column needed, vec0 handles it)
    const memoryId = crypto.randomUUID();
    await db.insert(memoryTable).values({
      id: memoryId,
      content,
      createdBy,
      createdAt: new Date(),
    });

    // Generate and store embedding in vec0
    try {
      const embeddingVector = await VectorService.generateEmbedding(content);
      await VectorService.storeEmbedding(memoryId, embeddingVector);
      logger.debug("Generated and stored embedding for memory content");
    } catch (error) {
      logger.warn("Failed to generate/store embedding for memory:", error);
      // Continue without embedding - semantic search won't work but basic functionality remains
    }

    // Create the appropriate relation
    switch (level) {
      case "agent":
        if (!context.agentId) {
          throw new Error("agentId required for agent memory");
        }
        await db.insert(agentMemoryTable).values({
          memoryId,
          agentId: context.agentId,
        });
        break;

      case "team":
        if (!context.projectId) {
          throw new Error("projectId required for team memory");
        }
        await db.insert(teamMemoryTable).values({
          memoryId,
          projectId: context.projectId,
        });
        break;

      case "project":
        if (!context.projectId) {
          throw new Error("projectId required for project memory");
        }
        await db.insert(projectMemoryTable).values({
          memoryId,
          projectId: context.projectId,
        });
        break;
    }

    logger.info(`Saved ${level} memory: ${memoryId}`);
    return memoryId;
  }

  /**
   * Get memories by level with optional semantic search
   */
  static async getByLevel(
    level: MemoryLevel,
    context: {
      agentId?: string;
      projectId?: string;
      query?: string; // For semantic search
    },
    limit = 10,
  ): Promise<
    Array<{ id: string; content: string; createdAt: Date; similarity?: number }>
  > {
    const db = getDatabase();

    let query;

    switch (level) {
      case "agent":
        if (!context.agentId) {
          throw new Error("agentId required to fetch agent memory");
        }
        query = db
          .select({
            id: memoryTable.id,
            content: memoryTable.content,
            createdAt: memoryTable.createdAt,
          })
          .from(memoryTable)
          .innerJoin(
            agentMemoryTable,
            eq(agentMemoryTable.memoryId, memoryTable.id),
          )
          .where(eq(agentMemoryTable.agentId, context.agentId))
          .orderBy(desc(memoryTable.createdAt));
        break;

      case "team":
        if (!context.projectId) {
          throw new Error("projectId required to fetch team memory");
        }
        query = db
          .select({
            id: memoryTable.id,
            content: memoryTable.content,
            createdAt: memoryTable.createdAt,
          })
          .from(memoryTable)
          .innerJoin(
            teamMemoryTable,
            eq(teamMemoryTable.memoryId, memoryTable.id),
          )
          .where(eq(teamMemoryTable.projectId, context.projectId))
          .orderBy(desc(memoryTable.createdAt));
        break;

      case "project":
        if (!context.projectId) {
          throw new Error("projectId required to fetch project memory");
        }
        query = db
          .select({
            id: memoryTable.id,
            content: memoryTable.content,
            createdAt: memoryTable.createdAt,
          })
          .from(memoryTable)
          .innerJoin(
            projectMemoryTable,
            eq(projectMemoryTable.memoryId, memoryTable.id),
          )
          .where(eq(projectMemoryTable.projectId, context.projectId))
          .orderBy(desc(memoryTable.createdAt));
        break;
    }

    const memories = await query;

    // If no query provided, return by date (recent first)
    if (!context.query) {
      return memories.slice(0, limit).map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
      }));
    }

    // Perform semantic search using vec0
    try {
      const queryEmbedding = await VectorService.generateEmbedding(
        context.query,
      );

      // Find similar memories using vec0
      const similarResults = await VectorService.findSimilar(
        queryEmbedding,
        limit,
        0.3,
      );

      if (similarResults.length === 0) {
        // Fallback to recent memories if no similar ones found
        return memories.slice(0, limit).map((m) => ({
          id: m.id,
          content: m.content,
          createdAt: m.createdAt,
        }));
      }

      // Get memory details for similar results
      const memoryIds = similarResults.map((r) => r.memoryId);
      const similarMemories = memories.filter((m) => memoryIds.includes(m.id));

      // Sort by similarity distance (lower = more similar)
      const sortedMemories = similarMemories
        .map((memory) => ({
          id: memory.id,
          content: memory.content,
          createdAt: memory.createdAt,
          similarity:
            1 -
            (similarResults.find((r) => r.memoryId === memory.id)?.distance ||
              0), // Convert distance to similarity
        }))
        .sort((a, b) => (b.similarity || 0) - (a.similarity || 0));

      logger.debug(
        `Found ${sortedMemories.length} similar memories using vec0`,
      );

      return sortedMemories;
    } catch (error) {
      logger.warn(
        "Vec0 semantic search failed, falling back to recent memories:",
        error,
      );
      // Fallback to recent memories
      return memories.slice(0, limit).map((m) => ({
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
      }));
    }
  }

  /**
   * Get all relevant memories for an agent with semantic search
   */
  static async getRelevantMemories(
    agentId: string,
    projectId?: string,
    query?: string,
    limit = 30,
  ): Promise<{
    agent: Array<{
      id: string;
      content: string;
      createdAt: Date;
      similarity?: number;
    }>;
    team: Array<{
      id: string;
      content: string;
      createdAt: Date;
      similarity?: number;
    }>;
    project: Array<{
      id: string;
      content: string;
      createdAt: Date;
      similarity?: number;
    }>;
  }> {
    const promises: Promise<any>[] = [
      this.getByLevel("agent", { agentId, query }, Math.ceil(limit / 3)),
    ];

    if (projectId) {
      promises.push(
        this.getByLevel("team", { projectId, query }, Math.ceil(limit / 3)),
        this.getByLevel("project", { projectId, query }, Math.ceil(limit / 3)),
      );
    }

    const [agentMemories, teamMemories = [], projectMemories = []] =
      await Promise.all(promises);

    return {
      agent: agentMemories,
      team: teamMemories,
      project: projectMemories,
    };
  }
}
