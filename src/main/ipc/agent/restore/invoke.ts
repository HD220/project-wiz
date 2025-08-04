import { 
  restoreAgent,
  type RestoreAgentInput,
  type RestoreAgentOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.restore.invoke");

export default async function(id: RestoreAgentInput): Promise<RestoreAgentOutput> {
  logger.debug("Restoring agent", { agentId: id });

  // 1. Check authentication (replicando a lógica do handler original)
  const currentUser = requireAuth();
  
  // 2. Execute core business logic
  const result = await restoreAgent(id);
  
  // 3. Emit specific event for agent restore
  eventBus.emit("agent:restored", { agentId: result.agent.id });
  
  logger.debug("Agent restored", { agentId: result.agent.id, agentName: result.agent.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      restore: (id: RestoreAgentInput) => Promise<RestoreAgentOutput>
    }
  }
}