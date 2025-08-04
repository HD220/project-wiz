import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent,
  type UpdateAgent
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function updateAgent(data: UpdateAgent): Promise<SelectAgent> {
  const db = getDatabase();
  
  const { id, ...updateData } = data;
  
  const [updatedAgent] = await db
    .update(agentsTable)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(and(eq(agentsTable.id, id), eq(agentsTable.isActive, true)))
    .returning();

  if (!updatedAgent) {
    throw new Error("Agent not found, inactive, or update failed");
  }

  return updatedAgent;
}