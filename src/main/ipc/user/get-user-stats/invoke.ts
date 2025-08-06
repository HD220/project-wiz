import { z } from "zod";
import { getUserStats } from "@/main/ipc/user/queries";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("user.get-user-stats.invoke");

const Input = z.object({
  userId: z.string().min(1, "User ID is required"),
});
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

export default async function(input: z.infer<typeof Input>): Promise<z.infer<typeof Output>> {
  logger.debug("Getting user stats", { userId: input.userId });

  // 1. Validate input
  const validatedInput = Input.parse(input);

  // 2. Check authentication
  requireAuth();
  
  // 3. Execute core business logic
  const result = await getUserStats(validatedInput.userId);
  
  // 4. Validate output
  const validatedOutput = Output.parse(result);
  
  logger.debug("User stats retrieved", { 
    userId: validatedInput.userId, 
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
      getStats: (input: z.infer<typeof Input>) => Promise<z.infer<typeof Output>>
    }
  }
}