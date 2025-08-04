import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/database/config";
import { 
  agentsTable, 
  type SelectAgent, 
  type InsertAgent 
} from "@/main/database/schemas/agent.schema";
import { llmProvidersTable } from "@/main/database/schemas/llm-provider.schema";
import { usersTable } from "@/main/database/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

// Input validation schema baseado em CreateAgentInput
export const CreateAgentInputSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100, "Name too long"),
  role: z.string().min(1, "Agent role is required").max(100, "Role too long"),
  backstory: z.string().min(10, "Backstory must be at least 10 characters").max(1000, "Backstory too long"),
  goal: z.string().min(10, "Goal must be at least 10 characters").max(500, "Goal too long"),
  providerId: z.string().min(1, "LLM provider is required"),
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
  ),
  avatar: z.string().optional(),
  ownerId: z.string().min(1, "Owner ID is required"),
});

// Output validation schema baseado em SelectAgent
export const CreateAgentOutputSchema = z.object({
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

export type CreateAgentInput = z.infer<typeof CreateAgentInputSchema>;
export type CreateAgentOutput = z.infer<typeof CreateAgentOutputSchema>;

export async function createAgent(input: CreateAgentInput): Promise<CreateAgentOutput> {
  const db = getDatabase();
  
  const validatedInput = CreateAgentInputSchema.parse(input);
  
  // Usar transação síncrona conforme o padrão do AgentService original
  return db.transaction((tx) => {
    // 1. Verificar se o provider existe e está ativo
    const providers = tx
      .select()
      .from(llmProvidersTable)
      .where(
        and(
          eq(llmProvidersTable.id, validatedInput.providerId),
          eq(llmProvidersTable.isActive, true),
        ),
      )
      .limit(1)
      .all();

    const provider = providers[0];
    if (!provider) {
      throw new Error(`LLM provider ${validatedInput.providerId} not found or inactive`);
    }

    // 2. Criar user para o agent primeiro
    const agentUsers = tx
      .insert(usersTable)
      .values({
        name: validatedInput.name,
        avatar: validatedInput.avatar || "",
        type: "agent",
      })
      .returning()
      .all();

    const agentUser = agentUsers[0];
    if (!agentUser?.id) {
      throw new Error("Failed to create user for agent");
    }

    // 3. Gerar system prompt
    const systemPrompt = `You are a ${validatedInput.role}. ${validatedInput.backstory}. Your current goal is ${validatedInput.goal}. Always be helpful, professional, and focus on best practices in your domain. Provide clear, actionable advice and maintain a collaborative approach when working with humans and other agents.`;

    // 4. Criar o agent record
    const agents = tx
      .insert(agentsTable)
      .values({
        userId: agentUser.id,
        ownerId: validatedInput.ownerId,
        name: validatedInput.name,
        role: validatedInput.role,
        backstory: validatedInput.backstory,
        goal: validatedInput.goal,
        systemPrompt,
        providerId: validatedInput.providerId,
        modelConfig: validatedInput.modelConfig,
        status: "inactive", // Sempre começa como inactive
      })
      .returning()
      .all();

    const agent = agents[0];
    if (!agent?.id) {
      throw new Error("Failed to create agent");
    }

    return CreateAgentOutputSchema.parse(agent);
  });
}