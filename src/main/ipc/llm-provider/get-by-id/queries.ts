import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  llmProvidersTable, 
  type SelectLlmProvider 
} from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const GetLlmProviderByIdInputSchema = z.string().min(1, "Provider ID is required");

// Output validation schema baseado em SelectLlmProvider
export const GetLlmProviderByIdOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: z.enum(["openai", "deepseek", "anthropic", "google", "custom"]),
  apiKey: z.string(),
  baseUrl: z.string().nullable(),
  defaultModel: z.string(),
  isDefault: z.boolean(),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
}).nullable();

export type GetLlmProviderByIdInput = z.infer<typeof GetLlmProviderByIdInputSchema>;
export type GetLlmProviderByIdOutput = z.infer<typeof GetLlmProviderByIdOutputSchema>;

export async function getLlmProviderById(id: GetLlmProviderByIdInput): Promise<GetLlmProviderByIdOutput> {
  const db = getDatabase();
  
  const validatedId = GetLlmProviderByIdInputSchema.parse(id);
  
  const [provider] = await db
    .select()
    .from(llmProvidersTable)
    .where(eq(llmProvidersTable.id, validatedId))
    .limit(1);

  if (!provider) {
    return null;
  }

  return GetLlmProviderByIdOutputSchema.parse(provider);
}