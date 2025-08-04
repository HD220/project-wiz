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

/**
 * Pure database function - only Drizzle types
 * No validation, no business logic, just database operations
 */
export async function createAgent(data: InsertAgent & { ownerId: string }): Promise<SelectAgent> {
  const db = getDatabase();
  
  // Usar transação síncrona conforme o padrão do AgentService original
  return db.transaction((tx) => {
    // 1. Verificar se o provider existe e está ativo
    const providers = tx
      .select()
      .from(llmProvidersTable)
      .where(
        and(
          eq(llmProvidersTable.id, data.providerId),
          eq(llmProvidersTable.isActive, true),
        ),
      )
      .limit(1)
      .all();

    const provider = providers[0];
    if (!provider) {
      throw new Error(`LLM provider ${data.providerId} not found or inactive`);
    }

    // 2. Criar user para o agent primeiro
    const agentUsers = tx
      .insert(usersTable)
      .values({
        name: data.name,
        avatar: data.avatar || "",
        type: "agent",
      })
      .returning()
      .all();

    const agentUser = agentUsers[0];
    if (!agentUser?.id) {
      throw new Error(`Failed to create user for agent "${data.name}"`);
    }

    // 3. Criar o agent record usando InsertAgent type
    const agentInsertData: InsertAgent = {
      userId: agentUser.id,
      ownerId: data.ownerId,
      name: data.name,
      role: data.role,
      backstory: data.backstory,
      goal: data.goal,
      providerId: data.providerId,
      modelConfig: data.modelConfig,
      status: "inactive", // Sempre começa como inactive
    };

    const agents = tx
      .insert(agentsTable)
      .values(agentInsertData)
      .returning()
      .all();

    const agent = agents[0];
    if (!agent?.id) {
      throw new Error(`Failed to create agent "${data.name}" with role "${data.role}"`);
    }

    return agent;
  });
}