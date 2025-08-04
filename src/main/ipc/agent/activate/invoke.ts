import { z } from "zod";
import { restoreAgent } from "./queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.restore.invoke");

// Input schema
const RestoreAgentInputSchema = z.string().min(1);

// Output schema
const RestoreAgentOutputSchema = z.object({
  success: z.boolean(),
  agent: AgentSchema.nullable(),
  message: z.string(),
});

type RestoreAgentInput = z.infer<typeof RestoreAgentInputSchema>;
type RestoreAgentOutput = z.infer<typeof RestoreAgentOutputSchema>;

export default async function(input: RestoreAgentInput): Promise<RestoreAgentOutput> {
  logger.debug("Restoring agent");

  // 1. Validate input
  const validatedInput = RestoreAgentInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Execute database operation
  const dbAgent = await restoreAgent(validatedInput);
  
  if (!dbAgent) {
    const result = RestoreAgentOutputSchema.parse({
      success: false,
      agent: null,
      message: "Agent not found or not in soft deleted state"
    });
    return result;
  }
  
  // 4. Map to API format (sem campos técnicos)
  const apiAgent = {
    id: dbAgent.id,
    userId: dbAgent.userId,
    ownerId: dbAgent.ownerId,
    name: dbAgent.name,
    role: dbAgent.role,
    backstory: dbAgent.backstory,
    goal: dbAgent.goal,
    providerId: dbAgent.providerId,
    modelConfig: dbAgent.modelConfig,
    status: dbAgent.status,
    avatar: dbAgent.avatar,
    createdAt: new Date(dbAgent.createdAt),
    updatedAt: new Date(dbAgent.updatedAt),
  };
  
  // 5. Validate output
  const result = RestoreAgentOutputSchema.parse({
    success: true,
    agent: apiAgent,
    message: "Agent restored successfully"
  });
  
  // 6. Emit event
  eventBus.emit("agent:restored", { agentId: result.agent!.id });
  
  logger.debug("Agent restored", { success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      restore: (input: RestoreAgentInput) => Promise<RestoreAgentOutput>
    }
  }
}