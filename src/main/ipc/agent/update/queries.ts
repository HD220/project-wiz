import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema baseado em UpdateAgentInput
export const UpdateAgentInputSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  name: z.string().min(1, "Agent name is required").max(100, "Name too long").optional(),
  role: z.string().min(1, "Agent role is required").max(100, "Role too long").optional(),
  backstory: z.string().min(10, "Backstory must be at least 10 characters").max(1000, "Backstory too long").optional(),
  goal: z.string().min(10, "Goal must be at least 10 characters").max(500, "Goal too long").optional(),
  providerId: z.string().min(1, "LLM provider is required").optional(),
  modelConfig: z.string().refine(
    (val) => {
      try {
        const parsed = JSON.parse(val);
        return parsed && typeof parsed === "object";
      } catch {
        return false;
      }
    },
    { message: "Invalid model configuration" },
  ).optional(),
  status: z.enum(["active", "inactive", "busy"]).optional(),
  avatar: z.string().optional(),
});

// Output validation schema baseado em SelectAgent
export const UpdateAgentOutputSchema = z.object({
  id: z.string(),
  userId: z.string(),
  ownerId: z.string(),
  name: z.string(),
  role: z.string(),
  backstory: z.string(),
  goal: z.string(),
  systemPrompt: z.string(),
  providerId: z.string(),
  modelConfig: z.string(),
  status: z.enum(["active", "inactive", "busy"]),
  isActive: z.boolean(),
  deactivatedAt: z.number().nullable(),
  deactivatedBy: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type UpdateAgentInput = z.infer<typeof UpdateAgentInputSchema>;
export type UpdateAgentOutput = z.infer<typeof UpdateAgentOutputSchema>;

export async function updateAgent(input: UpdateAgentInput): Promise<UpdateAgentOutput> {
  const db = getDatabase();
  
  const validatedInput = UpdateAgentInputSchema.parse(input);
  
  const { id, ...updateData } = validatedInput;
  
  const [updatedAgent] = await db
    .update(agentsTable)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(and(eq(agentsTable.id, id), eq(agentsTable.isActive, true)))
    .returning();

  if (!updatedAgent) {
    throw new Error("Agent not found, inactive, or update failed");
  }

  return UpdateAgentOutputSchema.parse(updatedAgent);
}