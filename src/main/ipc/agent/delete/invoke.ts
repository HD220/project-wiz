import { 
  deleteAgent,
  type DeleteAgentInput,
  type DeleteAgentOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.delete.invoke");

// Input type para o invoke (sem deletedBy que é adicionado automaticamente)
export type DeleteAgentInvokeInput = Omit<DeleteAgentInput, "deletedBy">;

export default async function(input: DeleteAgentInvokeInput): Promise<DeleteAgentOutput> {
  logger.debug("Deleting agent", { agentId: input.id });

  // 1. Check authentication (replicando a lógica do handler original)
  const currentUser = requireAuth();
  
  // 2. Add deletedBy from current user
  const deleteData = {
    ...input,
    deletedBy: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await deleteAgent(deleteData);
  
  // 4. Emit specific event for agent deletion
  eventBus.emit("agent:deleted", { agentId: input.id });
  
  logger.debug("Agent deleted", { agentId: input.id, success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      delete: (input: DeleteAgentInvokeInput) => Promise<DeleteAgentOutput>
    }
  }
}