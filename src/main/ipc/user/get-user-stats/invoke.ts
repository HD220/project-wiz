import { z } from "zod";

import { getUserStats } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";

import { getLogger } from "@/shared/services/logger/config";
import {
  createIPCHandler,
  InferHandler,
} from "@/shared/utils/create-ipc-handler";

const logger = getLogger("user.get-user-stats.invoke");

const GetUserStatsInputSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

const GetUserStatsOutputSchema = z.object({
  ownedAgents: z.object({
    active: z.number(),
    inactive: z.number(),
  }),
  ownedProjects: z.object({
    active: z.number(),
    inactive: z.number(),
  }),
  activeSessions: z.number(),
  dmParticipations: z.object({
    active: z.number(),
    inactive: z.number(),
  }),
});

const handler = createIPCHandler({
  inputSchema: GetUserStatsInputSchema,
  outputSchema: GetUserStatsOutputSchema,
  handler: async (input) => {
    logger.debug("Getting user stats", { userId: input.userId });

    requireAuth();

    // Execute core business logic
    const result = await getUserStats(input.userId);

    logger.debug("User stats retrieved", {
      userId: input.userId,
      ownedAgentsActive: result.ownedAgents.active,
      ownedProjectsActive: result.ownedProjects.active,
      activeSessions: result.activeSessions,
    });

    return result;
  },
});

export default handler;

declare global {
  namespace WindowAPI {
    interface User {
      getStats: InferHandler<typeof handler>;
    }
  }
}
