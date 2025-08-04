import { z } from "zod";
import { eq } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const HardDeleteAgentInputSchema = z.string().min(1, "Agent ID is required");

// Output validation schema
export const HardDeleteAgentOutputSchema = z.object({
  message: z.string(),
});

export type HardDeleteAgentInput = z.infer<typeof HardDeleteAgentInputSchema>;
export type HardDeleteAgentOutput = z.infer<typeof HardDeleteAgentOutputSchema>;

export async function hardDeleteAgent(id: HardDeleteAgentInput): Promise<HardDeleteAgentOutput> {
  const db = getDatabase();
  
  const validatedId = HardDeleteAgentInputSchema.parse(id);
  
  // DEPRECATED: Hard delete - remove completely from database
  await db.delete(agentsTable).where(eq(agentsTable.id, validatedId));

  return HardDeleteAgentOutputSchema.parse({
    message: "Agent permanently deleted"
  });
}