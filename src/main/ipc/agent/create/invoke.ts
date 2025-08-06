import { z } from "zod";
import { createAgent, findUser } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { createIPCHandler, InferHandler } from "@/shared/utils/create-ipc-handler";

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

const handler = createIPCHandler({
  inputSchema: CreateAgentInputSchema,
  outputSchema: CreateAgentOutputSchema,
  handler: async (input) => {
    logger.debug("Creating agent", { 
      agentName: input.name, 
      role: input.role, 
      providerId: input.providerId 
    });

    const currentUser = requireAuth();
    
    const dbAgent = await createAgent({
      ...input,
      modelConfig: JSON.stringify(input.modelConfig),
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
      modelConfig: JSON.parse(dbAgent.modelConfig),
      status: dbAgent.status,
      avatar: user?.avatar || null,
      createdAt: new Date(dbAgent.createdAt),
      updatedAt: new Date(dbAgent.updatedAt),
    };
    
    eventBus.emit("agent:created", { agentId: apiAgent.id });
    
    logger.debug("Agent created", { 
      agentId: apiAgent.id, 
      agentName: apiAgent.name, 
      role: apiAgent.role, 
      ownerId: apiAgent.ownerId 
    });
    
    return apiAgent;
  }
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      create: InferHandler<typeof handler>
    }
  }
}