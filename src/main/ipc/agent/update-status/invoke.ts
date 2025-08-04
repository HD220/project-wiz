import { 
  updateAgentStatus,
  type UpdateAgentStatusInput,
  type UpdateAgentStatusOutput 
} from "./queries";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.update-status.invoke");

export default async function(input: UpdateAgentStatusInput): Promise<UpdateAgentStatusOutput> {
  logger.debug("Updating agent status", { agentId: input.id, status: input.status });

  // Execute core business logic
  const result = await updateAgentStatus(input);
  
  // Emit specific event for agent status update
  eventBus.emit("agent:status-updated", { agentId: input.id, status: input.status });
  
  logger.debug("Agent status updated", { agentId: input.id, status: input.status });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      updateStatus: (input: UpdateAgentStatusInput) => Promise<UpdateAgentStatusOutput>
    }
  }
}