import { z } from "zod";
import { getAgentWithProvider } from "./queries";
import { AgentSchema, LlmProviderSchema } from "@/shared/types";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.get-with-provider.invoke");

// Input schema
const GetAgentWithProviderInputSchema = z.string().min(1);

// Output schema
const GetAgentWithProviderOutputSchema = AgentSchema.extend({
  provider: LlmProviderSchema,
}).nullable();

type GetAgentWithProviderInput = z.infer<typeof GetAgentWithProviderInputSchema>;
type GetAgentWithProviderOutput = z.infer<typeof GetAgentWithProviderOutputSchema>;

export default async function(id: GetAgentWithProviderInput): Promise<GetAgentWithProviderOutput> {
  logger.debug("Getting agent with provider", { agentId: id });

  // 1. Validate input
  const validatedId = GetAgentWithProviderInputSchema.parse(id);

  // 2. Query database
  const dbResult = await getAgentWithProvider(validatedId);
  
  if (!dbResult) {
    logger.debug("Agent with provider not found", { agentId: id });
    return null;
  }
  
  // 3. Mapeamento: SelectAgent & { provider: SelectLlmProvider } → Agent & { provider: LlmProvider }
  const apiResult = {
    id: dbResult.id,
    userId: dbResult.userId,
    name: dbResult.name,
    role: dbResult.role,
    backstory: dbResult.backstory,
    goal: dbResult.goal,
    providerId: dbResult.providerId,
    modelConfig: JSON.parse(dbResult.modelConfig),
    status: dbResult.status,
    avatar: dbResult.avatar,
    createdAt: new Date(dbResult.createdAt),
    updatedAt: new Date(dbResult.updatedAt),
    provider: {
      id: dbResult.provider.id,
      userId: dbResult.provider.userId,
      name: dbResult.provider.name,
      type: dbResult.provider.type,
      baseUrl: dbResult.provider.baseUrl,
      defaultModel: dbResult.provider.defaultModel,
      isDefault: dbResult.provider.isDefault,
      createdAt: new Date(dbResult.provider.createdAt),
      updatedAt: new Date(dbResult.provider.updatedAt),
    },
  };
  
  // 4. Validate output
  const result = GetAgentWithProviderOutputSchema.parse(apiResult);
  
  logger.debug("Agent with provider found", { agentId: apiResult.id, agentName: apiResult.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      getWithProvider: (id: GetAgentWithProviderInput) => Promise<GetAgentWithProviderOutput>
    }
  }
}