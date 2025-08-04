import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const RestoreAgentInputSchema = z.string().min(1, "Agent ID is required");

// Output validation schema (retorna o agent restaurado)
export const RestoreAgentOutputSchema = z.object({
  message: z.string(),
  agent: z.object({
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
  }),
});

export type RestoreAgentInput = z.infer<typeof RestoreAgentInputSchema>;
export type RestoreAgentOutput = z.infer<typeof RestoreAgentOutputSchema>;

export async function restoreAgent(id: RestoreAgentInput): Promise<RestoreAgentOutput> {
  const db = getDatabase();
  
  const validatedId = RestoreAgentInputSchema.parse(id);
  
  const [restored] = await db
    .update(agentsTable)
    .set({
      isActive: true,
      deactivatedAt: null,
      deactivatedBy: null,
      updatedAt: new Date(),
    })
    .where(and(eq(agentsTable.id, validatedId), eq(agentsTable.isActive, false)))
    .returning();

  if (!restored) {
    throw new Error("Agent not found or not in soft deleted state");
  }

  return RestoreAgentOutputSchema.parse({
    message: "Agent restored successfully",
    agent: restored
  });
}