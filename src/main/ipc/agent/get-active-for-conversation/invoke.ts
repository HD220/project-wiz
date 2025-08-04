import { z } from "zod";
import { getActiveAgentsForConversation } from "./queries";
import { AgentSchema } from "@/shared/types";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.get-active-for-conversation.invoke");

// Input schema
const GetActiveForConversationInputSchema = z.string().min(1);

// Output schema
const GetActiveForConversationOutputSchema = z.array(AgentSchema);

type GetActiveForConversationInput = z.infer<typeof GetActiveForConversationInputSchema>;
type GetActiveForConversationOutput = z.infer<typeof GetActiveForConversationOutputSchema>;

export default async function(input: GetActiveForConversationInput): Promise<GetActiveForConversationOutput> {
  logger.debug("Getting active agents for conversation");

  // 1. Validate input
  const validatedInput = GetActiveForConversationInputSchema.parse(input);

  // 2. Query database
  const dbAgents = await getActiveAgentsForConversation(validatedInput);
  
  // 3. Map to API format (sem campos técnicos)
  const apiAgents = dbAgents.map(agent => ({
    id: agent.id,
    userId: agent.userId,
    ownerId: agent.ownerId,
    name: agent.name,
    role: agent.role,
    backstory: agent.backstory,
    goal: agent.goal,
    systemPrompt: agent.systemPrompt,
    providerId: agent.providerId,
    modelConfig: agent.modelConfig,
    status: agent.status,
    avatar: agent.avatar,
    createdAt: new Date(agent.createdAt),
    updatedAt: new Date(agent.updatedAt),
  }));
  
  // 4. Validate output
  const result = GetActiveForConversationOutputSchema.parse(apiAgents);
  
  logger.debug("Got active agents for conversation", { count: result.length });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      getActiveForConversation: (input: GetActiveForConversationInput) => Promise<GetActiveForConversationOutput>
    }
  }
}