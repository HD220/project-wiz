import { z } from "zod";
import { updateAgentStatus } from "./queries";
import { eventBus } from "@/shared/events/event-bus";
import { getLogger } from "@/shared/logger/config";

const logger = getLogger("agent.update-status.invoke");

// Input schema
const UpdateAgentStatusInputSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["active", "inactive", "busy"]),
});

// Output schema
const UpdateAgentStatusOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

type UpdateAgentStatusInput = z.infer<typeof UpdateAgentStatusInputSchema>;
type UpdateAgentStatusOutput = z.infer<typeof UpdateAgentStatusOutputSchema>;

export default async function(input: UpdateAgentStatusInput): Promise<UpdateAgentStatusOutput> {
  logger.debug("Updating agent status");

  // 1. Validate input
  const validatedInput = UpdateAgentStatusInputSchema.parse(input);

  // 2. Update database
  const success = await updateAgentStatus(validatedInput.id, validatedInput.status);
  
  if (!success) {
    throw new Error("Agent not found, inactive, or update failed");
  }
  
  // 3. Emit event
  eventBus.emit("agent:status-updated", { 
    agentId: validatedInput.id, 
    status: validatedInput.status 
  });
  
  // 4. Validate output
  const result = UpdateAgentStatusOutputSchema.parse({
    success: true,
    message: "Agent status updated successfully"
  });
  
  logger.debug("Agent status updated", { success: result.success });
  
  return result;
}

declare global {
  namespace WindowAPI {
    interface Agent {
      updateStatus: (input: UpdateAgentStatusInput) => Promise<UpdateAgentStatusOutput>
    }
  }
}