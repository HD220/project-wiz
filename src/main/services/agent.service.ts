import { eq, and } from 'drizzle-orm';
import { getDatabase } from '../database/connection';
import { agents, projectAgents } from '../database/schema';
import { 
  CreateAgentSchema, 
  UpdateAgentSchema,
  type CreateAgentInput, 
  type UpdateAgentInput 
} from '../../shared/schemas/validation.schemas';
import { 
  ValidationError, 
  NotFoundError,
  type Agent,
  type AgentStatus,
  type ProjectAgent
} from '../../shared/types/common';
import { generateAgentId } from '../../shared/utils/id-generator';

export class AgentService {
  /**
   * Create new agent
   */
  static async create(input: CreateAgentInput, createdBy: string): Promise<Agent> {
    // Validate input
    const validated = CreateAgentSchema.parse(input);
    const db = getDatabase();
    
    // Check agent limits for user
    await this.validateAgentLimits(createdBy);
    
    // Generate system prompt if not provided
    const systemPrompt = validated.systemPrompt || this.generateDefaultSystemPrompt(validated);
    
    // Create agent
    const agentId = generateAgentId();
    const now = new Date();
    
    const newAgent = {
      id: agentId,
      name: validated.name,
      description: validated.description,
      role: validated.role,
      expertise: JSON.stringify(validated.expertise || []),
      personality: validated.personality ? JSON.stringify(validated.personality) : null,
      systemPrompt,
      status: 'online' as const,
      isGlobal: true,
      llmProvider: validated.llmProvider,
      llmModel: validated.llmModel,
      temperature: validated.temperature,
      maxTokens: validated.maxTokens,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
    
    await db.insert(agents).values(newAgent);
    
    // Return agent with parsed JSON fields
    return {
      ...newAgent,
      expertise: JSON.parse(newAgent.expertise),
      personality: newAgent.personality ? JSON.parse(newAgent.personality) : undefined,
    };
  }
  
  /**
   * Update agent
   */
  static async update(agentId: string, input: UpdateAgentInput, userId: string): Promise<Agent> {
    // Validate input
    const validated = UpdateAgentSchema.parse(input);
    const db = getDatabase();
    
    // Check if agent exists and user owns it
    const existingAgent = await this.findById(agentId);
    if (!existingAgent) {
      throw new NotFoundError('Agent', agentId);
    }
    
    if (existingAgent.createdBy !== userId) {
      throw new ValidationError('You can only update your own agents');
    }
    
    // Prepare update data
    const updateData: any = {
      ...validated,
      updatedAt: new Date(),
    };
    
    // Handle JSON fields
    if (validated.expertise) {
      updateData.expertise = JSON.stringify(validated.expertise);
    }
    if (validated.personality) {
      updateData.personality = JSON.stringify(validated.personality);
    }
    
    // Update agent
    await db.update(agents)
      .set(updateData)
      .where(eq(agents.id, agentId));
    
    // Return updated agent
    return await this.findById(agentId) as Agent;
  }
  
  /**
   * Delete agent
   */
  static async delete(agentId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Check if agent exists and user owns it
    const existingAgent = await this.findById(agentId);
    if (!existingAgent) {
      throw new NotFoundError('Agent', agentId);
    }
    
    if (existingAgent.createdBy !== userId) {
      throw new ValidationError('You can only delete your own agents');
    }
    
    // Remove from all projects first
    await db.delete(projectAgents)
      .where(eq(projectAgents.agentId, agentId));
    
    // Delete agent
    await db.delete(agents)
      .where(eq(agents.id, agentId));
  }
  
  /**
   * Find agent by ID
   */
  static async findById(agentId: string): Promise<Agent | null> {
    const db = getDatabase();
    
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
    });
    
    if (!agent) return null;
    
