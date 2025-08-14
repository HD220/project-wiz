import { createAgent } from "@/main/ipc/agent/queries";
import { requireAuth } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { AgentSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

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
      providerId: input.providerId,
    });

    const currentUser = requireAuth();

    let parsedModelConfig;
    try {
      parsedModelConfig = JSON.parse(input.modelConfig);
    } catch (_error) {
      throw new Error("Invalid modelConfig JSON format");
    }

    const dbAgent = await createAgent({
      ...input,
      modelConfig: JSON.stringify(parsedModelConfig),
      ownerId: currentUser.id,
    });

    const apiAgent = {
      // Identity fields (users)
      id: dbAgent.id,
      name: dbAgent.name,
      avatar: dbAgent.avatar,
      type: dbAgent.type,
      status: dbAgent.status,

      // State management (users)
      deactivatedAt: dbAgent.deactivatedAt
        ? new Date(dbAgent.deactivatedAt)
        : null,

      // Timestamps (users)
      createdAt: new Date(dbAgent.createdAt),
      updatedAt: new Date(dbAgent.updatedAt),

      // Agent-specific fields (agents)
      ownerId: dbAgent.ownerId,
      role: dbAgent.role,
      backstory: dbAgent.backstory,
      goal: dbAgent.goal,
      providerId: dbAgent.providerId,
      modelConfig: JSON.parse(dbAgent.modelConfig),
    };

    eventBus.emit("agent:created", { agentId: apiAgent.id });

    logger.debug("Agent created", {
      agentId: apiAgent.id,
      agentName: apiAgent.name,
      role: apiAgent.role,
      ownerId: apiAgent.ownerId,
    });

    return apiAgent;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      create: InferHandler<typeof handler>;
    }
  }
}
