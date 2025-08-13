import { z } from "zod";

import { updateAgent } from "@/main/ipc/agent/queries";
import { requireAuth } from "@/main/services/session-registry";

import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { AgentSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.update.invoke");

const UpdateAgentInputSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  data: AgentSchema.pick({
    name: true,
    role: true,
    backstory: true,
    goal: true,
    providerId: true,
    modelConfig: true,
    deactivatedAt: true,
    avatar: true,
  }).partial(),
});

const UpdateAgentOutputSchema = AgentSchema;

const handler = createIPCHandler({
  inputSchema: UpdateAgentInputSchema,
  outputSchema: UpdateAgentOutputSchema,
  handler: async (input) => {
    logger.debug("Updating agent", { agentId: input.id });

    const currentUser = requireAuth();
    const { id, data } = input;

    const updateData = {
      ...data,
      avatar: data.avatar === null ? undefined : data.avatar,
    };

    if (data.modelConfig !== undefined) {
      try {
        const parsedModelConfig = JSON.parse(data.modelConfig);
        updateData.modelConfig = JSON.stringify(parsedModelConfig);
      } catch (error) {
        throw new Error("Invalid modelConfig JSON format");
      }
    }

    // Update agent using queries function
    const updatedAgent = await updateAgent({
      id,
      ownerId: currentUser.id,
      ...updateData,
    });

    if (!updatedAgent) {
      throw new Error("Failed to update agent or access denied");
    }

    // Convert to API format
    const apiAgent = {
      ...updatedAgent,
      deactivatedAt: updatedAgent.deactivatedAt
        ? new Date(updatedAgent.deactivatedAt)
        : null,
      modelConfig: JSON.parse(updatedAgent.modelConfig),
      createdAt: new Date(updatedAgent.createdAt),
      updatedAt: new Date(updatedAgent.updatedAt),
    };

    logger.debug("Agent updated", {
      agentId: apiAgent.id,
      agentName: apiAgent.name,
      deactivatedAt: apiAgent.deactivatedAt,
    });

    // Emit specific event for update
    eventBus.emit("agent:updated", { agentId: apiAgent.id });

    return apiAgent;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      update: InferHandler<typeof handler>;
    }
  }
}
