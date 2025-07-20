import { eq, and, desc, sql } from "drizzle-orm";

import type {
  CreateAgentInput,
  SelectAgent,
  AgentStatus,
  AgentWithProvider,
  ModelConfig,
} from "@/main/agents/agent.types";
import {
  createAgentSchema,
  modelConfigSchema,
} from "@/main/agents/agent.types";
import { agentsTable } from "@/main/agents/agents.schema";
import { llmProvidersTable } from "@/main/agents/llm-providers/llm-providers.schema";
import { getDatabase } from "@/main/database/connection";
import { usersTable } from "@/main/user/users.schema";

export class AgentService {
  /**
   * Convert SQLite timestamp to Date object
   */
  private static convertTimestampToDate(timestamp: any): Date {
    if (timestamp instanceof Date) {
      return timestamp;
    }
    if (typeof timestamp === "number") {
      // SQLite timestamps are in seconds, JS Date expects milliseconds
      return new Date(timestamp * 1000);
    }
    if (typeof timestamp === "string") {
      return new Date(timestamp);
    }
    return new Date();
  }

  /**
   * Sanitize agent dates for consistent format
   */
  private static sanitizeDates(agent: SelectAgent): SelectAgent {
    return {
      ...agent,
      createdAt: this.convertTimestampToDate(agent.createdAt),
      updatedAt: this.convertTimestampToDate(agent.updatedAt),
    };
  }

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
   * Validate and parse model configuration
   */
  private static validateModelConfig(configString: string): ModelConfig {
    try {
      const parsed = JSON.parse(configString);
      const validatedConfig = modelConfigSchema.parse(parsed);
      return validatedConfig;
    } catch (_error) {
      throw new Error("Invalid model configuration");
    }
  }

  /**
   * Create a new agent with associated user entry
   */
  static async create(
    input: CreateAgentInput,
    _ownerId: string,
  ): Promise<SelectAgent> {
    // Validate input
    const validatedInput = createAgentSchema.parse(input);

    const db = getDatabase();

    // Verify that the provider exists and is active
    const [provider] = await db
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

    // Validate model configuration
    this.validateModelConfig(validatedInput.modelConfig);

    // Generate system prompt
    const systemPrompt = this.generateSystemPrompt(
      validatedInput.role,
      validatedInput.backstory,
      validatedInput.goal,
    );

    // Use database transaction for atomicity
    return await db.transaction(async (tx) => {
      // Create user entry first
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

      // Then create agent entry
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

      return this.sanitizeDates(agent);
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

    return agent ? this.sanitizeDates(agent) : null;
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

    return agent ? this.sanitizeDates(agent) : null;
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

    return agents.map((agent) => this.sanitizeDates(agent));
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
      ...this.sanitizeDates(result.agent),
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

    // Validate model config if provided
    if (updates.modelConfig) {
      this.validateModelConfig(updates.modelConfig);
    }

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

    return this.sanitizeDates(agent);
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

    // Use transaction to delete both agent and user
    await db.transaction(async (tx) => {
      // Delete agent first (due to foreign key constraint)
      const agentResult = await tx
        .delete(agentsTable)
        .where(eq(agentsTable.id, id));

      if (agentResult.changes === 0) {
        throw new Error("Failed to delete agent");
      }

      // Delete associated user
      const userResult = await tx
        .delete(usersTable)
        .where(eq(usersTable.id, agent.userId));

      if (userResult.changes === 0) {
        throw new Error("Failed to delete associated user");
      }
    });
  }
}
