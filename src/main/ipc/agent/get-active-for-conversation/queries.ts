import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema
export const GetActiveForConversationInputSchema = z.string().min(1, "Conversation ID is required");

// Output validation schema
export const GetActiveForConversationOutputSchema = z.array(z.object({
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
}));

export type GetActiveForConversationInput = z.infer<typeof GetActiveForConversationInputSchema>;
export type GetActiveForConversationOutput = z.infer<typeof GetActiveForConversationOutputSchema>;

export async function getActiveAgentsForConversation(conversationId: GetActiveForConversationInput): Promise<GetActiveForConversationOutput> {
  const db = getDatabase();
  
  const validatedConversationId = GetActiveForConversationInputSchema.parse(conversationId);
  
  // Por enquanto, retorna todos os agents ativos (conforme o AgentService original)
  // No futuro, pode ser filtrado por contexto de conversação
  const agents = await db
    .select()
    .from(agentsTable)
    .where(
      and(eq(agentsTable.isActive, true), eq(agentsTable.status, "active")),
    )
    .orderBy(desc(agentsTable.createdAt));

  return GetActiveForConversationOutputSchema.parse(agents);
}