import { z } from "zod";
import { getUserStats } from "./queries";
import { requireAuth } from "@/main/utils/session-registry";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("user.get-user-stats.invoke");

const Input = z.string().min(1);
const Output = z.object({
  ownedAgents: z.object({
    active: z.number(),
    inactive: z.number()
  }),
  ownedProjects: z.object({
    active: z.number(), 
    inactive: z.number()
  }),
  activeSessions: z.number(),
  dmParticipations: z.object({
    active: z.number(),
    inactive: z.number()
  })
});

export default async function(userId: z.infer<typeof Input>): Promise<z.infer<typeof Output>> {
  logger.debug("Getting user stats", { userId });

  // 1. Validate input
  const validatedInput = Input.parse(userId);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute core business logic
  const result = await getUserStats(validatedInput);
  
  // 4. Validate output
  const validatedOutput = Output.parse(result);
  
  logger.debug("User stats retrieved", { 
    userId, 
    ownedAgentsActive: validatedOutput.ownedAgents.active,
    ownedProjectsActive: validatedOutput.ownedProjects.active,
    activeSessions: validatedOutput.activeSessions
  });
  
  // 5. No event emission for stats retrieval (it's just a query)
  
  return validatedOutput;
}

declare global {
  namespace WindowAPI {
    interface User {
      getUserStats: (userId: z.infer<typeof Input>) => Promise<z.infer<typeof Output>>
    }
  }
}