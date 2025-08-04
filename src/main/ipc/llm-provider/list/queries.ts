import { z } from "zod";
import { eq, and, desc, like } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  llmProvidersTable, 
  type SelectLlmProvider 
} from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema baseado em ProviderFilters
export const ListLlmProvidersInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]).optional(),
  search: z.string().optional(),
  showInactive: z.boolean().optional().default(false),
});

// Output validation schema (com API key mascarada)
export const ListLlmProvidersOutputSchema = z.array(z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string(), // Será mascarada como "••••••••"
  baseUrl: z.string().nullable(),
  defaultModel: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
}));

export type ListLlmProvidersInput = z.infer<typeof ListLlmProvidersInputSchema>;
export type ListLlmProvidersOutput = z.infer<typeof ListLlmProvidersOutputSchema>;

export async function listLlmProviders(input: ListLlmProvidersInput): Promise<ListLlmProvidersOutput> {
  const db = getDatabase();
  
  const validatedInput = ListLlmProvidersInputSchema.parse(input);
  
  // Build where conditions inline (seguindo padrões INLINE-FIRST)
  const conditions = [eq(llmProvidersTable.userId, validatedInput.userId)];

  // Apply active/inactive filter inline
  if (!validatedInput.showInactive) {
    conditions.push(eq(llmProvidersTable.isActive, true));
  }

  // Apply type filter inline
  if (validatedInput.type) {
    conditions.push(eq(llmProvidersTable.type, validatedInput.type));
  }

  // Apply search filter inline
  if (validatedInput.search && validatedInput.search.trim()) {
    const searchTerm = `%${validatedInput.search.trim()}%`;
    conditions.push(like(llmProvidersTable.name, searchTerm));
  }

  const providers = await db
    .select()
    .from(llmProvidersTable)
    .where(and(...conditions))
    .orderBy(desc(llmProvidersTable.createdAt));

  // Sanitizar API keys para display (mascarar chaves)
  const sanitizedProviders = providers.map((provider) => ({
    ...provider,
    apiKey: "••••••••", // Mascarar API key para UI
  }));

  return ListLlmProvidersOutputSchema.parse(sanitizedProviders);
}