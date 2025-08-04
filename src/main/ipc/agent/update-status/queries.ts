import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent,
  type AgentStatus 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const UpdateAgentStatusInputSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  status: z.enum(["active", "inactive", "busy"]),
});

// Output validation schema
export const UpdateAgentStatusOutputSchema = z.object({
  message: z.string(),
});

export type UpdateAgentStatusInput = z.infer<typeof UpdateAgentStatusInputSchema>;
export type UpdateAgentStatusOutput = z.infer<typeof UpdateAgentStatusOutputSchema>;

export async function updateAgentStatus(input: UpdateAgentStatusInput): Promise<UpdateAgentStatusOutput> {
  const db = getDatabase();
  
  const validatedInput = UpdateAgentStatusInputSchema.parse(input);
  
  const [record] = await db
    .update(agentsTable)
    .set({
      status: validatedInput.status,
      updatedAt: new Date(),
    })
    .where(and(eq(agentsTable.id, validatedInput.id), eq(agentsTable.isActive, true)))
    .returning();

  if (!record) {
    throw new Error("Agent not found, inactive, or update failed");
  }

  return UpdateAgentStatusOutputSchema.parse({
    message: "Agent status updated successfully"
  });
}