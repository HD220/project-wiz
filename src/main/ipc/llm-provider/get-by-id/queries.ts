import { eq } from "drizzle-orm";
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
export async function getLlmProviderById(id: string): Promise<SelectLlmProvider | null> {
  const db = getDatabase();
  
  const [provider] = await db
    .select()
    .from(llmProvidersTable)
    .where(eq(llmProvidersTable.id, id))
    .limit(1);

  return provider || null;
}