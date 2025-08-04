import { eq, and, desc } from "drizzle-orm";
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
export async function getActiveAgentsForConversation(conversationId: string): Promise<SelectAgent[]> {
  const db = getDatabase();
  
  // Por enquanto, retorna todos os agents ativos (conforme o AgentService original)
  // No futuro, pode ser filtrado por contexto de conversação
  const agents = await db
    .select()
    .from(agentsTable)
    .where(
      and(eq(agentsTable.isActive, true), eq(agentsTable.status, "active")),
    )
    .orderBy(desc(agentsTable.createdAt));

  return agents;
}