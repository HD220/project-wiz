import { 
  getAgentWithProvider,
  type GetAgentWithProviderInput,
  type GetAgentWithProviderOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.get-with-provider.invoke");

export default async function(id: GetAgentWithProviderInput): Promise<GetAgentWithProviderOutput> {
  logger.debug("Getting agent with provider", { agentId: id });

  // Execute core business logic
  const result = await getAgentWithProvider(id);
  
  if (!result) {
    logger.debug("Agent with provider not found", { agentId: id });
    throw new Error("Agent not found or inactive");
  }
  
  logger.debug("Agent with provider found", { agentId: result.id, agentName: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      getWithProvider: (id: GetAgentWithProviderInput) => Promise<GetAgentWithProviderOutput>
    }
  }
}