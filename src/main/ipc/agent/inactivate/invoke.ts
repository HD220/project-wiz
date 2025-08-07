import { eq } from "drizzle-orm";
import { z } from "zod";

import { findAgent } from "@/main/ipc/agent/queries";
import { usersTable } from "@/main/schemas/user.schema";
import { requireAuth } from "@/main/services/session-registry";

import { createDatabaseConnection } from "@/shared/config/database";
import { eventBus } from "@/shared/services/events/event-bus";
import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.delete.invoke");

const DeleteAgentInputSchema = z.object({
  id: z.string(),
});

const DeleteAgentOutputSchema = z.void();

const handler = createIPCHandler({
  inputSchema: DeleteAgentInputSchema,
  outputSchema: DeleteAgentOutputSchema,
  handler: async (input) => {
    logger.debug("Deleting agent");

    const currentUser = requireAuth();

    // Validar se existe e se o user tem autorização
    const agentToDeactivate = await findAgent(input.id, currentUser.id);

    if (!agentToDeactivate) {
      throw new Error("Agent not found for current user session");
    }

    // Atualizar user para inativo (soft delete)
    const { getDatabase } = createDatabaseConnection(true);
    const db = getDatabase();

    await db
      .update(usersTable)
      .set({
        deactivatedAt: new Date(),
      })
      .where(eq(usersTable.id, agentToDeactivate.id));

    // Emit event
    eventBus.emit("agent:deleted", { agentId: input.id });

    logger.debug("Agent deleted", { agentId: input.id });

    return undefined;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      inactivate: InferHandler<typeof handler>;
    }
  }
}
