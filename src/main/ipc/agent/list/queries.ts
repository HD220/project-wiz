import { z } from "zod";
import { eq, and, desc, like, or } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent 
} from "@/main/database/schemas/agent.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema baseado em AgentFiltersInput
export const ListAgentsInputSchema = z.object({
  status: z.enum(["active", "inactive", "busy"]).optional(),
  search: z.string().optional(),
  showInactive: z.boolean().optional().default(false),
  ownerId: z.string().min(1, "Owner ID is required"),
}).optional();

// Output validation schema baseado em SelectAgent[]
export const ListAgentsOutputSchema = z.array(z.object({
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

export type ListAgentsInput = z.infer<typeof ListAgentsInputSchema>;
export type ListAgentsOutput = z.infer<typeof ListAgentsOutputSchema>;

export async function listAgents(input: ListAgentsInput): Promise<ListAgentsOutput> {
  const db = getDatabase();
  
  const validatedInput = input ? ListAgentsInputSchema.parse(input) : undefined;
  const ownerId = validatedInput?.ownerId;
  
  if (!ownerId) {
    throw new Error("Owner ID is required");
  }

  const conditions = [eq(agentsTable.ownerId, ownerId)];

  // Filter by active status unless explicitly including inactive
  if (!validatedInput?.showInactive) {
    conditions.push(eq(agentsTable.isActive, true));
  }

  // Add status filter
  if (validatedInput?.status) {
    conditions.push(eq(agentsTable.status, validatedInput.status));
  }

  // Add search filter (search in name and role)
  if (validatedInput?.search) {
    const searchTerm = `%${validatedInput.search}%`;
    const searchCondition = or(
      like(agentsTable.name, searchTerm),
      like(agentsTable.role, searchTerm),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const agents = await db
    .select()
    .from(agentsTable)
    .where(and(...conditions))
    .orderBy(desc(agentsTable.createdAt));

  return ListAgentsOutputSchema.parse(agents);
}