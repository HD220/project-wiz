import { z } from "zod";

import { getActiveAgentsCount } from "@/main/ipc/agent/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("agent.get-active-count.invoke");

const GetActiveCountInputSchema = z.void();
const GetActiveCountOutputSchema = z.object({
  count: z.number(),
});

const handler = createIPCHandler({
  inputSchema: GetActiveCountInputSchema,
  outputSchema: GetActiveCountOutputSchema,
  handler: async () => {
    logger.debug("Getting active agents count");

    const currentUser = requireAuth();

    const count = await getActiveAgentsCount(currentUser.id);

    logger.debug("Got active agents count", { count });

    return { count };
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface Agent {
      countActive: InferHandler<typeof handler>;
    }
  }
}
