import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  llmProvidersTable, 
  type SelectLlmProvider 
} from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function getDefaultProvider(input: { userId: string }): Promise<SelectLlmProvider | null> {
  const db = getDatabase();
  
  const [provider] = await db
    .select()
    .from(llmProvidersTable)
    .where(
      and(
        eq(llmProvidersTable.userId, input.userId),
        eq(llmProvidersTable.isDefault, true),
        eq(llmProvidersTable.isActive, true),
      ),
    )
    .limit(1);

  if (!provider) {
    return null;
  }

  return provider;
}