    return {
      ...agent,
      expertise: JSON.parse(agent.expertise),
      personality: agent.personality ? JSON.parse(agent.personality) : undefined,
    };
  }
  
  /**
   * List global agents for user
   */
  static async listGlobal(userId: string): Promise<Agent[]> {
    const db = getDatabase();
    
    const userAgents = await db.query.agents.findMany({
      where: and(
        eq(agents.createdBy, userId),
        eq(agents.isGlobal, true)
      ),
      orderBy: [agents.createdAt],
    });
    
    return userAgents.map(agent => ({
      ...agent,
      expertise: JSON.parse(agent.expertise),
      personality: agent.personality ? JSON.parse(agent.personality) : undefined,
    }));
  }
  
  /**
   * List agents in a project
   */
  static async listByProject(projectId: string): Promise<Agent[]> {
    const db = getDatabase();
    
    const projectAgentsList = await db.query.projectAgents.findMany({
      where: and(
        eq(projectAgents.projectId, projectId),
        eq(projectAgents.isActive, true)
      ),
      with: {
        agent: true,
      },
    });
    
    return projectAgentsList.map(pa => ({
      ...pa.agent,
      expertise: JSON.parse(pa.agent.expertise),
      personality: pa.agent.personality ? JSON.parse(pa.agent.personality) : undefined,
    }));
  }
  
  /**
   * Update agent status
   */
  static async updateStatus(agentId: string, status: AgentStatus): Promise<void> {
    const db = getDatabase();
    
    await db.update(agents)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));
  }
  
  /**
   * Add agent to project
   */
  static async addToProject(
    agentId: string,
    projectId: string,
    role: string = 'developer',
    addedBy: string
  ): Promise<void> {
    const db = getDatabase();
    
    // Verify agent exists
    const agent = await this.findById(agentId);
    if (!agent) {
      throw new NotFoundError('Agent', agentId);
    }
    
    // Check if already in project
    const existing = await db.query.projectAgents.findFirst({
      where: and(
        eq(projectAgents.agentId, agentId),
        eq(projectAgents.projectId, projectId)
      ),
    });
    
    if (existing && existing.isActive) {
      throw new ValidationError('Agent already in project');
    }
    
    if (existing) {
      // Reactivate existing relationship
      await db.update(projectAgents)
        .set({
          isActive: true,
          role,
          addedBy,
          addedAt: new Date(),
          removedAt: null,
        })
        .where(and(
          eq(projectAgents.agentId, agentId),
          eq(projectAgents.projectId, projectId)
        ));
    } else {
      // Create new relationship
      await db.insert(projectAgents).values({
        agentId,
        projectId,
        role,
        permissions: JSON.stringify(['read', 'write']),
        isActive: true,
        addedBy,
        addedAt: new Date(),
      });
    }
  }
  
  /**
   * Remove agent from project
   */
  static async removeFromProject(agentId: string, projectId: string): Promise<void> {
    const db = getDatabase();
    
    await db.update(projectAgents)
      .set({
        isActive: false,
        removedAt: new Date(),
      })
      .where(and(
        eq(projectAgents.agentId, agentId),
        eq(projectAgents.projectId, projectId)
      ));
  }
  
  /**
   * Get project agents with relationships
   */
  static async listProjectAgents(projectId: string): Promise<ProjectAgent[]> {
    const db = getDatabase();
    
    const projectAgentsList = await db.query.projectAgents.findMany({
      where: and(
        eq(projectAgents.projectId, projectId),
        eq(projectAgents.isActive, true)
      ),
    });
    
    return projectAgentsList.map(pa => ({
      ...pa,
      permissions: JSON.parse(pa.permissions),
    }));
  }
  
  /**
   * Send direct message to agent
   */
  static async sendMessage(agentId: string, message: string): Promise<string> {
    // This will be implemented when we add the LLM service and agent workers
    // For now, return a placeholder response
    const agent = await this.findById(agentId);
    if (!agent) {
      throw new NotFoundError('Agent', agentId);
    }
    
    // TODO: Implement actual LLM communication
    return `Hello! I'm ${agent.name}, a ${agent.role}. I received your message: "${message}". How can I help you?`;
  }
  
  // Private methods
  private static async validateAgentLimits(userId: string): Promise<void> {
    const userAgents = await this.listGlobal(userId);
    const MAX_AGENTS_PER_USER = 10;
    
    if (userAgents.length >= MAX_AGENTS_PER_USER) {
      throw new ValidationError(`Maximum of ${MAX_AGENTS_PER_USER} agents per user`);
    }
  }
  
  private static generateDefaultSystemPrompt(agent: CreateAgentInput): string {
    return `You are ${agent.name}, a ${agent.role} AI assistant.

Your expertise includes: ${agent.expertise?.join(', ') || 'general software development'}.

Your role is to help with software development tasks including:
- Writing and reviewing code
- Suggesting improvements
- Debugging issues
- Documenting features
- Planning implementations

Always be helpful, professional, and focused on delivering high-quality solutions.`;
  }
}