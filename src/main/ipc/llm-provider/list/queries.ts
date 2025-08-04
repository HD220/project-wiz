import { eq, and, desc, like } from "drizzle-orm";
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
export async function listLlmProviders(data: {
  userId: string;
  type?: "openai" | "deepseek" | "anthropic" | "google" | "custom";
  search?: string;
  showInactive?: boolean;
}): Promise<SelectLlmProvider[]> {
  const db = getDatabase();
  
  const conditions = [eq(llmProvidersTable.userId, data.userId)];

  // Apply active/inactive filter
  if (!data.showInactive) {
    conditions.push(eq(llmProvidersTable.isActive, true));
  }

  // Apply type filter
  if (data.type) {
    conditions.push(eq(llmProvidersTable.type, data.type));
  }

  // Apply search filter
  if (data.search && data.search.trim()) {
    const searchTerm = `%${data.search.trim()}%`;
    conditions.push(like(llmProvidersTable.name, searchTerm));
  }

  const providers = await db
    .select()
    .from(llmProvidersTable)
    .where(and(...conditions))
    .orderBy(desc(llmProvidersTable.createdAt));

  return providers;
}