import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const GetAgentInputSchema = z.object({
  id: z.string().min(1, "Agent ID is required"),
  includeInactive: z.boolean().optional().default(false),
});

// Output validation schema baseado em SelectAgent
export const GetAgentOutputSchema = z.object({
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
}).nullable();

export type GetAgentInput = z.infer<typeof GetAgentInputSchema>;
export type GetAgentOutput = z.infer<typeof GetAgentOutputSchema>;

export async function getAgent(input: GetAgentInput): Promise<GetAgentOutput> {
  const db = getDatabase();
  
  const validatedInput = GetAgentInputSchema.parse(input);
  
  const conditions = [eq(agentsTable.id, validatedInput.id)];

  if (!validatedInput.includeInactive) {
    conditions.push(eq(agentsTable.isActive, true));
  }

  const [agent] = await db
    .select()
    .from(agentsTable)
    .where(and(...conditions))
    .limit(1);

  if (!agent) {
    return null;
  }

  return GetAgentOutputSchema.parse(agent);
}