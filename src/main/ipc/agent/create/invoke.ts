import { z } from "zod";
import { createAgent, findUser } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("agent.create.invoke");

const CreateAgentInputSchema = AgentSchema.pick({
  name: true,
  role: true,
  backstory: true,
  goal: true,
  providerId: true,
  modelConfig: true,
  avatar: true,
});

const CreateAgentOutputSchema = AgentSchema;

type CreateAgentInput = z.infer<typeof CreateAgentInputSchema>;
type CreateAgentOutput = z.infer<typeof CreateAgentOutputSchema>;

export default async function(input: CreateAgentInput): Promise<CreateAgentOutput> {
  logger.debug("Creating agent", { 
    agentName: input.name, 
    role: input.role, 
    providerId: input.providerId 
  });

  const validatedInput = CreateAgentInputSchema.parse(input);
  const currentUser = requireAuth();
  
  const dbAgent = await createAgent({
    ...validatedInput,
    ownerId: currentUser.id
  });
  
  // Buscar avatar do user
  const user = await findUser(dbAgent.id);

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
  
  const result = CreateAgentOutputSchema.parse(apiAgent);
  eventBus.emit("agent:created", { agentId: result.id });
  
  logger.debug("Agent created", { 
    agentId: result.id, 
    agentName: result.name, 
    role: result.role, 
    ownerId: result.ownerId 
  });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      create: (input: CreateAgentInput) => Promise<CreateAgentOutput>
    }
  }
}