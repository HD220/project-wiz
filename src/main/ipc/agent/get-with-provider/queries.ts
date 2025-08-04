import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent 
} from "@/main/database/schemas/agent.schema";
import { llmProvidersTable, type SelectLlmProvider } from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function getAgentWithProvider(id: string): Promise<SelectAgent & { provider: SelectLlmProvider } | null> {
  const db = getDatabase();
  
  const [result] = await db
    .select()
    .from(agentsTable)
    .innerJoin(
      llmProvidersTable,
      eq(agentsTable.providerId, llmProvidersTable.id),
    )
    .where(
      and(
        eq(agentsTable.id, id),
        eq(agentsTable.isActive, true),
        eq(llmProvidersTable.isActive, true),
      ),
    )
    .limit(1);

  if (!result) {
    return null;
  }

  return {
    ...result.agents,
    provider: result.llm_providers,
  };
}