import { z } from "zod";

import { updateAgent } from "@/main/ipc/agent/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { AgentSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.update.invoke");

// SIMPLIFIED: modelConfig as object, not string
const UpdateAgentInputSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  data: z.object({
    name: z.string().optional(),
    role: z.string().optional(),
    backstory: z.string().optional(),
    goal: z.string().optional(),
    providerId: z.string().optional(),
    modelConfig: z
      .object({
        model: z.string(),
        temperature: z.number(),
        maxTokens: z.number(),
        topP: z.number().optional(),
      })
      .optional(),
    deactivatedAt: z.date().nullable().optional(),
    avatar: z.string().optional(),
  }),
});

const UpdateAgentOutputSchema = AgentSchema;

const handler = createIPCHandler({
  inputSchema: UpdateAgentInputSchema,
  outputSchema: UpdateAgentOutputSchema,
  handler: async (input) => {
    logger.debug("Updating agent", { agentId: input.id });

    const currentUser = requireAuth();
    const { id, data } = input;

    // SIMPLIFIED: Prepare data for database with proper types
    const updateData: Record<string, unknown> = {
      ...data,
      avatar: data.avatar === null ? undefined : data.avatar,
    };

    // Convert object to JSON string only for database storage
    if (data.modelConfig !== undefined) {
      updateData["modelConfig"] = JSON.stringify(data.modelConfig); // Object → String for DB
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
      modelConfig: updatedAgent.modelConfig, // Object from transformToAgent() - perfect!
      createdAt: new Date(updatedAgent.createdAt),
      updatedAt: new Date(updatedAgent.updatedAt),
    };

    logger.debug("Agent updated", {
      agentId: apiAgent.id,
      agentName: apiAgent.name,
      deactivatedAt: apiAgent.deactivatedAt,
    });

    // Emit specific event for update
    emit("event:agents", { action: "updated", key: apiAgent.id });

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
