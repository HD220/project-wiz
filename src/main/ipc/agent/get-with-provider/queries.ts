import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent 
} from "@/main/database/schemas/agent.schema";
import { llmProvidersTable, type SelectLlmProvider } from "@/main/database/schemas/llm-provider.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const GetAgentWithProviderInputSchema = z.string().min(1, "Agent ID is required");

// Output validation schema
export const GetAgentWithProviderOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  ownerId: z.string(),
  name: z.string(),
  role: z.string(),
  backstory: z.string(),
  goal: z.string(),
  systemPrompt: z.string(),
  providerId: z.string(),
  modelConfig: z.string(),
  status: z.enum(["active", "inactive", "busy"]),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  provider: z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    baseUrl: z.string().nullable(),
    apiKey: z.string(),
    isActive: z.boolean(),
    deactivatedAt: z.number().nullable(),
    deactivatedBy: z.string().nullable(),
    createdAt: z.number(),
    updatedAt: z.number(),
  }),
}).nullable();

export type GetAgentWithProviderInput = z.infer<typeof GetAgentWithProviderInputSchema>;
export type GetAgentWithProviderOutput = z.infer<typeof GetAgentWithProviderOutputSchema>;

export async function getAgentWithProvider(id: GetAgentWithProviderInput): Promise<GetAgentWithProviderOutput> {
  const db = getDatabase();
  
  const validatedId = GetAgentWithProviderInputSchema.parse(id);
  
  const [result] = await db
    .select()
    .from(agentsTable)
    .innerJoin(
      llmProvidersTable,
      eq(agentsTable.providerId, llmProvidersTable.id),
    )
    .where(
      and(
        eq(agentsTable.id, validatedId),
        eq(agentsTable.isActive, true),
        eq(llmProvidersTable.isActive, true),
      ),
    )
    .limit(1);

  if (!result) {
    return null;
  }

  const agentWithProvider = {
    ...result.agents,
    provider: result.llm_providers,
  };

  return GetAgentWithProviderOutputSchema.parse(agentWithProvider);
}