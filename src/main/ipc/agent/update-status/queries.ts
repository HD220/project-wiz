import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type AgentStatus 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function updateAgentStatus(id: string, status: AgentStatus): Promise<boolean> {
  const db = getDatabase();
  
  const [record] = await db
    .update(agentsTable)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(agentsTable.id, id), eq(agentsTable.isActive, true)))
    .returning();

  return !!record;
}