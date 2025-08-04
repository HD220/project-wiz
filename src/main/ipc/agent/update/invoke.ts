import { 
  updateAgent,
  type UpdateAgentInput,
  type UpdateAgentOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.update.invoke");

export default async function(input: UpdateAgentInput): Promise<UpdateAgentOutput> {
  logger.debug("Updating agent", { agentId: input.id });

  // 1. Check authentication (replicando a lógica do handler original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await updateAgent(input);
  
  // 3. Emit specific event for agent update
  eventBus.emit("agent:updated", { agentId: result.id });
  
  logger.debug("Agent updated", { agentId: result.id, agentName: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      update: (input: UpdateAgentInput) => Promise<UpdateAgentOutput>
    }
  }
}