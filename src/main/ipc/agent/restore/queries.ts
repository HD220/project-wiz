import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function restoreAgent(id: string): Promise<SelectAgent | null> {
  const db = getDatabase();
  
  const [restored] = await db
    .update(agentsTable)
    .set({
      isActive: true,
      deactivatedAt: null,
      deactivatedBy: null,
      updatedAt: new Date(),
    })
    .where(and(eq(agentsTable.id, id), eq(agentsTable.isActive, false)))
    .returning();

  return restored || null;
}