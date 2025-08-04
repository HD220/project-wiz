import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  llmProvidersTable 
} from "@/main/database/schemas/llm-provider.schema";
import { agentsTable } from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const DeleteLlmProviderInputSchema = z.string().min(1, "Provider ID is required");

// Output validation schema
export const DeleteLlmProviderOutputSchema = z.object({
  message: z.string(),
});

export type DeleteLlmProviderInput = z.infer<typeof DeleteLlmProviderInputSchema>;
export type DeleteLlmProviderOutput = z.infer<typeof DeleteLlmProviderOutputSchema>;

export async function deleteLlmProvider(id: DeleteLlmProviderInput): Promise<DeleteLlmProviderOutput> {
  const db = getDatabase();
  
  const validatedId = DeleteLlmProviderInputSchema.parse(id);
  
  // Primeiro verificar se algum agent está usando este provider
  const [agentUsingProvider] = await db
    .select({ id: agentsTable.id })
    .from(agentsTable)
    .where(eq(agentsTable.providerId, validatedId))
    .limit(1);

  if (agentUsingProvider) {
    throw new Error(
      "Cannot delete provider: It is currently being used by one or more agents. Please delete or reassign the agents first.",
    );
  }

  const result = await db
    .delete(llmProvidersTable)
    .where(eq(llmProvidersTable.id, validatedId));

  if (result.changes === 0) {
    throw new Error("Provider not found");
  }

  return DeleteLlmProviderOutputSchema.parse({
    message: "Provider deleted successfully"
  });
}