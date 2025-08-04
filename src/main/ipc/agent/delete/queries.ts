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
export async function deleteAgent(id: string, deletedBy: string): Promise<boolean> {
  const db = getDatabase();
  
  // Usar transação síncrona conforme o padrão do AgentService original
  const success = db.transaction((tx) => {
    // 1. Verificar se o agent existe e está ativo
    const agents = tx
      .select()
      .from(agentsTable)
      .where(and(eq(agentsTable.id, id), eq(agentsTable.isActive, true)))
      .limit(1)
      .all();

    const agent = agents[0];
    if (!agent) {
      throw new Error("Agent not found or already inactive");
    }

    // 2. Soft delete do agent
    tx.update(agentsTable)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivatedBy: deletedBy,
        updatedAt: new Date(),
      })
      .where(eq(agentsTable.id, id))
      .run();

    return true;
  });

  return success;
}