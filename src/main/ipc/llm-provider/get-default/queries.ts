import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  llmProvidersTable, 
  type SelectLlmProvider 
} from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const GetDefaultProviderInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

// Output validation schema
export const GetDefaultProviderOutputSchema = z.object({
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

export type GetDefaultProviderInput = z.infer<typeof GetDefaultProviderInputSchema>;
export type GetDefaultProviderOutput = z.infer<typeof GetDefaultProviderOutputSchema>;

export async function getDefaultProvider(input: GetDefaultProviderInput): Promise<GetDefaultProviderOutput> {
  const db = getDatabase();
  
  const validatedInput = GetDefaultProviderInputSchema.parse(input);
  
  const [provider] = await db
    .select()
    .from(llmProvidersTable)
    .where(
      and(
        eq(llmProvidersTable.userId, validatedInput.userId),
        eq(llmProvidersTable.isDefault, true),
        eq(llmProvidersTable.isActive, true),
      ),
    )
    .limit(1);

  if (!provider) {
    return null;
  }

  return GetDefaultProviderOutputSchema.parse(provider);
}