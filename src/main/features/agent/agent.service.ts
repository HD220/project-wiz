import { eq, and, desc, ilike, or } from "drizzle-orm";

import { getDatabase } from "@/main/database/connection";
import { agentsTable } from "@/main/features/agent/agent.model";
import type {
  CreateAgentInput,
  SelectAgent,
  AgentStatus,
  AgentWithProvider,
  InsertAgent,
} from "@/main/features/agent/agent.types";
import { createAgentSchema } from "@/main/features/agent/agent.types";
import { llmProvidersTable } from "@/main/features/agent/llm-provider/llm-provider.model";
import { usersTable } from "@/main/features/user/user.model";

export class AgentService {
  /**
   * Create a new agent with validation
   */
  static async create(
    input: CreateAgentInput,
    ownerId: string,
  ): Promise<SelectAgent> {
    const validatedInput = createAgentSchema.parse(input);
    const db = getDatabase();

    return await db.transaction(async (tx) => {
      // Verify provider exists and is active
      const [provider] = await tx
        .select()
        .from(llmProvidersTable)
        .where(
          and(
            eq(llmProvidersTable.id, validatedInput.providerId),
            eq(llmProvidersTable.isActive, true),
          ),
        )
        .limit(1);

      if (!provider) {
        throw new Error(
          `LLM provider ${validatedInput.providerId} not found or inactive`,
        );
      }

      // Create user for the agent first
      const [agentUser] = await tx
        .insert(usersTable)
        .values({
          name: validatedInput.name,
          avatar: validatedInput.avatar || "",
          type: "agent",
        })
        .returning();

      if (!agentUser) {
        throw new Error("Failed to create user for agent");
      }

      // Generate system prompt
      const systemPrompt = `You are a ${validatedInput.role}. ${validatedInput.backstory}. Your current goal is ${validatedInput.goal}. Always be helpful, professional, and focus on best practices in your domain. Provide clear, actionable advice and maintain a collaborative approach when working with humans and other agents.`;

      // Create the agent record
      const [agent] = await tx
        .insert(agentsTable)
        .values({
          userId: agentUser.id, // Link to the user we just created
          ownerId: ownerId, // Who created this agent
          name: validatedInput.name,
          role: validatedInput.role,
          backstory: validatedInput.backstory,
          goal: validatedInput.goal,
          systemPrompt,
          providerId: validatedInput.providerId,
          modelConfig: JSON.stringify(validatedInput.modelConfig),
          status: "inactive" as AgentStatus,
        })
        .returning();

      if (!agent) {
        throw new Error("Failed to create agent");
      }

      return agent;
    });
  }

  /**
   * List agents by owner ID with comprehensive filtering support
   */
  static async listByOwnerId(
    ownerId: string,
    filters?: { status?: AgentStatus; search?: string },
  ): Promise<SelectAgent[]> {
    const db = getDatabase();

    const conditions = [eq(agentsTable.ownerId, ownerId)];

    // Add status filter
    if (filters?.status) {
      conditions.push(eq(agentsTable.status, filters.status));
    }

    // Add search filter (search in name and role)
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      const searchCondition = or(
        ilike(agentsTable.name, searchTerm),
        ilike(agentsTable.role, searchTerm),
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    return await db
      .select()
      .from(agentsTable)
      .where(and(...conditions))
      .orderBy(desc(agentsTable.createdAt));
  }

  /**
   * Update agent status
   */
  static async updateStatus(
    id: string,
    status: AgentStatus,
  ): Promise<SelectAgent> {
    const db = getDatabase();

    const [record] = await db
      .update(agentsTable)
      .set({ status })
      .where(eq(agentsTable.id, id))
      .returning();

    if (!record) {
      throw new Error("Agent not found or update failed");
    }

    return record;
  }

  /**
   * Get agent with provider information
   */
  static async getWithProvider(id: string): Promise<AgentWithProvider | null> {
    const db = getDatabase();

    const [result] = await db
      .select()
      .from(agentsTable)
      .innerJoin(
        llmProvidersTable,
        eq(agentsTable.providerId, llmProvidersTable.id),
      )
      .where(eq(agentsTable.id, id))
      .limit(1);

    if (!result) return null;

    return {
      ...result.agents,
      provider: result.llm_providers,
    };
  }

  /**
   * Find agent by ID
   */
  static async findById(id: string): Promise<SelectAgent | null> {
    const db = getDatabase();

    const [record] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);

    return record || null;
  }

  /**
   * Update agent by ID
   */
  static async update(
    id: string,
    input: Partial<InsertAgent>,
  ): Promise<SelectAgent> {
    const db = getDatabase();

    const [record] = await db
      .update(agentsTable)
      .set(input)
      .where(eq(agentsTable.id, id))
      .returning();

    if (!record) {
      throw new Error("Agent not found or update failed");
    }

    return record;
  }

  /**
   * Delete agent by ID
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();
    await db.delete(agentsTable).where(eq(agentsTable.id, id));
  }
}
