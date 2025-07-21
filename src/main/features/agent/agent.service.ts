import { eq, and, desc, sql } from "drizzle-orm";

import type {
  CreateAgentInput,
  SelectAgent,
  AgentStatus,
  AgentWithProvider,
} from "@/main/features/agent/agent.types";
import { createAgentSchema } from "@/main/features/agent/agent.types";
import { agentsTable } from "@/main/features/agent/agent.model";
import { llmProvidersTable } from "@/main/features/agent/llm-provider/llm-provider.model";
import { getDatabase } from "@/main/database/connection";
import { usersTable } from "@/main/features/user/user.model";

export class AgentService {
  /**
   * Generate a comprehensive system prompt for the agent
   */
  private static generateSystemPrompt(
    role: string,
    backstory: string,
    goal: string,
  ): string {
    return `You are a ${role}. ${backstory}. Your current goal is ${goal}. Always be helpful, professional, and focus on best practices in your domain. Provide clear, actionable advice and maintain a collaborative approach when working with humans and other agents.`;
  }

  /**
   * Create a new agent with associated user entry
   */
  static async create(
    input: CreateAgentInput,
    _ownerId: string,
  ): Promise<SelectAgent> {
    const validatedInput = createAgentSchema.parse(input);
    const db = getDatabase();

    return await db.transaction(async (tx) => {
      // Verify that the provider exists and is active
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

      // Generate system prompt
      const systemPrompt = this.generateSystemPrompt(
        validatedInput.role,
        validatedInput.backstory,
        validatedInput.goal,
      );

      // Create user entry
      const [user] = await tx
        .insert(usersTable)
        .values({
          name: validatedInput.name,
          type: "agent",
          avatar: validatedInput.avatar,
        })
        .returning();

      if (!user) {
        throw new Error("Failed to create user entry for agent");
      }

      // Create agent entry
      const [agent] = await tx
        .insert(agentsTable)
        .values({
          userId: user.id,
          providerId: validatedInput.providerId,
          name: validatedInput.name,
          role: validatedInput.role,
          backstory: validatedInput.backstory,
          goal: validatedInput.goal,
          systemPrompt,
          status: validatedInput.status,
          modelConfig: validatedInput.modelConfig,
        })
        .returning();

      if (!agent) {
        throw new Error("Failed to create agent");
      }

      return agent;
    });
  }

  /**
   * Find agent by ID
   */
  static async findById(id: string): Promise<SelectAgent | null> {
    const db = getDatabase();

    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);

    return agent || null;
  }

  /**
   * Find agent by associated user ID
   */
  static async findByUserId(userId: string): Promise<SelectAgent | null> {
    const db = getDatabase();

    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.userId, userId))
      .limit(1);

    return agent || null;
  }

  /**
   * Find all agents created by a specific user (owner)
   */
  static async findByOwner(_ownerId: string): Promise<SelectAgent[]> {
    const db = getDatabase();

    // Get agents that belong to users created by this owner
    // Note: We need to track ownership separately since agents create their own user entries
    // For now, we'll return all agents, but in a real implementation,
    // you'd add an ownerId field to the agents table
    const agents = await db
      .select()
      .from(agentsTable)
      .orderBy(desc(agentsTable.createdAt));

    return agents;
  }

  /**
   * Find agent with provider information
   */
  static async findWithProvider(id: string): Promise<AgentWithProvider | null> {
    const db = getDatabase();

    const [result] = await db
      .select({
        agent: agentsTable,
        provider: llmProvidersTable,
      })
      .from(agentsTable)
      .innerJoin(
        llmProvidersTable,
        eq(agentsTable.providerId, llmProvidersTable.id),
      )
      .where(eq(agentsTable.id, id))
      .limit(1);

    if (!result) {
      return null;
    }

    return {
      ...result.agent,
      provider: result.provider,
    };
  }

  /**
   * Update agent status
   */
  static async updateStatus(id: string, status: AgentStatus): Promise<void> {
    const db = getDatabase();

    const result = await db
      .update(agentsTable)
      .set({
        status,
        updatedAt: sql`(strftime('%s', 'now'))`,
      })
      .where(eq(agentsTable.id, id));

    if (result.changes === 0) {
      throw new Error("Agent not found");
    }
  }

  /**
   * Update agent configuration
   */
  static async update(
    id: string,
    updates: Partial<CreateAgentInput>,
  ): Promise<SelectAgent> {
    const db = getDatabase();

    // Regenerate system prompt if role, backstory, or goal changed
    let systemPrompt: string | undefined;
    if (updates.role || updates.backstory || updates.goal) {
      const [currentAgent] = await db
        .select()
        .from(agentsTable)
        .where(eq(agentsTable.id, id))
        .limit(1);

      if (!currentAgent) {
        throw new Error("Agent not found");
      }

      systemPrompt = this.generateSystemPrompt(
        updates.role || currentAgent.role,
        updates.backstory || currentAgent.backstory,
        updates.goal || currentAgent.goal,
      );
    }

    const [agent] = await db
      .update(agentsTable)
      .set({
        ...updates,
        systemPrompt,
        updatedAt: sql`(strftime('%s', 'now'))`,
      })
      .where(eq(agentsTable.id, id))
      .returning();

    if (!agent) {
      throw new Error("Failed to update agent");
    }

    return agent;
  }

  /**
   * Delete an agent and its associated user
   */
  static async delete(id: string): Promise<void> {
    const db = getDatabase();

    // Find the agent first to get the user ID
    const [agent] = await db
      .select({ userId: agentsTable.userId })
      .from(agentsTable)
      .where(eq(agentsTable.id, id))
      .limit(1);

    if (!agent) {
      throw new Error("Agent not found");
    }

    // Delete user - all foreign keys will cascade automatically
    const userResult = await db
      .delete(usersTable)
      .where(eq(usersTable.id, agent.userId));

    if (userResult.changes === 0) {
      throw new Error("Failed to delete agent user");
    }
  }
}
