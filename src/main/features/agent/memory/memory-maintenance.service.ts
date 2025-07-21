import { and, eq, lt, sql } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";

import { agentMemoriesTable } from "@/main/features/agent/memory/agent-memories.schema";

/**
 * Simple memory maintenance service following YAGNI principle.
 * Implements only essential functionality until more is actually needed.
 */
export class MemoryMaintenanceService {
  /**
   * Clean old memories for an agent
   */
  static async cleanOldMemories(
    agentId: string,
    daysOld: number = 90,
  ): Promise<{ deleted: number }> {
    const db = getDatabase();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db
      .delete(agentMemoriesTable)
      .where(
        and(
          eq(agentMemoriesTable.agentId, agentId),
          lt(agentMemoriesTable.createdAt, cutoffDate),
        ),
      );

    return { deleted: result.changes || 0 };
  }

  /**
   * Get basic memory count for an agent
   */
  static async getMemoryCount(agentId: string): Promise<number> {
    const db = getDatabase();

    const [result] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(agentMemoriesTable)
      .where(eq(agentMemoriesTable.agentId, agentId));

    return result?.count || 0;
  }
}
