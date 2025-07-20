# Task 12B: Agent Coordination & Execution Engine - Enhanced

## Overview

Implement the sophisticated agent coordination system that enables multiple AI agents to work together on complex workflows. This micro-task creates the execution engine, agent-to-agent communication, knowledge sharing, and intelligent task assignment that makes multi-agent collaboration truly effective.

## User Value

After completing this task, users can:
- Watch agents automatically coordinate and delegate tasks to each other
- See intelligent agent assignment based on skills and capabilities
- Benefit from agents sharing knowledge and insights during collaboration
- Experience seamless multi-step workflow execution with real-time coordination
- Monitor agent interactions and communication in complex workflows

## Technical Requirements

### Prerequisites
- Task 12A: Collaboration Foundation & Database completed
- Existing agent chat service with AI SDK integration
- LLM provider system operational
- Memory system for knowledge storage

### Extended Database Schema

```sql
-- Agent interactions for tracking collaboration
CREATE TABLE agent_interactions (
    id TEXT PRIMARY KEY,
    workflow_execution_id TEXT NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    
    -- Interaction participants
    from_agent_id TEXT NOT NULL REFERENCES agents(id),
    to_agent_id TEXT REFERENCES agents(id), -- NULL for broadcasts
    
    -- Interaction details
    interaction_type TEXT NOT NULL, -- task_delegation, knowledge_sharing, coordination, feedback, question
    message TEXT NOT NULL,
    context_data TEXT, -- JSON with additional context
    
    -- References
    related_step_id TEXT, -- Which workflow step this relates to
    related_task_id TEXT, -- Reference to specific task if applicable
    
    -- Response tracking
    requires_response BOOLEAN DEFAULT FALSE,
    response_deadline INTEGER, -- Timestamp for expected response
    response_received BOOLEAN DEFAULT FALSE,
    response_message TEXT,
    response_data TEXT, -- JSON response data
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    responded_at INTEGER
);

-- Shared knowledge base for agent collaboration
CREATE TABLE collaboration_knowledge (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL REFERENCES collaboration_workflows(id) ON DELETE CASCADE,
    
    -- Knowledge entry
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    knowledge_type TEXT NOT NULL, -- insight, decision, resource, constraint, best_practice
    
    -- Attribution
    created_by_agent_id TEXT NOT NULL REFERENCES agents(id),
    validated_by_agents TEXT, -- JSON array of agent IDs that confirmed this knowledge
    
    -- Relevance and usage
    relevance_score REAL DEFAULT 1.0, -- How relevant/important this knowledge is
    usage_count INTEGER DEFAULT 0, -- How many times this has been referenced
    tags TEXT, -- JSON array of tags for categorization
    
    -- Lifecycle
    is_active BOOLEAN DEFAULT TRUE,
    superseded_by TEXT REFERENCES collaboration_knowledge(id),
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

## Implementation Steps

### 1. Extended Database Schema

```typescript
// Update src/main/agents/collaboration/collaboration.schema.ts
export const agentInteractionsTable = sqliteTable('agent_interactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workflowExecutionId: text('workflow_execution_id').notNull().references(() => workflowExecutionsTable.id, { onDelete: 'cascade' }),
  
  fromAgentId: text('from_agent_id').notNull().references(() => agentsTable.id),
  toAgentId: text('to_agent_id').references(() => agentsTable.id),
  
  interactionType: text('interaction_type').notNull(),
  message: text('message').notNull(),
  contextData: text('context_data'), // JSON
  
  relatedStepId: text('related_step_id'),
  relatedTaskId: text('related_task_id'),
  
  requiresResponse: integer('requires_response', { mode: 'boolean' }).default(false),
  responseDeadline: integer('response_deadline', { mode: 'timestamp' }),
  responseReceived: integer('response_received', { mode: 'boolean' }).default(false),
  responseMessage: text('response_message'),
  responseData: text('response_data'), // JSON
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  respondedAt: integer('responded_at', { mode: 'timestamp' }),
});

