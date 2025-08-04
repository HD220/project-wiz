import { 
  createAgent,
  type CreateAgentInput,
  type CreateAgentOutput 
} from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.create.invoke");

// Input type para o invoke (sem ownerId que é adicionado automaticamente)
export type CreateAgentInvokeInput = Omit<CreateAgentInput, "ownerId">;

export default async function(params: CreateAgentInvokeInput): Promise<CreateAgentOutput> {
  logger.debug("Creating agent", { agentName: params.name });

  // 1. Check authentication (replicando a lógica do handler original)
  const currentUser = requireAuth();
  
  // 2. Add ownerId from current user
  const agentData = {
    ...params,
    ownerId: currentUser.id
  };
  
  // 3. Execute core business logic
  const result = await createAgent(agentData);
  
  // 4. Emit specific event for agent creation
  eventBus.emit("agent:created", { agentId: result.id });
  
  logger.debug("Agent created", { agentId: result.id, agentName: result.name });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      create: (params: CreateAgentInvokeInput) => Promise<CreateAgentOutput>
    }
  }
}