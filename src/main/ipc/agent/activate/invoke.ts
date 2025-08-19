import { eq } from "drizzle-orm";
import { z } from "zod";

import { findAgent } from "@/main/ipc/agent/queries";
import { usersTable } from "@/main/schemas/user.schema";
import { requireAuth } from "@/main/services/session-registry";

import { createDatabaseConnection } from "@/shared/config/database";
import { emit } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import { AgentSchema } from "@/shared/types";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.restore.invoke");

const RestoreAgentInputSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
});

const RestoreAgentOutputSchema = AgentSchema;

const handler = createIPCHandler({
  inputSchema: RestoreAgentInputSchema,
  outputSchema: RestoreAgentOutputSchema,
  handler: async (input) => {
    logger.debug("Activating agent", { agentId: input.id });

    const currentUser = requireAuth();

    const agentToActivate = await findAgent(input.id, currentUser.id);

    if (!agentToActivate) {
      throw new Error("Agent not found for current user session");
    }

    const { getDatabase } = createDatabaseConnection(true);
    const db = getDatabase();

    await db
      .update(usersTable)
      .set({
        deactivatedAt: null,
      })
      .where(eq(usersTable.id, agentToActivate.id));

    const dbAgent = await findAgent(input.id, currentUser.id);

    if (!dbAgent) {
      throw new Error("Failed to activate agent");
    }

    // Map to API format (dados completos do JOIN)
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

    emit("event:agents", { action: "activated", key: apiAgent.id });

    logger.debug("Agent activated", { agentId: apiAgent.id });

    return apiAgent;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      activate: InferHandler<typeof handler>;
    }
  }
}
