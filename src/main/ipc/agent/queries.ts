import { eq, and, desc, like, or } from "drizzle-orm";
import { createDatabaseConnection } from "@/shared/config/database";
import { 
  agentsTable, 
  type UpdateAgent,
  type AgentStatus
} from "@/main/schemas/agent.schema";
import type { Agent } from "@/shared/types";
import { llmProvidersTable } from "@/main/schemas/llm-provider.schema";
import { usersTable } from "@/main/schemas/user.schema";

const { getDatabase } = createDatabaseConnection(true);

/**
 * Buscar agent por id e owner (sempre JOIN com users)
 */
export async function findAgent(agentId: string, ownerId: string): Promise<Agent | null> {
  const db = getDatabase();
  
  const [agent] = await db
    .select({
      // Identity fields (users - authoritative)
      id: usersTable.id,
      name: usersTable.name,
      avatar: usersTable.avatar,
      type: usersTable.type,
      
      // State management (users - authoritative)
      isActive: usersTable.isActive,
      deactivatedAt: usersTable.deactivatedAt,
      deactivatedBy: usersTable.deactivatedBy,
      
      // Timestamps (users - authoritative)
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      
      // Agent-specific fields (agents table)
      ownerId: agentsTable.ownerId,
      role: agentsTable.role,
      backstory: agentsTable.backstory,
      goal: agentsTable.goal,
      providerId: agentsTable.providerId,
      modelConfig: agentsTable.modelConfig,
      status: agentsTable.status,
    })
    .from(agentsTable)
    .innerJoin(usersTable, eq(agentsTable.id, usersTable.id))
    .where(and(
      eq(agentsTable.id, agentId),
      eq(agentsTable.ownerId, ownerId),
      eq(usersTable.isActive, true) // Only active users
    ))
    .limit(1);

  return agent as Agent | null;
}

/**
 * Update agent with user fields and return complete data
 */
export async function updateAgent(data: UpdateAgent & { 
  ownerId: string;
  name?: string;
  avatar?: string;
}): Promise<Agent | null> {
  const db = getDatabase();
  
  // Extract user fields
  const { name, avatar, ownerId, ...agentFields } = data;
  
  // Update user table if there are user fields
  if (name !== undefined || avatar !== undefined) {
    await db
      .update(usersTable)
      .set({ name, avatar })
      .where(eq(usersTable.id, data.id));
  }
  
  // Update agent table
  if (Object.keys(agentFields).length > 0) {
    const [updated] = await db
      .update(agentsTable)
      .set(agentFields)
      .where(and(
        eq(agentsTable.id, data.id),
        eq(agentsTable.ownerId, ownerId)
      ))
      .returning({ id: agentsTable.id });

    if (!updated) {
      return null;
    }
  }

  // Return complete data with JOIN
  return await findAgent(data.id, ownerId);
}


/**
 * Contar agents ativos por owner
 */
export async function getActiveAgentsCount(ownerId: string): Promise<number> {
  const db = getDatabase();
  
  const result = await db
    .select({ count: agentsTable.id })
    .from(agentsTable)
    .innerJoin(usersTable, eq(agentsTable.id, usersTable.id))
    .where(
      and(
        eq(agentsTable.ownerId, ownerId),
        eq(usersTable.isActive, true),
        eq(agentsTable.status, "active"),
      ),
    );

  return result.length;
}

/**
 * Criar agent com user associado
 */
export async function createAgent(data: { 
  name: string;
  role: string;
  backstory: string;
  goal: string;
  providerId: string;
  modelConfig: string | object;
  ownerId: string; 
  avatar?: string | null; 
}): Promise<Agent> {
  const db = getDatabase();
  
  // Usar transação síncrona conforme o padrão do AgentService original
  return db.transaction((tx): Agent => {
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

    // 3. Criar o agent record (só campos específicos)
    const agents = tx
      .insert(agentsTable)
      .values({
        id: agentUser.id,
        ownerId: data.ownerId,
        role: data.role,
        backstory: data.backstory,
        goal: data.goal,
        providerId: data.providerId,
        modelConfig: typeof data.modelConfig === 'string' 
          ? data.modelConfig 
          : JSON.stringify(data.modelConfig),
        status: "inactive", // Sempre começa como inactive
      })
      .returning({ id: agentsTable.id })
      .all();

    const agent = agents[0];
    if (!agent?.id) {
      throw new Error(`Failed to create agent "${data.name}" with role "${data.role}"`);
    }

    // 4. Retornar dados completos do agent criado
    const completeAgents = tx
      .select({
        // Identity fields (users - authoritative)
        id: usersTable.id,
        name: usersTable.name,
        avatar: usersTable.avatar,
        type: usersTable.type,
        
        // State management (users - authoritative)
        isActive: usersTable.isActive,
        deactivatedAt: usersTable.deactivatedAt,
        deactivatedBy: usersTable.deactivatedBy,
        
        // Timestamps (users - authoritative)
        createdAt: usersTable.createdAt,
        updatedAt: usersTable.updatedAt,
        
        // Agent-specific fields (agents table)
        ownerId: agentsTable.ownerId,
        role: agentsTable.role,
        backstory: agentsTable.backstory,
        goal: agentsTable.goal,
        providerId: agentsTable.providerId,
        modelConfig: agentsTable.modelConfig,
        status: agentsTable.status,
      })
      .from(agentsTable)
      .innerJoin(usersTable, eq(agentsTable.id, usersTable.id))
      .where(eq(agentsTable.id, agent.id))
      .limit(1)
      .all();

    const completeAgent = completeAgents[0];
    if (!completeAgent) {
      throw new Error(`Failed to retrieve created agent "${data.name}"`);
    }

    return completeAgent as Agent;
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
}): Promise<Agent[]> {
  const db = getDatabase();

  const conditions = [eq(agentsTable.ownerId, filters.ownerId)];

  // Filter by active status unless explicitly including inactive
  if (!filters.showInactive) {
    conditions.push(eq(usersTable.isActive, true));
  }

  // Add status filter
  if (filters.status) {
    conditions.push(eq(agentsTable.status, filters.status));
  }

  // Add search filter (search in name and role)
  if (filters.search) {
    const searchTerm = `%${filters.search}%`;
    const searchCondition = or(
      like(usersTable.name, searchTerm),
      like(agentsTable.role, searchTerm),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const agents = await db
    .select({
      // Identity fields (users - authoritative)
      id: usersTable.id,
      name: usersTable.name,
      avatar: usersTable.avatar,
      type: usersTable.type,
      
      // State management (users - authoritative)
      isActive: usersTable.isActive,
      deactivatedAt: usersTable.deactivatedAt,
      deactivatedBy: usersTable.deactivatedBy,
      
      // Timestamps (users - authoritative)
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      
      // Agent-specific fields (agents table)
      ownerId: agentsTable.ownerId,
      role: agentsTable.role,
      backstory: agentsTable.backstory,
      goal: agentsTable.goal,
      providerId: agentsTable.providerId,
      modelConfig: agentsTable.modelConfig,
      status: agentsTable.status,
    })
    .from(agentsTable)
    .innerJoin(usersTable, eq(agentsTable.id, usersTable.id))
    .where(and(...conditions))
    .orderBy(desc(usersTable.createdAt));

  return agents as Agent[];
}


