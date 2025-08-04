import { z } from "zod";
import { updateAgent } from "./queries";
import { AgentSchema } from "@/shared/types";
import { requireAuth } from "@/main/utils/session-registry";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.update.invoke");

// Input schema - apenas campos de negócio
const UpdateAgentInputSchema = AgentSchema.pick({
  id: true,
  name: true,
  role: true,
  backstory: true,
  goal: true,
  providerId: true,
  modelConfig: true,
  status: true,
  avatar: true
}).partial().extend({
  id: z.string() // id is required for update
});

// Output schema
const UpdateAgentOutputSchema = AgentSchema;

type UpdateAgentInput = z.infer<typeof UpdateAgentInputSchema>;
type UpdateAgentOutput = z.infer<typeof UpdateAgentOutputSchema>;

export default async function(input: UpdateAgentInput): Promise<UpdateAgentOutput> {
  logger.debug("Updating agent", { agentId: input.id });

  // 1. Validate input
  const validatedInput = UpdateAgentInputSchema.parse(input);

  // 2. Check authentication
  const currentUser = requireAuth();
  
  // 3. Query recebe dados e gerencia campos técnicos internamente
  const dbAgent = await updateAgent({
    id: validatedInput.id,
    ...(validatedInput.name && { name: validatedInput.name }),
    ...(validatedInput.role && { role: validatedInput.role }),
    ...(validatedInput.backstory && { backstory: validatedInput.backstory }),
    ...(validatedInput.goal && { goal: validatedInput.goal }),
    ...(validatedInput.providerId && { providerId: validatedInput.providerId }),
    ...(validatedInput.modelConfig && { modelConfig: validatedInput.modelConfig }),
    ...(validatedInput.status && { status: validatedInput.status }),
    ...(validatedInput.avatar !== undefined && { avatar: validatedInput.avatar })
  });
  
  // 4. Mapeamento: SelectAgent → Agent (sem campos técnicos)
  const apiAgent = {
    id: dbAgent.id,
    userId: dbAgent.userId,
    ownerId: dbAgent.ownerId,
    name: dbAgent.name,
    role: dbAgent.role,
    backstory: dbAgent.backstory,
    goal: dbAgent.goal,
    systemPrompt: dbAgent.systemPrompt,
    providerId: dbAgent.providerId,
    modelConfig: dbAgent.modelConfig,
    status: dbAgent.status,
    avatar: dbAgent.avatar,
    createdAt: new Date(dbAgent.createdAt),
    updatedAt: new Date(dbAgent.updatedAt),
  };
  
  // 5. Validate output
  const result = UpdateAgentOutputSchema.parse(apiAgent);
  
  logger.debug("Agent updated", { 
    agentId: result.id, 
    agentName: result.name,
    status: result.status
  });
  
  // 6. Emit specific event for update
  eventBus.emit("agent:updated", { agentId: result.id });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      update: (input: UpdateAgentInput) => Promise<UpdateAgentOutput>
    }
  }
}