export const collaborationKnowledgeTable = sqliteTable('collaboration_knowledge', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workflowId: text('workflow_id').notNull().references(() => collaborationWorkflowsTable.id, { onDelete: 'cascade' }),
  
  title: text('title').notNull(),
  content: text('content').notNull(),
  knowledgeType: text('knowledge_type').notNull(),
  
  createdByAgentId: text('created_by_agent_id').notNull().references(() => agentsTable.id),
  validatedByAgents: text('validated_by_agents'), // JSON
  
  relevanceScore: real('relevance_score').default(1.0),
  usageCount: integer('usage_count').default(0),
  tags: text('tags'), // JSON
  
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  supersededBy: text('superseded_by').references(() => collaborationKnowledgeTable.id),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const agentInteractionsRelations = relations(agentInteractionsTable, ({ one }) => ({
  execution: one(workflowExecutionsTable, {
    fields: [agentInteractionsTable.workflowExecutionId],
    references: [workflowExecutionsTable.id],
  }),
  fromAgent: one(agentsTable, {
    fields: [agentInteractionsTable.fromAgentId],
    references: [agentsTable.id],
  }),
  toAgent: one(agentsTable, {
    fields: [agentInteractionsTable.toAgentId],
    references: [agentsTable.id],
  }),
}));

export const collaborationKnowledgeRelations = relations(collaborationKnowledgeTable, ({ one }) => ({
  workflow: one(collaborationWorkflowsTable, {
    fields: [collaborationKnowledgeTable.workflowId],
    references: [collaborationWorkflowsTable.id],
  }),
  createdByAgent: one(agentsTable, {
    fields: [collaborationKnowledgeTable.createdByAgentId],
    references: [agentsTable.id],
  }),
}));

// Additional types
export type SelectAgentInteraction = typeof agentInteractionsTable.$inferSelect;
export type InsertAgentInteraction = typeof agentInteractionsTable.$inferInsert;
export type SelectCollaborationKnowledge = typeof collaborationKnowledgeTable.$inferSelect;
export type InsertCollaborationKnowledge = typeof collaborationKnowledgeTable.$inferInsert;
```

### 2. Agent Coordination Service

```typescript
// src/main/agents/collaboration/coordination.service.ts
import { eq, and, desc } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { 
  agentInteractionsTable, 
  collaborationKnowledgeTable,
  workflowExecutionsTable 
} from './collaboration.schema';
import { AgentService } from '../agent.service';
import { LlmProviderService } from '../../llm/llm-provider.service';
import { MemoryService } from '../memory.service';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import type { 
  AgentInteraction, 
  CollaborationKnowledge,
  WorkflowStep,
  InsertAgentInteraction,
  InsertCollaborationKnowledge 
} from './collaboration.types';

export class AgentCoordinationService {
  constructor(
    private executionId: string,
    private coordinatorAgentId: string | null,
    private participatingAgents: string[]
  ) {}

  // Execute a workflow step with agent coordination
  async executeStep(step: WorkflowStep, assignedAgentId: string): Promise<any> {
    try {
      console.log(`Starting step ${step.name} with agent ${assignedAgentId}`);

      // Get agent details
      const agent = await AgentService.findById(assignedAgentId);
      if (!agent) {
        throw new Error(`Agent ${assignedAgentId} not found`);
      }

      // Get LLM provider
      const provider = await LlmProviderService.findById(agent.llmProviderId);
      if (!provider) {
        throw new Error('Agent LLM provider not found');
      }

      // Gather relevant knowledge for the step
      const relevantKnowledge = await this.gatherRelevantKnowledge(step);
      
      // Create execution context
      const context = await this.buildExecutionContext(step, relevantKnowledge);

      // Record step start interaction
      await this.recordInteraction({
        fromAgentId: assignedAgentId,
        interactionType: 'coordination',
        message: `Starting step: ${step.name}`,
        contextData: { stepId: step.id, stepType: step.type },
        relatedStepId: step.id,
      });

      // Execute step with AI
      const result = await this.executeStepWithAI(step, agent, provider, context);

      // Record step completion
      await this.recordInteraction({
        fromAgentId: assignedAgentId,
        interactionType: 'coordination',
        message: `Completed step: ${step.name}`,
        contextData: { 
          stepId: step.id, 
          result: result.summary || 'Step completed successfully',
          tokensUsed: result.tokensUsed || 0
        },
        relatedStepId: step.id,
      });

      // Share knowledge if valuable insights were generated
      if (result.insights?.length > 0) {
        await this.shareKnowledge(
          assignedAgentId,
          `Insights from ${step.name}`,
          result.insights,
          'insight'
        );
      }

      // Share any decisions made
      if (result.decisions?.length > 0) {
        await this.shareKnowledge(
          assignedAgentId,
          `Decisions from ${step.name}`,
          result.decisions,
          'decision'
        );
      }

      console.log(`Step ${step.name} completed successfully`);
      return result;

    } catch (error) {
      console.error(`Step ${step.name} failed:`, error);
      
      // Record failure
      await this.recordInteraction({
        fromAgentId: assignedAgentId,
        interactionType: 'coordination',
        message: `Step failed: ${step.name} - ${error instanceof Error ? error.message : 'Unknown error'}`,
        contextData: { stepId: step.id, error: true, errorMessage: error instanceof Error ? error.message : 'Unknown error' },
        relatedStepId: step.id,
      });

      throw error;
    }
  }

  // Request agent assignment from coordinator
  async requestAgentAssignment(step: WorkflowStep): Promise<string> {
    if (!this.coordinatorAgentId) {
      // Simple assignment: find agent with required skills
      return this.findBestAgent(step);
    }

    try {
      console.log(`Requesting agent assignment for step: ${step.name}`);
      
      // Ask coordinator agent to assign
      const coordinator = await AgentService.findById(this.coordinatorAgentId);
      if (!coordinator) {
        return this.findBestAgent(step);
      }

      const provider = await LlmProviderService.findById(coordinator.llmProviderId);
      if (!provider) {
        return this.findBestAgent(step);
      }

      const aiProvider = this.createAIProvider(provider);

      const agentDetails = await this.getAgentDetails();
      const prompt = `As a workflow coordinator, assign the best agent for this step:

Step: ${step.name}
Description: ${step.description}
Type: ${step.type}
Required Skills: ${step.requiredSkills.join(', ')}
Instructions: ${step.instructions}
Expected Output: ${step.expectedOutput}

Available Agents:
${agentDetails.map(agent => 
  `- ID: ${agent.id}, Name: ${agent.name}, Role: ${agent.role}, Skills: ${agent.skills?.join(', ') || 'General skills'}`
).join('\n')}

Consider:
1. Agent skills matching step requirements
2. Current workload distribution
3. Agent specialization and experience level
4. Previous performance in similar tasks

Return only the agent ID of the best match (just the ID, nothing else).`;

      const response = await generateText({
        model: aiProvider(provider.model || 'gpt-4o-mini'),
        prompt,
        temperature: 0.3,
        maxTokens: 100,
      });

      const assignedAgentId = response.text.trim();
      
      // Validate assignment
      if (this.participatingAgents.includes(assignedAgentId)) {
        // Record coordination decision
        await this.recordInteraction({
          fromAgentId: this.coordinatorAgentId,
          interactionType: 'task_delegation',
          message: `Assigned ${step.name} to agent ${assignedAgentId}`,
          contextData: { 
            stepId: step.id, 
            assignedAgentId,
            reasoning: 'Coordinator-based assignment'
          },
          relatedStepId: step.id,
        });

        console.log(`Coordinator assigned step ${step.name} to agent ${assignedAgentId}`);
        return assignedAgentId;
      }
    } catch (error) {
      console.error('Coordinator assignment failed:', error);
    }

    // Fallback to simple assignment
    return this.findBestAgent(step);
  }

  // Find best agent for step based on skills
  private async findBestAgent(step: WorkflowStep): Promise<string> {
    // Simple heuristic: prefer agents whose skills match step requirements
    const agentDetails = await this.getAgentDetails();
    
    // Score agents based on skill matching
    const agentScores = agentDetails.map(agent => {
      const skillMatches = step.requiredSkills.filter(skill => 
        agent.skills?.some(agentSkill => 
          agentSkill.toLowerCase().includes(skill.toLowerCase()) ||
          skill.toLowerCase().includes(agentSkill.toLowerCase())
        ) || false
      ).length;
      
      return {
        agentId: agent.id,
        score: skillMatches,
      };
    });

    // Sort by score (highest first) and return best match
    agentScores.sort((a, b) => b.score - a.score);
    const bestAgent = agentScores[0]?.agentId || this.participatingAgents[0];

    console.log(`Simple assignment: step ${step.name} assigned to agent ${bestAgent}`);
    return bestAgent;
  }

  // Execute step with AI
  private async executeStepWithAI(
    step: WorkflowStep,
    agent: any,
    provider: any,
    context: string
  ): Promise<any> {
    const aiProvider = this.createAIProvider(provider);
    const modelConfig = JSON.parse(agent.modelParameters || '{}');

    const systemPrompt = `You are ${agent.name}, a ${agent.role}.

${agent.backstory}

You are working as part of a collaborative team on a workflow. Your role is to complete the assigned step with high quality and professionalism.

Team Context:
${context}

When completing tasks, please:
1. Follow the step instructions carefully
2. Provide clear, actionable outputs
3. Share any insights or recommendations for the team
4. Note any questions or concerns for other team members
5. Be thorough but concise in your response

Structure your response as follows:
## Summary
[Brief summary of what you accomplished]

## Output
[The actual deliverable/result for this step]

## Insights
[Any valuable insights or learnings]

## Decisions
[Any decisions you made during this step]

## Questions/Concerns
[Any issues or questions for the team]`;

    const prompt = `Step: ${step.name}

Description: ${step.description}

Instructions: ${step.instructions}

Expected Output: ${step.expectedOutput}

Please complete this step thoroughly and provide the structured response format requested.`;

    const response = await generateText({
      model: aiProvider(provider.model || 'gpt-4o-mini'),
      system: systemPrompt,
      prompt,
      temperature: modelConfig.temperature || 0.5,
      maxTokens: modelConfig.maxTokens || 2000,
    });

    // Parse response and extract structured information
    const result = this.parseStepResult(response.text);
    
    return {
      summary: result.summary || `Completed ${step.name}`,
      output: result.output || response.text,
      insights: result.insights || [],
      decisions: result.decisions || [],
      questions: result.questions || [],
      rawResponse: response.text,
      tokensUsed: response.usage?.totalTokens || 0,
    };
  }

  // Parse step result from AI response
  private parseStepResult(response: string): any {
    try {
      const result: any = {
        insights: [],
        decisions: [],
        questions: [],
      };

      // Split response into sections
      const sections = response.split(/##\s+/);
      
      for (const section of sections) {
        const lines = section.trim().split('\n');
        const header = lines[0]?.toLowerCase().trim();
        const content = lines.slice(1).join('\n').trim();

        if (header.includes('summary')) {
          result.summary = content;
        } else if (header.includes('output')) {
          result.output = content;
        } else if (header.includes('insight')) {
          result.insights = content.split('\n').filter(line => line.trim());
        } else if (header.includes('decision')) {
          result.decisions = content.split('\n').filter(line => line.trim());
        } else if (header.includes('question') || header.includes('concern')) {
          result.questions = content.split('\n').filter(line => line.trim());
        }
      }

      return result;
    } catch (error) {
      console.error('Failed to parse step result:', error);
      return {
        summary: 'Step completed',
        output: response,
        insights: [],
        decisions: [],
        questions: [],
      };
    }
  }

  // Build execution context for step
  private async buildExecutionContext(
    step: WorkflowStep,
    knowledge: CollaborationKnowledge[]
  ): Promise<string> {
    let context = `Step Context:\n`;
    context += `- Step Name: ${step.name}\n`;
    context += `- Step Type: ${step.type}\n`;
    context += `- Required Skills: ${step.requiredSkills.join(', ')}\n`;

    if (step.dependsOn.length > 0) {
      context += `- Depends on steps: ${step.dependsOn.join(', ')}\n`;
    }

    if (step.validationCriteria && step.validationCriteria.length > 0) {
      context += `- Validation Criteria: ${step.validationCriteria.join(', ')}\n`;
    }

    if (knowledge.length > 0) {
      context += `\nRelevant Team Knowledge:\n`;
      knowledge.forEach(item => {
        context += `- ${item.title} (${item.knowledgeType}): ${item.content}\n`;
      });
    }

    return context;
  }

  // Gather relevant knowledge for step execution
  private async gatherRelevantKnowledge(step: WorkflowStep): Promise<CollaborationKnowledge[]> {
    const db = getDatabase();

    // Get workflow ID from execution
    const [execution] = await db
      .select()
      .from(workflowExecutionsTable)
      .where(eq(workflowExecutionsTable.id, this.executionId))
      .limit(1);

    if (!execution) {
      return [];
    }

    const knowledge = await db
      .select()
      .from(collaborationKnowledgeTable)
      .where(and(
        eq(collaborationKnowledgeTable.workflowId, execution.workflowId),
        eq(collaborationKnowledgeTable.isActive, true)
      ))
      .orderBy(desc(collaborationKnowledgeTable.relevanceScore))
      .limit(5); // Get top 5 most relevant items

    return knowledge.map(item => ({
      ...item,
      validatedByAgents: item.validatedByAgents ? JSON.parse(item.validatedByAgents) : [],
      tags: item.tags ? JSON.parse(item.tags) : [],
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  }

  // Share knowledge with team
  private async shareKnowledge(
    agentId: string,
    title: string,
    content: string | string[],
    type: string
  ): Promise<void> {
    const db = getDatabase();

    // Get workflow ID from execution
    const [execution] = await db
      .select()
      .from(workflowExecutionsTable)
      .where(eq(workflowExecutionsTable.id, this.executionId))
      .limit(1);

    if (!execution) {
      return;
    }

    const knowledgeContent = Array.isArray(content) ? content.join('\n') : content;

    const knowledgeData: InsertCollaborationKnowledge = {
      workflowId: execution.workflowId,
      title,
      content: knowledgeContent,
      knowledgeType: type,
      createdByAgentId: agentId,
      validatedByAgents: JSON.stringify([]),
      tags: JSON.stringify([]),
    };

    await db.insert(collaborationKnowledgeTable).values(knowledgeData);

    // Record knowledge sharing interaction
    await this.recordInteraction({
      fromAgentId: agentId,
      interactionType: 'knowledge_sharing',
      message: `Shared knowledge: ${title}`,
      contextData: { 
        knowledgeType: type, 
        content: knowledgeContent.substring(0, 200) + (knowledgeContent.length > 200 ? '...' : '')
      },
    });

    console.log(`Agent ${agentId} shared knowledge: ${title}`);
  }

  // Record agent interaction
  private async recordInteraction(interaction: Omit<AgentInteraction, 'id' | 'workflowExecutionId' | 'createdAt' | 'respondedAt' | 'responseReceived'>): Promise<void> {
    const db = getDatabase();

    const interactionData: InsertAgentInteraction = {
      workflowExecutionId: this.executionId,
      fromAgentId: interaction.fromAgentId,
      toAgentId: interaction.toAgentId,
      interactionType: interaction.interactionType,
      message: interaction.message,
      contextData: interaction.contextData ? JSON.stringify(interaction.contextData) : null,
      relatedStepId: interaction.relatedStepId,
      relatedTaskId: interaction.relatedTaskId,
      requiresResponse: interaction.requiresResponse || false,
      responseDeadline: interaction.responseDeadline,
      responseMessage: interaction.responseMessage,
      responseData: interaction.responseData ? JSON.stringify(interaction.responseData) : null,
    };

    await db.insert(agentInteractionsTable).values(interactionData);
  }

  // Get agent details for coordination
  private async getAgentDetails(): Promise<any[]> {
    const agents = [];
    
    for (const agentId of this.participatingAgents) {
      try {
        const agent = await AgentService.findById(agentId);
        if (agent) {
          agents.push({
            id: agent.id,
            name: agent.name,
            role: agent.role,
            skills: [], // Could be enhanced with actual skills data from agent configuration
          });
        }
      } catch (error) {
        console.error(`Failed to get agent details for ${agentId}:`, error);
      }
    }

    return agents;
  }

  // Create AI provider instance
  private createAIProvider(provider: any) {
    switch (provider.type) {
      case 'openai':
        return createOpenAI({
          apiKey: provider.apiKey,
        });
      case 'deepseek':
        return createDeepSeek({
          apiKey: provider.apiKey,
        });
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }

  // Get execution interactions
  async getExecutionInteractions(): Promise<AgentInteraction[]> {
    const db = getDatabase();

    const interactions = await db
      .select()
      .from(agentInteractionsTable)
      .where(eq(agentInteractionsTable.workflowExecutionId, this.executionId))
      .orderBy(agentInteractionsTable.createdAt);

    return interactions.map(interaction => ({
      ...interaction,
      contextData: interaction.contextData ? JSON.parse(interaction.contextData) : undefined,
      responseData: interaction.responseData ? JSON.parse(interaction.responseData) : undefined,
      createdAt: new Date(interaction.createdAt),
      respondedAt: interaction.respondedAt ? new Date(interaction.respondedAt) : undefined,
    }));
  }

  // Get workflow knowledge
  async getWorkflowKnowledge(): Promise<CollaborationKnowledge[]> {
    const db = getDatabase();

    // Get workflow ID from execution
    const [execution] = await db
      .select()
      .from(workflowExecutionsTable)
      .where(eq(workflowExecutionsTable.id, this.executionId))
      .limit(1);

    if (!execution) {
      return [];
    }

    const knowledge = await db
      .select()
      .from(collaborationKnowledgeTable)
      .where(eq(collaborationKnowledgeTable.workflowId, execution.workflowId))
      .orderBy(desc(collaborationKnowledgeTable.createdAt));

    return knowledge.map(item => ({
      ...item,
      validatedByAgents: item.validatedByAgents ? JSON.parse(item.validatedByAgents) : [],
      tags: item.tags ? JSON.parse(item.tags) : [],
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));
  }
}
```

### 3. Enhanced Workflow Service

```typescript
// Update src/main/agents/collaboration/workflow.service.ts
import { AgentCoordinationService } from './coordination.service';

export class WorkflowService {
  // ... existing methods ...

  // Start workflow execution with coordination
  static async startWorkflow(
    workflowId: string, 
    userId: string,
    triggerReason: string = 'manual'
  ): Promise<WorkflowExecution> {
    const db = getDatabase();

    // Get workflow
    const [workflow] = await db
      .select()
      .from(collaborationWorkflowsTable)
      .where(and(
        eq(collaborationWorkflowsTable.id, workflowId),
        eq(collaborationWorkflowsTable.userId, userId)
      ))
      .limit(1);

    if (!workflow) {
      throw new Error('Workflow not found or access denied');
    }

    if (workflow.status !== 'draft' && workflow.status !== 'paused') {
      throw new Error(`Cannot start workflow in status: ${workflow.status}`);
    }

    // Create execution record
    const execution = await this.createExecution(workflowId, userId, triggerReason);

    // Update workflow status
    await this.updateStatus(workflowId, 'active', {
      startedAt: new Date(),
      currentStep: 0,
    });

    // Start processing workflow in background
    this.processWorkflowAsync(execution.id).catch(error => {
      console.error(`Background workflow processing failed for ${execution.id}:`, error);
    });

    return execution;
  }

  // Process workflow execution with coordination
  private static async processWorkflowAsync(executionId: string): Promise<void> {
    const db = getDatabase();

    try {
      console.log(`Starting workflow processing for execution: ${executionId}`);

      const [execution] = await db
        .select()
        .from(workflowExecutionsTable)
        .where(eq(workflowExecutionsTable.id, executionId))
        .limit(1);

      if (!execution) {
        throw new Error('Execution not found');
      }

      const [workflow] = await db
        .select()
        .from(collaborationWorkflowsTable)
        .where(eq(collaborationWorkflowsTable.id, execution.workflowId))
        .limit(1);

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const configuration = JSON.parse(workflow.configuration);
      const participatingAgents = JSON.parse(workflow.participatingAgents);

      // Update execution status
      await db
        .update(workflowExecutionsTable)
        .set({
          status: 'running',
          updatedAt: new Date(),
        })
        .where(eq(workflowExecutionsTable.id, executionId));

      // Create coordination service
      const coordinationService = new AgentCoordinationService(
        execution.id, 
        workflow.coordinatorAgentId, 
        participatingAgents
      );

      // Process workflow steps
      await this.executeWorkflowSteps(
        execution, 
        workflow, 
        configuration, 
        coordinationService
      );

      // Mark execution as completed
      await db
        .update(workflowExecutionsTable)
        .set({
          status: 'completed',
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(workflowExecutionsTable.id, executionId));

      // Mark workflow as completed
      const actualDuration = new Date().getTime() - new Date(workflow.startedAt || 0).getTime();
      await this.updateStatus(workflow.id, 'completed', {
        completedAt: new Date(),
        actualDuration: Math.round(actualDuration / 1000),
      });

      console.log(`Workflow processing completed for execution: ${executionId}`);

    } catch (error) {
      console.error('Workflow processing failed:', error);
      
      // Mark execution as failed
      await db
        .update(workflowExecutionsTable)
        .set({
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(workflowExecutionsTable.id, executionId));

      // Mark workflow as failed
      await this.updateStatus(execution.workflowId, 'failed');
    }
  }

  // Execute workflow steps with agent coordination
  private static async executeWorkflowSteps(
    execution: any,
    workflow: any,
    configuration: any,
    coordinationService: AgentCoordinationService
  ): Promise<void> {
    const db = getDatabase();
    const steps = configuration.steps;
    
    console.log(`Executing ${steps.length} workflow steps`);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      try {
        console.log(`Processing step ${i + 1}/${steps.length}: ${step.name}`);

        // Update current step
        await db
          .update(workflowExecutionsTable)
          .set({
            currentStepId: step.id,
            updatedAt: new Date(),
          })
          .where(eq(workflowExecutionsTable.id, execution.id));

        // Update workflow progress
        await db
          .update(collaborationWorkflowsTable)
          .set({
            currentStep: i + 1,
            updatedAt: new Date(),
          })
          .where(eq(collaborationWorkflowsTable.id, workflow.id));

        // Assign agent to step
        const assignedAgent = await coordinationService.requestAgentAssignment(step);

        // Update agent assignments
        const currentAssignments = JSON.parse(execution.agentAssignments || '{}');
        currentAssignments[step.id] = assignedAgent;
        
        await db
          .update(workflowExecutionsTable)
          .set({
            agentAssignments: JSON.stringify(currentAssignments),
            updatedAt: new Date(),
          })
          .where(eq(workflowExecutionsTable.id, execution.id));

        // Execute step with assigned agent
        const stepResult = await coordinationService.executeStep(step, assignedAgent);
        
        // Store step result
        const currentResults = JSON.parse(execution.stepResults || '{}');
        currentResults[step.id] = stepResult;
        
        await db
          .update(workflowExecutionsTable)
          .set({
            stepResults: JSON.stringify(currentResults),
            updatedAt: new Date(),
          })
          .where(eq(workflowExecutionsTable.id, execution.id));

        console.log(`Step ${step.name} completed successfully`);

      } catch (error) {
        console.error(`Step ${step.id} failed:`, error);
        throw error;
      }
    }

    console.log('All workflow steps completed successfully');
  }

  // Get execution interactions
  static async getExecutionInteractions(executionId: string): Promise<any[]> {
    const coordinationService = new AgentCoordinationService(executionId, null, []);
    return coordinationService.getExecutionInteractions();
  }

  // Get workflow knowledge
  static async getWorkflowKnowledge(executionId: string): Promise<any[]> {
    const coordinationService = new AgentCoordinationService(executionId, null, []);
    return coordinationService.getWorkflowKnowledge();
  }
}
```

### 4. Enhanced IPC Handlers

```typescript
// Update src/main/agents/collaboration/collaboration.handlers.ts
export function setupCollaborationHandlers(): void {
  // ... existing handlers ...

  // Start workflow
  ipcMain.handle(
    'collaboration:startWorkflow',
    async (_, workflowId: string): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const execution = await WorkflowService.startWorkflow(workflowId, userId);
        return { success: true, data: execution };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to start workflow',
        };
      }
    }
  );

  // Get execution interactions
  ipcMain.handle(
    'collaboration:getInteractions',
    async (_, executionId: string): Promise<IpcResponse> => {
      try {
        const interactions = await WorkflowService.getExecutionInteractions(executionId);
        return { success: true, data: interactions };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get interactions',
        };
      }
    }
  );

  // Get workflow knowledge
  ipcMain.handle(
    'collaboration:getKnowledge',
    async (_, executionId: string): Promise<IpcResponse> => {
      try {
        const knowledge = await WorkflowService.getWorkflowKnowledge(executionId);
        return { success: true, data: knowledge };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get knowledge',
        };
      }
    }
  );
}
```

## Validation Checkpoints

### Checkpoint 1: Agent Coordination
- Test intelligent agent assignment based on skills
- Verify coordinator-based vs simple assignment logic
- Test agent-to-agent communication recording
- Validate step execution with proper error handling

### Checkpoint 2: Knowledge Sharing
- Test knowledge creation and storage during execution
- Verify knowledge retrieval for context building
- Test knowledge validation and relevance scoring
- Validate knowledge sharing between agents

### Checkpoint 3: Workflow Execution
- Test end-to-end workflow execution with multiple agents
- Verify background processing and status updates
- Test execution failure recovery and error handling
- Validate execution history and interaction tracking

## Success Criteria

✅ **Intelligent Coordination**: Agents are assigned to tasks based on skills and capabilities
✅ **Seamless Communication**: Agents communicate and share context effectively
✅ **Knowledge Management**: Insights and decisions are captured and shared
✅ **Robust Execution**: Workflow execution handles errors gracefully
✅ **Real-time Tracking**: Complete visibility into agent interactions and progress

## Next Steps

After completing agent coordination:
1. **Move to Task 12C**: Implement workflow builder and monitoring interface
2. **Performance Optimization**: Optimize multi-agent coordination for larger teams
3. **Advanced Features**: Add conditional workflows and recursive patterns

This task creates the intelligent coordination engine that enables multiple AI agents to work together effectively, sharing knowledge and executing complex workflows collaboratively.