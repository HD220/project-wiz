import { z } from "zod";
import { findAgent, updateAgent, findUser } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("agent.restore.invoke");

// Input schema - object wrapper para consistência
const RestoreAgentInputSchema = z.object({
  agentId: z.string().min(1, "Agent ID is required"),
});

// Output schema
const RestoreAgentOutputSchema = AgentSchema;

type RestoreAgentInput = z.infer<typeof RestoreAgentInputSchema>;
type RestoreAgentOutput = z.infer<typeof RestoreAgentOutputSchema>;

export default async function(input: RestoreAgentInput): Promise<RestoreAgentOutput> {
  logger.debug("Restoring agent", { agentId: input.agentId });

  // 1. Validate input
  const validatedInput = RestoreAgentInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Validar se existe e se o user tem autorização
  const agentToRestore = await findAgent(validatedInput.agentId, currentUser.id);

  if (!agentToRestore) {
    throw new Error("Agent not found for current user session");
  }

  // 4. Atualizar o agent para ativo
  const dbAgent = await updateAgent({
    id: agentToRestore.id,
    ownerId: agentToRestore.ownerId,
    isActive: true,
    deactivatedAt: null,
    deactivatedBy: null,
  });
  
  if (!dbAgent) {
    throw new Error("Failed to update agent");
  }

  // 5. Buscar avatar do user
  const user = await findUser(dbAgent.id);

  // 6. Map to API format (tipo do shared)
  const apiAgent = {
    id: dbAgent.id,
    ownerId: dbAgent.ownerId,
    name: dbAgent.name,
    role: dbAgent.role,
    backstory: dbAgent.backstory,
    goal: dbAgent.goal,
    providerId: dbAgent.providerId,
    modelConfig: dbAgent.modelConfig,
    status: dbAgent.status,
    avatar: user?.avatar || null,
    createdAt: new Date(dbAgent.createdAt),
    updatedAt: new Date(dbAgent.updatedAt),
  };
  
  // 5. Validate output
  const result = RestoreAgentOutputSchema.parse(apiAgent);
  
  // 6. Emit event
  eventBus.emit("agent:restored", { agentId: result.id });
  
  logger.debug("Agent restored", { agentId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      restore: (input: RestoreAgentInput) => Promise<RestoreAgentOutput>
    }
  }
}