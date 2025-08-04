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
export async function getAgent(id: string, includeInactive: boolean = false): Promise<SelectAgent | null> {
  const db = getDatabase();
  
  const conditions = [eq(agentsTable.id, id)];

  if (!includeInactive) {
    conditions.push(eq(agentsTable.isActive, true));
  }

  const [agent] = await db
    .select()
    .from(agentsTable)
    .where(and(...conditions))
    .limit(1);

  return agent || null;
}