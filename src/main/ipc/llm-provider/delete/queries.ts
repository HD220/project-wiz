import { eq } from "drizzle-orm";

import { agentsTable } from "@/main/database/schemas/agent.schema";
import { llmProvidersTable } from "@/main/database/schemas/llm-provider.schema";

import { createDatabaseConnection } from "@/shared/database/config";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function deleteLlmProvider(
  id: string,
  _deletedBy: string,
): Promise<boolean> {
  const db = getDatabase();

  // Primeiro verificar se algum agent está usando este provider
  const [agentUsingProvider] = await db
    .select({ id: agentsTable.id })
    .from(agentsTable)
    .where(eq(agentsTable.providerId, id))
    .limit(1);

  if (agentUsingProvider) {
    throw new Error(
      "Cannot delete provider: It is currently being used by one or more agents. Please delete or reassign the agents first.",
    );
  }

  const result = await db
    .delete(llmProvidersTable)
    .where(eq(llmProvidersTable.id, id));

  if (result.changes === 0) {
    throw new Error("Provider not found");
  }

  return true;
}
