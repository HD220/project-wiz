import { and, eq, lt, sql } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";

import {
  agentMemoriesTable,
  memoryRelationsTable,
} from "./agent-memories.schema";

export interface MemoryMaintenanceConfig {
  maxMemoriesPerAgent: number;
  autoArchiveDays: number;
  minImportanceThreshold: number;
  pruneFrequencyDays: number;
  enableAutoLearning: boolean;
}

export interface MemoryStatistics {
  totalMemories: number;
  activeMemories: number;
  archivedMemories: number;
  memoryByType: Record<string, number>;
  memoryByImportance: Record<string, number>;
  avgImportanceScore: number;
  oldestMemory: Date | null;
  newestMemory: Date | null;
}

export class MemoryMaintenanceService {
  private static readonly DEFAULT_CONFIG: MemoryMaintenanceConfig = {
    maxMemoriesPerAgent: 1000,
    autoArchiveDays: 90,
    minImportanceThreshold: 0.3,
    pruneFrequencyDays: 7,
    enableAutoLearning: true,
  };

  /**
   * Perform comprehensive memory maintenance for an agent
   */
  static async performMaintenance(
    agentId: string,
    config: Partial<MemoryMaintenanceConfig> = {},
  ): Promise<{
    archived: number;
    deleted: number;
    strengthened: number;
    weakened: number;
  }> {
    const maintenanceConfig = { ...this.DEFAULT_CONFIG, ...config };

    let archived = 0;
    let deleted = 0;
    let strengthened = 0;
    let weakened = 0;

    // 1. Archive old, low-importance memories
    archived = await this.archiveOldMemories(
      agentId,
      maintenanceConfig.autoArchiveDays,
      maintenanceConfig.minImportanceThreshold,
    );

    // 2. Delete permanently archived memories older than threshold
    deleted = await this.deleteOldArchivedMemories(
      agentId,
      maintenanceConfig.autoArchiveDays * 2,
    );

    // 3. Update importance scores based on access patterns
    const scoreUpdates = await this.updateImportanceScores(agentId);
    strengthened = scoreUpdates.strengthened;
    weakened = scoreUpdates.weakened;

    // 4. Enforce memory limits per agent
    if (maintenanceConfig.maxMemoriesPerAgent > 0) {
      const limitDeleted = await this.enforceMemoryLimits(
        agentId,
        maintenanceConfig.maxMemoriesPerAgent,
      );
      deleted += limitDeleted;
    }

    // 5. Clean up orphaned memory relations
    await this.cleanupOrphanedRelations();

    return { archived, deleted, strengthened, weakened };
  }

