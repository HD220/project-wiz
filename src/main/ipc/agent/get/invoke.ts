import { z } from "zod";
import { findAgent, findUser } from "@/main/ipc/agent/queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/services/session-registry";
import { getLogger } from "@/shared/services/logger/config";

const logger = getLogger("agent.get.invoke");

// Input schema - apenas ID do agent
const GetAgentInputSchema = z.string().min(1);

// Output schema
const GetAgentOutputSchema = AgentSchema.nullable();

type GetAgentInput = z.infer<typeof GetAgentInputSchema>;
type GetAgentOutput = z.infer<typeof GetAgentOutputSchema>;

export default async function(input: GetAgentInput): Promise<GetAgentOutput> {
  logger.debug("Getting agent");

  // 1. Validate input
  const validatedInput = GetAgentInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();

  // 3. Find agent with ownership validation
  const dbAgent = await findAgent(validatedInput, currentUser.id);
  
  if (!dbAgent) {
    return null;
  }

  // 4. Buscar avatar do user
  const user = await findUser(dbAgent.id);

  // 5. Mapeamento: SelectAgent → Agent (sem campos técnicos)
  const apiAgent = {
    id: dbAgent.id,
    ownerId: dbAgent.ownerId,
    name: dbAgent.name,
    role: dbAgent.role,
    backstory: dbAgent.backstory,
    goal: dbAgent.goal,
    providerId: dbAgent.providerId,
    modelConfig: dbAgent.modelConfig,
    status: dbAgent.status,
    avatar: user?.avatar || null,
    createdAt: new Date(dbAgent.createdAt),
    updatedAt: new Date(dbAgent.updatedAt),
  };
  
  // 4. Validate output
  const result = GetAgentOutputSchema.parse(apiAgent);
  
  logger.debug("Agent get result", { found: result !== null });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      get: (input: GetAgentInput) => Promise<GetAgentOutput>
    }
  }
}