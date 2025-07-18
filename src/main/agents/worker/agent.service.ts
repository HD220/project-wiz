import { eq, and, desc } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { agents } from '../../database/schema/agents.schema';
import { projectAgents } from '../../database/schema/relationships.schema';
import { generateId } from '../../utils/id-generator';

export interface CreateAgentInput {
  name: string;
  description?: string;
  role: string;
  expertise?: string[];
  personality?: any;
  systemPrompt: string;
  avatarUrl?: string;
  llmProvider?: string;
  llmModel?: string;
  temperature?: number;
  maxTokens?: number;
  createdBy: string;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  role?: string;
  expertise?: string[];
  personality?: any;
  systemPrompt?: string;
  avatarUrl?: string;
  status?: string;
  llmProvider?: string;
  llmModel?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentResponse {
  id: string;
  name: string;
  description?: string;
  role: string;
  expertise: string[];
  personality: any;
  systemPrompt: string;
  avatarUrl?: string;
  status: string;
  isGlobal: boolean;
  llmProvider: string;
  llmModel: string;
  temperature: number;
  maxTokens: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AgentService {
  static async create(input: CreateAgentInput): Promise<AgentResponse> {
    const db = getDatabase();
    
    const agentId = generateId();
    const now = new Date();
    
    await db.insert(agents).values({
      id: agentId,
      name: input.name,
      description: input.description,
      role: input.role,
      expertise: input.expertise ? JSON.stringify(input.expertise) : null,
      personality: input.personality ? JSON.stringify(input.personality) : null,
      systemPrompt: input.systemPrompt,
      avatarUrl: input.avatarUrl,
      status: 'online',
      isGlobal: true,
      llmProvider: input.llmProvider || 'deepseek',
      llmModel: input.llmModel || 'deepseek-chat',
      temperature: input.temperature || 0.7,
      maxTokens: input.maxTokens || 4000,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    });
    
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
    });
    
    if (!agent) {
      throw new Error('Failed to create agent');
    }
    
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      role: agent.role,
      expertise: agent.expertise ? JSON.parse(agent.expertise) : [],
      personality: agent.personality ? JSON.parse(agent.personality) : {},
      systemPrompt: agent.systemPrompt,
      avatarUrl: agent.avatarUrl,
      status: agent.status,
      isGlobal: agent.isGlobal,
      llmProvider: agent.llmProvider,
      llmModel: agent.llmModel,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      createdBy: agent.createdBy,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }
  
