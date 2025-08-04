import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  llmProvidersTable 
} from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const SetDefaultProviderInputSchema = z.object({
  providerId: z.string().min(1, "Provider ID is required"),
  userId: z.string().min(1, "User ID is required"),
});

// Output validation schema
export const SetDefaultProviderOutputSchema = z.object({
  message: z.string(),
});

export type SetDefaultProviderInput = z.infer<typeof SetDefaultProviderInputSchema>;
export type SetDefaultProviderOutput = z.infer<typeof SetDefaultProviderOutputSchema>;

export async function setDefaultProvider(input: SetDefaultProviderInput): Promise<SetDefaultProviderOutput> {
  const db = getDatabase();
  
  const validatedInput = SetDefaultProviderInputSchema.parse(input);
  
  // Primeiro, remover padrão de todos os outros providers deste usuário
  await db
    .update(llmProvidersTable)
    .set({ isDefault: false })
    .where(eq(llmProvidersTable.userId, validatedInput.userId));

  // Então definir este provider como padrão
  const result = await db
    .update(llmProvidersTable)
    .set({ isDefault: true })
    .where(eq(llmProvidersTable.id, validatedInput.providerId));

  if (result.changes === 0) {
    throw new Error("Provider not found");
  }

  return SetDefaultProviderOutputSchema.parse({
    message: "Provider set as default"
  });
}