  /**
   * Archive old memories based on age and importance
   */
  static async archiveOldMemories(
    agentId: string,
    daysOld: number,
    minImportanceScore: number,
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
          lt(agentMemoriesTable.createdAt, cutoffDate),
          sql`${agentMemoriesTable.importanceScore} < ${minImportanceScore}`,
          // Don't archive critical or high importance memories regardless of age
          sql`${agentMemoriesTable.importance} NOT IN ('critical', 'high')`,
        ),
      );

    return result.changes || 0;
  }

  /**
   * Delete permanently archived memories that are very old
   */
  static async deleteOldArchivedMemories(
    agentId: string,
    daysOld: number,
  ): Promise<number> {
    const db = getDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Get memories to delete
    const memoriesToDelete = await db
      .select({ id: agentMemoriesTable.id })
      .from(agentMemoriesTable)
      .where(
        and(
          eq(agentMemoriesTable.agentId, agentId),
          eq(agentMemoriesTable.isArchived, true),
          lt(agentMemoriesTable.archivedAt, cutoffDate),
          // Only delete low importance archived memories
          eq(agentMemoriesTable.importance, "low"),
        ),
      );

    if (memoriesToDelete.length === 0) {
      return 0;
    }

    const memoryIds = memoriesToDelete.map((m) => m.id);

    // Delete relations first
    await db
      .delete(memoryRelationsTable)
      .where(
        sql`${memoryRelationsTable.sourceMemoryId} IN (${memoryIds.map((id) => `'${id}'`).join(",")}) OR ${memoryRelationsTable.targetMemoryId} IN (${memoryIds.map((id) => `'${id}'`).join(",")})`,
      );

    // Delete memories
    const result = await db
      .delete(agentMemoriesTable)
      .where(
        sql`${agentMemoriesTable.id} IN (${memoryIds.map((id) => `'${id}'`).join(",")})`,
      );

    return result.changes || 0;
  }

  /**
   * Update importance scores based on access patterns and recency
   */
  static async updateImportanceScores(
    agentId: string,
  ): Promise<{ strengthened: number; weakened: number }> {
    const db = getDatabase();

    // Get all non-archived memories for the agent
    const memories = await db
      .select()
      .from(agentMemoriesTable)
      .where(
        and(
          eq(agentMemoriesTable.agentId, agentId),
          eq(agentMemoriesTable.isArchived, false),
        ),
      );

    let strengthened = 0;
    let weakened = 0;

    for (const memory of memories) {
      const currentScore = memory.importanceScore;
      const newScore = this.calculateDynamicImportanceScore(memory);

      if (Math.abs(newScore - currentScore) > 0.05) {
        await db
          .update(agentMemoriesTable)
          .set({
            importanceScore: newScore,
            updatedAt: new Date(),
          })
          .where(eq(agentMemoriesTable.id, memory.id));

        if (newScore > currentScore) {
          strengthened++;
        } else {
          weakened++;
        }
      }
    }

    return { strengthened, weakened };
  }

  /**
   * Enforce maximum memory limits per agent by removing least important old memories
   */
  static async enforceMemoryLimits(
    agentId: string,
    maxMemories: number,
  ): Promise<number> {
    const db = getDatabase();

    // Count current active memories
    const [countResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(agentMemoriesTable)
      .where(
        and(
          eq(agentMemoriesTable.agentId, agentId),
          eq(agentMemoriesTable.isArchived, false),
        ),
      );

    const currentCount = countResult?.count || 0;
    if (currentCount <= maxMemories) {
      return 0;
    }

    const toDelete = currentCount - maxMemories;

    // Get least important, oldest memories to delete
    const memoriesToDelete = await db
      .select({ id: agentMemoriesTable.id })
      .from(agentMemoriesTable)
      .where(
        and(
          eq(agentMemoriesTable.agentId, agentId),
          eq(agentMemoriesTable.isArchived, false),
          // Don't delete critical memories
          sql`${agentMemoriesTable.importance} != 'critical'`,
        ),
      )
      .orderBy(
        agentMemoriesTable.importanceScore,
        agentMemoriesTable.lastAccessedAt,
        agentMemoriesTable.createdAt,
      )
      .limit(toDelete);

    if (memoriesToDelete.length === 0) {
      return 0;
    }

    // Archive these memories instead of deleting them
    const memoryIds = memoriesToDelete.map((m) => m.id);
    const result = await db
      .update(agentMemoriesTable)
      .set({
        isArchived: true,
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        sql`${agentMemoriesTable.id} IN (${memoryIds.map((id) => `'${id}'`).join(",")})`,
      );

    return result.changes || 0;
  }

  /**
   * Clean up orphaned memory relations
   */
  static async cleanupOrphanedRelations(): Promise<number> {
    const db = getDatabase();

    const result = await db.delete(memoryRelationsTable).where(
      sql`NOT EXISTS (
          SELECT 1 FROM ${agentMemoriesTable} 
          WHERE ${agentMemoriesTable.id} = ${memoryRelationsTable.sourceMemoryId}
        ) OR NOT EXISTS (
          SELECT 1 FROM ${agentMemoriesTable} 
          WHERE ${agentMemoriesTable.id} = ${memoryRelationsTable.targetMemoryId}
        )`,
    );

    return result.changes || 0;
  }

  /**
   * Get memory statistics for an agent
   */
  static async getMemoryStatistics(agentId: string): Promise<MemoryStatistics> {
    const db = getDatabase();

    // Get basic counts
    const [totalResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(agentMemoriesTable)
      .where(eq(agentMemoriesTable.agentId, agentId));

    const [activeResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(agentMemoriesTable)
      .where(
        and(
          eq(agentMemoriesTable.agentId, agentId),
          eq(agentMemoriesTable.isArchived, false),
        ),
      );

    const [archivedResult] = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(agentMemoriesTable)
      .where(
        and(
          eq(agentMemoriesTable.agentId, agentId),
          eq(agentMemoriesTable.isArchived, true),
        ),
      );

    // Get type distribution
    const typeDistribution = await db
      .select({
        type: agentMemoriesTable.type,
        count: sql<number>`COUNT(*)`,
      })
      .from(agentMemoriesTable)
      .where(eq(agentMemoriesTable.agentId, agentId))
      .groupBy(agentMemoriesTable.type);

    // Get importance distribution
    const importanceDistribution = await db
      .select({
        importance: agentMemoriesTable.importance,
        count: sql<number>`COUNT(*)`,
      })
      .from(agentMemoriesTable)
      .where(eq(agentMemoriesTable.agentId, agentId))
      .groupBy(agentMemoriesTable.importance);

    // Get average importance score
    const [avgResult] = await db
      .select({ avg: sql<number>`AVG(${agentMemoriesTable.importanceScore})` })
      .from(agentMemoriesTable)
      .where(eq(agentMemoriesTable.agentId, agentId));

    // Get date range
    const [dateRange] = await db
      .select({
        oldest: sql<Date>`MIN(${agentMemoriesTable.createdAt})`,
        newest: sql<Date>`MAX(${agentMemoriesTable.createdAt})`,
      })
      .from(agentMemoriesTable)
      .where(eq(agentMemoriesTable.agentId, agentId));

    return {
      totalMemories: totalResult?.count || 0,
      activeMemories: activeResult?.count || 0,
      archivedMemories: archivedResult?.count || 0,
      memoryByType: Object.fromEntries(
        typeDistribution.map((item) => [item.type, item.count]),
      ),
      memoryByImportance: Object.fromEntries(
        importanceDistribution.map((item) => [item.importance, item.count]),
      ),
      avgImportanceScore: avgResult?.avg || 0,
      oldestMemory: dateRange?.oldest || null,
      newestMemory: dateRange?.newest || null,
    };
  }

  /**
   * Calculate dynamic importance score based on usage patterns
   */
  private static calculateDynamicImportanceScore(memory: any): number {
    let baseScore = memory.importanceScore;

    // Boost based on access frequency
    if (memory.accessCount > 0) {
      const accessBoost = Math.min(memory.accessCount * 0.05, 0.3);
      baseScore += accessBoost;
    }

    // Reduce score based on age (unless it's critical or high importance)
    if (memory.importance !== "critical" && memory.importance !== "high") {
      const daysSinceCreation =
        (Date.now() - new Date(memory.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);
      const ageReduction = Math.min(daysSinceCreation * 0.001, 0.2);
      baseScore -= ageReduction;
    }

    // Boost recently accessed memories
    if (memory.lastAccessedAt) {
      const daysSinceAccess =
        (Date.now() - new Date(memory.lastAccessedAt).getTime()) /
        (1000 * 60 * 60 * 24);
      if (daysSinceAccess < 7) {
        baseScore += 0.1;
      }
    }

    return Math.max(0, Math.min(1, baseScore));
  }

  /**
   * Run automated maintenance for all agents
   */
  static async runAutomatedMaintenance(
    config: Partial<MemoryMaintenanceConfig> = {},
  ): Promise<
    Record<
      string,
      {
        archived: number;
        deleted: number;
        strengthened: number;
        weakened: number;
      }
    >
  > {
    const db = getDatabase();

    // Get all unique agent IDs
    const agents = await db
      .selectDistinct({ agentId: agentMemoriesTable.agentId })
      .from(agentMemoriesTable);

    const results: Record<string, any> = {};

    for (const { agentId } of agents) {
      try {
        results[agentId] = await this.performMaintenance(agentId, config);
      } catch (error) {
        console.error(
          `Failed to perform maintenance for agent ${agentId}:`,
          error,
        );
        results[agentId] = {
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    return results;
  }
}