  static async findById(agentId: string): Promise<AgentResponse | null> {
    const db = getDatabase();
    
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
    });
    
    if (!agent) {
      return null;
    }
    
    return {
      id: agent.id,
      name: agent.name,
      description: agent.description,
      role: agent.role,
      expertise: agent.expertise ? JSON.parse(agent.expertise) : [],
      personality: agent.personality ? JSON.parse(agent.personality) : {},
      systemPrompt: agent.systemPrompt,
      avatarUrl: agent.avatarUrl,
      status: agent.status,
      isGlobal: agent.isGlobal,
      llmProvider: agent.llmProvider,
      llmModel: agent.llmModel,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      createdBy: agent.createdBy,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    };
  }
  
  static async findByCreator(creatorId: string): Promise<AgentResponse[]> {
    const db = getDatabase();
    
    const userAgents = await db.query.agents.findMany({
      where: eq(agents.createdBy, creatorId),
      orderBy: [desc(agents.updatedAt)],
    });
    
    return userAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      role: agent.role,
      expertise: agent.expertise ? JSON.parse(agent.expertise) : [],
      personality: agent.personality ? JSON.parse(agent.personality) : {},
      systemPrompt: agent.systemPrompt,
      avatarUrl: agent.avatarUrl,
      status: agent.status,
      isGlobal: agent.isGlobal,
      llmProvider: agent.llmProvider,
      llmModel: agent.llmModel,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      createdBy: agent.createdBy,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }));
  }
  
  static async findProjectAgents(projectId: string): Promise<AgentResponse[]> {
    const db = getDatabase();
    
    const projectAgentRelations = await db.query.projectAgents.findMany({
      where: and(
        eq(projectAgents.projectId, projectId),
        eq(projectAgents.isActive, true)
      ),
      with: {
        agent: true,
      },
    });
    
    return projectAgentRelations
      .filter(relation => relation.agent)
      .map(relation => {
        const agent = relation.agent!;
        return {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          role: agent.role,
          expertise: agent.expertise ? JSON.parse(agent.expertise) : [],
          personality: agent.personality ? JSON.parse(agent.personality) : {},
          systemPrompt: agent.systemPrompt,
          avatarUrl: agent.avatarUrl,
          status: agent.status,
          isGlobal: agent.isGlobal,
          llmProvider: agent.llmProvider,
          llmModel: agent.llmModel,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          createdBy: agent.createdBy,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
        };
      });
  }
  
  static async update(agentId: string, input: UpdateAgentInput, userId: string): Promise<AgentResponse> {
    const db = getDatabase();
    
    // Check if user can edit this agent
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
    });
    
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    if (agent.createdBy !== userId) {
      throw new Error('Permission denied');
    }
    
    // Update agent
    await db.update(agents)
      .set({
        ...input,
        expertise: input.expertise ? JSON.stringify(input.expertise) : undefined,
        personality: input.personality ? JSON.stringify(input.personality) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));
    
    // Get updated agent
    const updatedAgent = await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
    });
    
    if (!updatedAgent) {
      throw new Error('Failed to update agent');
    }
    
    return {
      id: updatedAgent.id,
      name: updatedAgent.name,
      description: updatedAgent.description,
      role: updatedAgent.role,
      expertise: updatedAgent.expertise ? JSON.parse(updatedAgent.expertise) : [],
      personality: updatedAgent.personality ? JSON.parse(updatedAgent.personality) : {},
      systemPrompt: updatedAgent.systemPrompt,
      avatarUrl: updatedAgent.avatarUrl,
      status: updatedAgent.status,
      isGlobal: updatedAgent.isGlobal,
      llmProvider: updatedAgent.llmProvider,
      llmModel: updatedAgent.llmModel,
      temperature: updatedAgent.temperature,
      maxTokens: updatedAgent.maxTokens,
      createdBy: updatedAgent.createdBy,
      createdAt: updatedAgent.createdAt,
      updatedAt: updatedAgent.updatedAt,
    };
  }
  
  static async delete(agentId: string, userId: string): Promise<void> {
    const db = getDatabase();
    
    // Check if user can delete this agent
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, agentId),
    });
    
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    if (agent.createdBy !== userId) {
      throw new Error('Permission denied');
    }
    
    // Remove from all projects first
    await db.update(projectAgents)
      .set({
        isActive: false,
        removedAt: new Date(),
      })
      .where(eq(projectAgents.agentId, agentId));
    
    // Delete agent
    await db.delete(agents).where(eq(agents.id, agentId));
  }
  
  static async updateStatus(agentId: string, status: string): Promise<void> {
    const db = getDatabase();
    
    await db.update(agents)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));
  }
  
  static async getAvailableAgents(userId: string): Promise<AgentResponse[]> {
    const db = getDatabase();
    
    // Get all agents created by user that are global
    const availableAgents = await db.query.agents.findMany({
      where: and(
        eq(agents.createdBy, userId),
        eq(agents.isGlobal, true)
      ),
      orderBy: [desc(agents.updatedAt)],
    });
    
    return availableAgents.map(agent => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      role: agent.role,
      expertise: agent.expertise ? JSON.parse(agent.expertise) : [],
      personality: agent.personality ? JSON.parse(agent.personality) : {},
      systemPrompt: agent.systemPrompt,
      avatarUrl: agent.avatarUrl,
      status: agent.status,
      isGlobal: agent.isGlobal,
      llmProvider: agent.llmProvider,
      llmModel: agent.llmModel,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      createdBy: agent.createdBy,
      createdAt: agent.createdAt,
      updatedAt: agent.updatedAt,
    }));
  }
}