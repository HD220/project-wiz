import { 
  hardDeleteAgent,
  type HardDeleteAgentInput,
  type HardDeleteAgentOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.hard-delete.invoke");

export default async function(id: HardDeleteAgentInput): Promise<HardDeleteAgentOutput> {
  logger.warn("DEPRECATED: Hard delete agent called", { agentId: id });

  // 1. Check authentication (replicando a lógica do handler original)
  const currentUser = requireAuth();
  
  // 2. Log deprecation warning
  logger.warn("agents:hardDelete is deprecated. Use agents:delete (soft delete) instead.", { agentId: id });
  
  // 3. Execute core business logic
  const result = await hardDeleteAgent(id);
  
  // 4. Emit specific event for agent hard deletion
  eventBus.emit("agent:hard-deleted", { agentId: id });
  
  logger.debug("Agent hard deleted", { agentId: id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      hardDelete: (id: HardDeleteAgentInput) => Promise<HardDeleteAgentOutput>
    }
  }
}