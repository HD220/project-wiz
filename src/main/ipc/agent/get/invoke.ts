import { z } from "zod";
import { getAgent } from "./queries";
import { AgentSchema } from "@/shared/types";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.get.invoke");

// Input schema - campos necessários para busca
const GetAgentInputSchema = z.object({
  id: z.string(),
  includeInactive: z.boolean().default(false),
});

// Output schema
const GetAgentOutputSchema = AgentSchema.nullable();

type GetAgentInput = z.infer<typeof GetAgentInputSchema>;
type GetAgentOutput = z.infer<typeof GetAgentOutputSchema>;

export default async function(input: GetAgentInput): Promise<GetAgentOutput> {
  logger.debug("Getting agent");

  // 1. Validate input
  const validatedInput = GetAgentInputSchema.parse(input);

  // 2. Query recebe dados e gerencia campos técnicos internamente
  const dbAgent = await getAgent(validatedInput.id, validatedInput.includeInactive);
  
  // 3. Mapeamento: SelectAgent → Agent (sem campos técnicos)
  const apiAgent = dbAgent ? {
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
  } : null;
  
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