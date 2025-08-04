import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const GetActiveCountInputSchema = z.object({
  ownerId: z.string().min(1, "Owner ID is required"),
});

// Output validation schema
export const GetActiveCountOutputSchema = z.object({
  count: z.number(),
});

export type GetActiveCountInput = z.infer<typeof GetActiveCountInputSchema>;
export type GetActiveCountOutput = z.infer<typeof GetActiveCountOutputSchema>;

export async function getActiveAgentsCount(input: GetActiveCountInput): Promise<GetActiveCountOutput> {
  const db = getDatabase();
  
  const validatedInput = GetActiveCountInputSchema.parse(input);
  
  const result = await db
    .select({ count: agentsTable.id })
    .from(agentsTable)
    .where(
      and(
        eq(agentsTable.ownerId, validatedInput.ownerId),
        eq(agentsTable.isActive, true),
        eq(agentsTable.status, "active"),
      ),
    );

  return GetActiveCountOutputSchema.parse({
    count: result.length
  });
}