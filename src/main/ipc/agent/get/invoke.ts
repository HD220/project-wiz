import { 
  getAgent,
  type GetAgentInput,
  type GetAgentOutput 
} from "./queries";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.get.invoke");

export default async function(input: GetAgentInput): Promise<GetAgentOutput> {
  logger.debug("Getting agent by ID", { agentId: input.id });

  // Execute core business logic
  const result = await getAgent(input);
  
  if (!result) {
    logger.debug("Agent not found", { agentId: input.id });
    throw new Error("Agent not found or inactive");
  }
  
  logger.debug("Agent found", { agentId: result.id, agentName: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      get: (input: GetAgentInput) => Promise<GetAgentOutput>
    }
  }
}