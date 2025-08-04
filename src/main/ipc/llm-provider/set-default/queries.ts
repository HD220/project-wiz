import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  llmProvidersTable 
} from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function setDefaultProvider(input: { providerId: string; userId: string }): Promise<{ message: string }> {
  const db = getDatabase();
  
  // Primeiro, remover padrão de todos os outros providers deste usuário
  await db
    .update(llmProvidersTable)
    .set({ isDefault: false })
    .where(eq(llmProvidersTable.userId, input.userId));

  // Então definir este provider como padrão
  const result = await db
    .update(llmProvidersTable)
    .set({ isDefault: true })
    .where(eq(llmProvidersTable.id, input.providerId));

  if (result.changes === 0) {
    throw new Error("Provider not found");
  }

  return {
    message: "Provider set as default"
  };
}