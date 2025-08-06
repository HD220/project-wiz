import { z } from "zod";
import { findAgent, updateAgent, findUser } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("agent.update.invoke");

// Input schema - apenas campos de negócio
const UpdateAgentInputSchema = AgentSchema.pick({
  id: true,
  name: true,
  role: true,
  backstory: true,
  goal: true,
  providerId: true,
  modelConfig: true,
  status: true,
  avatar: true
}).partial().extend({
  id: z.string() // id is required for update
});

// Output schema
const UpdateAgentOutputSchema = AgentSchema;

type UpdateAgentInput = z.infer<typeof UpdateAgentInputSchema>;
type UpdateAgentOutput = z.infer<typeof UpdateAgentOutputSchema>;

export default async function(input: UpdateAgentInput): Promise<UpdateAgentOutput> {
  logger.debug("Updating agent", { agentId: input.id });

  // 1. Validate input
  const validatedInput = UpdateAgentInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Validar se existe e se o user tem autorização
  const existingAgent = await findAgent(validatedInput.id, currentUser.id);

  if (!existingAgent) {
    throw new Error("Agent not found for current user session");
  }
  
  // 4. Atualizar o agent (sem avatar que está na tabela users)
  const dbAgent = await updateAgent({
    id: validatedInput.id,
    ownerId: existingAgent.ownerId,
    name: validatedInput.name,
    role: validatedInput.role,
    backstory: validatedInput.backstory,
    goal: validatedInput.goal,
    providerId: validatedInput.providerId,
    modelConfig: validatedInput.modelConfig ? JSON.stringify(validatedInput.modelConfig) : undefined,
    status: validatedInput.status,
  });
  
  if (!dbAgent) {
    throw new Error("Failed to update agent");
  }

  // 5. Buscar avatar do user
  const user = await findUser(dbAgent.id);

  // 6. Mapeamento: SelectAgent → Agent (sem campos técnicos)
  const apiAgent = {
    id: dbAgent.id,
    ownerId: dbAgent.ownerId,
    name: dbAgent.name,
    role: dbAgent.role,
    backstory: dbAgent.backstory,
    goal: dbAgent.goal,
    providerId: dbAgent.providerId,
    modelConfig: JSON.parse(dbAgent.modelConfig),
    status: dbAgent.status,
    avatar: user?.avatar || null,
    createdAt: new Date(dbAgent.createdAt),
    updatedAt: new Date(dbAgent.updatedAt),
  };
  
  // 5. Validate output
  const result = UpdateAgentOutputSchema.parse(apiAgent);
  
  logger.debug("Agent updated", { 
    agentId: result.id, 
    agentName: result.name,
    status: result.status
  });
  
  // 6. Emit specific event for update
  eventBus.emit("agent:updated", { agentId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      update: (input: UpdateAgentInput) => Promise<UpdateAgentOutput>
    }
  }
}