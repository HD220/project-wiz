import { z } from "zod";
import { findAgent, updateAgent } from "@/main/ipc/agent/queries";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("agent.delete.invoke");

// Input schema - apenas ID do agent
const DeleteAgentInputSchema = z.object({
  id: z.string(),
});

// Output schema - resultado da operação
const DeleteAgentOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

type DeleteAgentInput = z.infer<typeof DeleteAgentInputSchema>;
type DeleteAgentOutput = z.infer<typeof DeleteAgentOutputSchema>;

export default async function(input: DeleteAgentInput): Promise<DeleteAgentOutput> {
  logger.debug("Deleting agent");

  // 1. Validate input
  const validatedInput = DeleteAgentInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Validar se existe e se o user tem autorização
  const agentToDeactivate = await findAgent(validatedInput.id, currentUser.id);

  if (!agentToDeactivate) {
    throw new Error("Agent not found for current user session");
  }

  // 4. Atualizar o agent para inativo
  await updateAgent({
    id: agentToDeactivate.id,
    ownerId: agentToDeactivate.ownerId,
    isActive: false,
    deactivatedAt: new Date(),
    deactivatedBy: currentUser.id,
  });
  
  // 5. Validate output
  const result = DeleteAgentOutputSchema.parse({
    success: true,
    message: "Agent deactivated successfully"
  });
  
  // 5. Emit event
  eventBus.emit("agent:deleted", { agentId: validatedInput.id });
  
  logger.debug("Agent deleted", { success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      delete: (input: DeleteAgentInput) => Promise<DeleteAgentOutput>
    }
  }
}