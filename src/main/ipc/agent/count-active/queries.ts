import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function getActiveAgentsCount(ownerId: string): Promise<number> {
  const db = getDatabase();
  
  const result = await db
    .select({ count: agentsTable.id })
    .from(agentsTable)
    .where(
      and(
        eq(agentsTable.ownerId, ownerId),
        eq(agentsTable.isActive, true),
        eq(agentsTable.status, "active"),
      ),
    );

  return result.length;
}