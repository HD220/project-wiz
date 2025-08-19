import { z } from "zod";

import { createAgent } from "@/main/ipc/agent/queries";
import { requireAuth } from "@/main/services/session-registry";

import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { AgentSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.create.invoke");

// SIMPLIFIED: modelConfig as object, not string
const CreateAgentInputSchema = z.object({
  name: z.string(),
  role: z.string(),
  backstory: z.string(),
  goal: z.string(),
  providerId: z.string(),
  modelConfig: z.object({
    model: z.string(),
    temperature: z.number(),
    maxTokens: z.number(),
    topP: z.number().optional(),
  }),
  avatar: z.string().optional(),
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

    // SIMPLIFIED: Convert object to JSON string only for database storage
    const dbAgent = await createAgent({
      ...input,
      modelConfig: JSON.stringify(input.modelConfig), // Object → String for DB
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
      modelConfig: dbAgent.modelConfig, // Object from transformToAgent() - perfect!
    };

    emit("event:agents", {
      action: "created",
      key: apiAgent.id,
      providerId: apiAgent.providerId,
    });

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
