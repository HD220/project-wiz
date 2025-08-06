import { eq, and, desc, like, or } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/config/database";
import { 
  agentsTable, 
  type SelectAgent,
  type UpdateAgent,
  type InsertAgent,
  type AgentStatus
} from "@/main/schemas/agent.schema";
import { llmProvidersTable } from "@/main/schemas/llm-provider.schema";
import { usersTable } from "@/main/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Buscar agent por id e owner
 */
export async function findAgent(agentId: string, ownerId: string): Promise<SelectAgent | null> {
  const db = getDatabase();
  
  const [agent] = await db
    .select()
    .from(agentsTable)
    .where(and(
      eq(agentsTable.id, agentId),
      eq(agentsTable.ownerId, ownerId)
    ))
    .limit(1);

  return agent || null;
}

/**
 * Update genérico do agent - WHERE pelas PKs
 */
export async function updateAgent(data: UpdateAgent): Promise<SelectAgent | null> {
  const db = getDatabase();
  
  const [updated] = await db
    .update(agentsTable)
    .set(data)
    .where(and(
      eq(agentsTable.id, data.id),
      eq(agentsTable.ownerId, data.ownerId!)
    ))
    .returning();

  return updated || null;
}

/**
 * Buscar user por ID
 */
export async function findUser(userId: string): Promise<{ avatar: string | null } | null> {
  const db = getDatabase();
  
  const [user] = await db
    .select({ avatar: usersTable.avatar })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  return user || null;
}

/**
 * Contar agents ativos por owner
 */
export async function getActiveAgentsCount(ownerId: string): Promise<number> {
  const db = getDatabase();
  
  const result = await db
    .select({ count: agentsTable.id })
    .from(agentsTable)
    .where(
      and(
        eq(agentsTable.ownerId, ownerId),
        eq(agentsTable.isActive, true),
        eq(agentsTable.status, "active"),
      ),
    );

  return result.length;
}

/**
 * Criar agent com user associado
 */
export async function createAgent(data: InsertAgent & { 
  ownerId: string; 
  avatar?: string | null; 
}): Promise<SelectAgent> {
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
        avatar: data.avatar || null,
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
      id: agentUser.id,
      ownerId: data.ownerId,
      name: data.name,
      role: data.role,
      backstory: data.backstory,
      goal: data.goal,
      providerId: data.providerId,
      modelConfig: typeof data.modelConfig === 'string' 
        ? data.modelConfig 
        : JSON.stringify(data.modelConfig),
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

/**
 * Listar agents com filtros
 */
export async function listAgents(filters: {
  ownerId: string;
  status?: AgentStatus;
  search?: string;
  showInactive?: boolean;
}): Promise<SelectAgent[]> {
  const db = getDatabase();

  const conditions = [eq(agentsTable.ownerId, filters.ownerId)];

  // Filter by active status unless explicitly including inactive
  if (!filters.showInactive) {
    conditions.push(eq(agentsTable.isActive, true));
  }

  // Add status filter
  if (filters.status) {
    conditions.push(eq(agentsTable.status, filters.status));
  }

  // Add search filter (search in name and role)
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
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

  return agents;
}


