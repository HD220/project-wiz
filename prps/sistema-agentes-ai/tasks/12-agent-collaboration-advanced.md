# Task 12: Agent Collaboration - Advanced

## Overview

Implement an advanced multi-agent collaboration system that enables agents to work together on complex tasks, coordinate activities, share knowledge, and execute sophisticated workflows. This system creates a true "AI team" where specialized agents collaborate like human team members to solve complex problems.

## User Value

After completing this task, users can:
- Create multi-agent workflows for complex projects
- Watch agents collaborate and delegate tasks between each other
- Benefit from specialized agent expertise working in concert
- Execute sophisticated development workflows automatically
- Scale from single-agent tasks to full team coordination

## Technical Requirements

### Database Schema

```sql
-- Collaboration workflows for multi-agent coordination
CREATE TABLE collaboration_workflows (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    project_id TEXT REFERENCES projects(id),
    
    -- Workflow definition
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    workflow_type TEXT NOT NULL DEFAULT 'pipeline', -- pipeline, parallel, conditional, recursive
    
    -- Configuration
    configuration TEXT NOT NULL, -- JSON workflow definition
    participating_agents TEXT NOT NULL, -- JSON array of agent IDs
    coordinator_agent_id TEXT REFERENCES agents(id), -- Lead agent for coordination
    
    -- Execution
    status TEXT NOT NULL DEFAULT 'draft', -- draft, active, paused, completed, failed
    current_step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 0,
    
    -- Results and metrics
    execution_history TEXT, -- JSON array of execution records
    collaboration_metrics TEXT, -- JSON with performance metrics
    final_result TEXT, -- JSON with workflow results
    
    -- Timing
    started_at INTEGER, -- When workflow execution began
    completed_at INTEGER, -- When workflow finished
    estimated_duration INTEGER, -- Expected completion time in seconds
    actual_duration INTEGER, -- Actual time taken
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Workflow executions for tracking runs
CREATE TABLE workflow_executions (
    id TEXT PRIMARY KEY,
    workflow_id TEXT NOT NULL REFERENCES collaboration_workflows(id) ON DELETE CASCADE,
    
    -- Execution details
    execution_number INTEGER NOT NULL, -- Sequential execution number
    trigger_reason TEXT NOT NULL, -- manual, scheduled, event, dependency
    triggered_by TEXT, -- User ID or system trigger
    
    -- State management
    current_step_id TEXT,
    execution_context TEXT, -- JSON with shared context between agents
    step_results TEXT, -- JSON with results from each step
    
    -- Agent coordination
    active_agents TEXT, -- JSON array of currently working agent IDs
    agent_assignments TEXT, -- JSON mapping steps to responsible agents
    
    -- Status and results
    status TEXT NOT NULL DEFAULT 'pending', -- pending, running, paused, completed, failed, cancelled
    error_message TEXT,
    final_output TEXT, -- JSON with final results
    
    started_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    completed_at INTEGER,
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

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

-- Workflow templates for reusable collaboration patterns
CREATE TABLE workflow_templates (
    id TEXT PRIMARY KEY,
    
    -- Template definition
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL, -- development, review, analysis, research, testing
    
    -- Template structure
    template_definition TEXT NOT NULL, -- JSON workflow template
    required_agent_roles TEXT NOT NULL, -- JSON array of required roles
    recommended_agent_count INTEGER DEFAULT 2,
    
    -- Configuration
    is_system_template BOOLEAN DEFAULT FALSE,
    created_by_user_id TEXT REFERENCES users(id),
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0.0, -- Percentage of successful executions
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

### Core Types

```typescript
// Workflow and collaboration types
export interface CollaborationWorkflow {
  id: string;
  userId: string;
  projectId?: string;
  
  // Definition
  name: string;
  description: string;
  workflowType: WorkflowType;
  
  // Configuration
  configuration: WorkflowConfiguration;
  participatingAgents: string[]; // Agent IDs
  coordinatorAgentId?: string;
  
  // Execution
  status: WorkflowStatus;
  currentStep: number;
  totalSteps: number;
  
  // Results
  executionHistory: ExecutionRecord[];
  collaborationMetrics?: CollaborationMetrics;
  finalResult?: any;
  
  // Timing
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export type WorkflowType = 'pipeline' | 'parallel' | 'conditional' | 'recursive';
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'completed' | 'failed';

export interface WorkflowConfiguration {
  steps: WorkflowStep[];
  coordination: {
    communicationStyle: 'formal' | 'casual' | 'technical';
    decisionMaking: 'consensus' | 'coordinator' | 'majority';
    knowledgeSharing: boolean;
  };
  constraints: {
    maxExecutionTime?: number;
    maxRetries?: number;
    allowParallelExecution?: boolean;
  };
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: StepType;
  
  // Agent assignment
  assignedAgentRole?: string;
  preferredAgentId?: string;
  requiredSkills: string[];
  
  // Dependencies
  dependsOn: string[]; // Other step IDs
  canRunInParallel: boolean;
  
  // Configuration
  instructions: string;
  expectedOutput: string;
  timeoutMinutes?: number;
  
  // Validation
  validationCriteria?: string[];
  reviewRequired?: boolean;
  reviewerRole?: string;
}

export type StepType = 
  | 'analysis' 
  | 'implementation' 
  | 'review' 
  | 'testing' 
  | 'documentation' 
  | 'coordination' 
  | 'decision';

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  executionNumber: number;
  triggerReason: TriggerReason;
  triggeredBy?: string;
  
  // State
  currentStepId?: string;
  executionContext: Record<string, any>;
  stepResults: Record<string, any>;
  
  // Agent coordination
  activeAgents: string[];
  agentAssignments: Record<string, string>; // stepId -> agentId
  
  // Status
  status: ExecutionStatus;
  errorMessage?: string;
  finalOutput?: any;
  
  startedAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export type TriggerReason = 'manual' | 'scheduled' | 'event' | 'dependency';
export type ExecutionStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface AgentInteraction {
  id: string;
  workflowExecutionId: string;
  
  // Participants
  fromAgentId: string;
  toAgentId?: string; // NULL for broadcasts
  
  // Interaction
  interactionType: InteractionType;
  message: string;
  contextData?: Record<string, any>;
  
  // References
  relatedStepId?: string;
  relatedTaskId?: string;
  
  // Response
  requiresResponse: boolean;
  responseDeadline?: Date;
  responseReceived: boolean;
  responseMessage?: string;
  responseData?: any;
  
  createdAt: Date;
  respondedAt?: Date;
}

export type InteractionType = 
  | 'task_delegation' 
  | 'knowledge_sharing' 
  | 'coordination' 
  | 'feedback' 
  | 'question';

export interface CollaborationKnowledge {
  id: string;
  workflowId: string;
  
  // Content
  title: string;
  content: string;
  knowledgeType: KnowledgeType;
  
  // Attribution
  createdByAgentId: string;
  validatedByAgents: string[];
  
  // Relevance
  relevanceScore: number;
  usageCount: number;
  tags: string[];
  
  // Lifecycle
  isActive: boolean;
  supersededBy?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type KnowledgeType = 
  | 'insight' 
  | 'decision' 
  | 'resource' 
  | 'constraint' 
  | 'best_practice';

export interface CollaborationMetrics {
  totalInteractions: number;
  averageResponseTime: number; // in minutes
  knowledgeItemsCreated: number;
  collaborationScore: number; // 1-10 how well agents worked together
  efficiencyRating: number; // 1-10 how efficiently the workflow executed
  qualityScore: number; // 1-10 quality of final output
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  templateDefinition: WorkflowConfiguration;
  requiredAgentRoles: string[];
  recommendedAgentCount: number;
  isSystemTemplate: boolean;
  createdByUserId?: string;
  usageCount: number;
  successRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export type TemplateCategory = 
  | 'development' 
  | 'review' 
  | 'analysis' 
  | 'research' 
  | 'testing';

export interface CreateWorkflowRequest {
  name: string;
  description: string;
  workflowType: WorkflowType;
  participatingAgents: string[];
  coordinatorAgentId?: string;
  configuration: WorkflowConfiguration;
}

export interface ExecutionRecord {
  timestamp: Date;
  stepId: string;
  agentId: string;
  action: string;
  result: any;
  duration: number;
}
```

## Implementation Steps

### 1. Database Schema and Types

```typescript
// src/main/agents/collaboration/collaboration.schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { usersTable } from '../../user/users.schema';
import { agentsTable } from '../agents.schema';
import { projectsTable } from '../../project/projects.schema';

export const collaborationWorkflowsTable = sqliteTable('collaboration_workflows', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => usersTable.id),
  projectId: text('project_id').references(() => projectsTable.id),
  
  name: text('name').notNull(),
  description: text('description').notNull(),
  workflowType: text('workflow_type').notNull().default('pipeline'),
  
  configuration: text('configuration').notNull(), // JSON
  participatingAgents: text('participating_agents').notNull(), // JSON
  coordinatorAgentId: text('coordinator_agent_id').references(() => agentsTable.id),
  
  status: text('status').notNull().default('draft'),
  currentStep: integer('current_step').default(0),
  totalSteps: integer('total_steps').default(0),
  
  executionHistory: text('execution_history'), // JSON
  collaborationMetrics: text('collaboration_metrics'), // JSON
  finalResult: text('final_result'), // JSON
  
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  estimatedDuration: integer('estimated_duration'),
  actualDuration: integer('actual_duration'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const workflowExecutionsTable = sqliteTable('workflow_executions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workflowId: text('workflow_id').notNull().references(() => collaborationWorkflowsTable.id, { onDelete: 'cascade' }),
  
  executionNumber: integer('execution_number').notNull(),
  triggerReason: text('trigger_reason').notNull(),
  triggeredBy: text('triggered_by'),
  
  currentStepId: text('current_step_id'),
  executionContext: text('execution_context'), // JSON
  stepResults: text('step_results'), // JSON
  
  activeAgents: text('active_agents'), // JSON
  agentAssignments: text('agent_assignments'), // JSON
  
  status: text('status').notNull().default('pending'),
  errorMessage: text('error_message'),
  finalOutput: text('final_output'), // JSON
  
  startedAt: integer('started_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

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

export const workflowTemplatesTable = sqliteTable('workflow_templates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  
  templateDefinition: text('template_definition').notNull(), // JSON
  requiredAgentRoles: text('required_agent_roles').notNull(), // JSON
  recommendedAgentCount: integer('recommended_agent_count').default(2),
  
  isSystemTemplate: integer('is_system_template', { mode: 'boolean' }).default(false),
  createdByUserId: text('created_by_user_id').references(() => usersTable.id),
  
  usageCount: integer('usage_count').default(0),
  successRate: real('success_rate').default(0.0),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const collaborationWorkflowsRelations = relations(collaborationWorkflowsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [collaborationWorkflowsTable.userId],
    references: [usersTable.id],
  }),
  project: one(projectsTable, {
    fields: [collaborationWorkflowsTable.projectId],
    references: [projectsTable.id],
  }),
  coordinator: one(agentsTable, {
    fields: [collaborationWorkflowsTable.coordinatorAgentId],
    references: [agentsTable.id],
  }),
  executions: many(workflowExecutionsTable),
  knowledge: many(collaborationKnowledgeTable),
}));

export const workflowExecutionsRelations = relations(workflowExecutionsTable, ({ one, many }) => ({
  workflow: one(collaborationWorkflowsTable, {
    fields: [workflowExecutionsTable.workflowId],
    references: [collaborationWorkflowsTable.id],
  }),
  interactions: many(agentInteractionsTable),
}));

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

// Type inference
export type SelectCollaborationWorkflow = typeof collaborationWorkflowsTable.$inferSelect;
export type InsertCollaborationWorkflow = typeof collaborationWorkflowsTable.$inferInsert;
export type SelectWorkflowExecution = typeof workflowExecutionsTable.$inferSelect;
export type InsertWorkflowExecution = typeof workflowExecutionsTable.$inferInsert;
export type SelectAgentInteraction = typeof agentInteractionsTable.$inferSelect;
export type InsertAgentInteraction = typeof agentInteractionsTable.$inferInsert;
export type SelectCollaborationKnowledge = typeof collaborationKnowledgeTable.$inferSelect;
export type InsertCollaborationKnowledge = typeof collaborationKnowledgeTable.$inferInsert;
export type SelectWorkflowTemplate = typeof workflowTemplatesTable.$inferSelect;
export type InsertWorkflowTemplate = typeof workflowTemplatesTable.$inferInsert;
```

### 2. Workflow Management Service

```typescript
// src/main/agents/collaboration/workflow.service.ts
import { eq, and, desc } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { 
  collaborationWorkflowsTable, 
  workflowExecutionsTable,
  workflowTemplatesTable 
} from './collaboration.schema';
import { AgentService } from '../agent.service';
import type { 
  CreateWorkflowRequest, 
  CollaborationWorkflow, 
  WorkflowExecution,
  WorkflowTemplate 
} from './collaboration.types';

export class WorkflowService {
  // Create a new collaboration workflow
  static async createWorkflow(
    request: CreateWorkflowRequest, 
    userId: string
  ): Promise<CollaborationWorkflow> {
    const db = getDatabase();

    // Validate participating agents
    for (const agentId of request.participatingAgents) {
      const agent = await AgentService.findById(agentId);
      if (!agent || agent.userId !== userId) {
        throw new Error(`Agent ${agentId} not found or access denied`);
      }
    }

    // Validate coordinator agent if specified
    if (request.coordinatorAgentId) {
      const coordinator = await AgentService.findById(request.coordinatorAgentId);
      if (!coordinator || coordinator.userId !== userId) {
        throw new Error('Coordinator agent not found or access denied');
      }
    }

    const workflowData = {
      userId,
      name: request.name,
      description: request.description,
      workflowType: request.workflowType,
      configuration: JSON.stringify(request.configuration),
      participatingAgents: JSON.stringify(request.participatingAgents),
      coordinatorAgentId: request.coordinatorAgentId,
      totalSteps: request.configuration.steps.length,
      executionHistory: JSON.stringify([]),
    };

    const [workflow] = await db
      .insert(collaborationWorkflowsTable)
      .values(workflowData)
      .returning();

    if (!workflow) {
      throw new Error('Failed to create workflow');
    }

    return this.parseWorkflow(workflow);
  }

  // Start workflow execution
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

    // Get next execution number
    const executions = await db
      .select()
      .from(workflowExecutionsTable)
      .where(eq(workflowExecutionsTable.workflowId, workflowId));

    const executionNumber = executions.length + 1;

    // Create execution record
    const [execution] = await db
      .insert(workflowExecutionsTable)
      .values({
        workflowId,
        executionNumber,
        triggerReason,
        triggeredBy: userId,
        executionContext: JSON.stringify({}),
        stepResults: JSON.stringify({}),
        activeAgents: JSON.stringify([]),
        agentAssignments: JSON.stringify({}),
        status: 'running',
      })
      .returning();

    if (!execution) {
      throw new Error('Failed to create workflow execution');
    }

    // Update workflow status
    await db
      .update(collaborationWorkflowsTable)
      .set({
        status: 'active',
        startedAt: new Date(),
        currentStep: 0,
        updatedAt: new Date(),
      })
      .where(eq(collaborationWorkflowsTable.id, workflowId));

    // Start processing workflow
    this.processWorkflow(execution.id).catch(console.error);

    return this.parseExecution(execution);
  }

  // Process workflow execution
  private static async processWorkflow(executionId: string): Promise<void> {
    const db = getDatabase();

    try {
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

      // Process workflow steps
      await this.executeWorkflowSteps(
        execution, 
        workflow, 
        configuration, 
        participatingAgents
      );

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
    }
  }

  // Execute workflow steps with agent coordination
  private static async executeWorkflowSteps(
    execution: any,
    workflow: any,
    configuration: any,
    participatingAgents: string[]
  ): Promise<void> {
    const db = getDatabase();
    const steps = configuration.steps;
    
    // Create coordination service
    const coordinationService = new AgentCoordinationService(
      execution.id, 
      workflow.coordinatorAgentId, 
      participatingAgents
    );

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      try {
        // Update current step
        await db
          .update(workflowExecutionsTable)
          .set({
            currentStepId: step.id,
            updatedAt: new Date(),
          })
          .where(eq(workflowExecutionsTable.id, execution.id));

        // Assign agent to step
        const assignedAgent = await this.assignAgentToStep(
          step, 
          participatingAgents, 
          coordinationService
        );

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

        // Update workflow progress
        await db
          .update(collaborationWorkflowsTable)
          .set({
            currentStep: i + 1,
            updatedAt: new Date(),
          })
          .where(eq(collaborationWorkflowsTable.id, workflow.id));

      } catch (error) {
        console.error(`Step ${step.id} failed:`, error);
        throw error;
      }
    }

    // Mark execution as completed
    await db
      .update(workflowExecutionsTable)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(workflowExecutionsTable.id, execution.id));

    // Mark workflow as completed
    await db
      .update(collaborationWorkflowsTable)
      .set({
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(collaborationWorkflowsTable.id, workflow.id));
  }

  // Assign agent to workflow step
  private static async assignAgentToStep(
    step: any,
    participatingAgents: string[],
    coordinationService: any
  ): Promise<string> {
    // If step has preferred agent, use it
    if (step.preferredAgentId && participatingAgents.includes(step.preferredAgentId)) {
      return step.preferredAgentId;
    }

    // Use coordinator to decide
    const assignment = await coordinationService.requestAgentAssignment(step);
    return assignment;
  }

  // Get user workflows
  static async getUserWorkflows(userId: string): Promise<CollaborationWorkflow[]> {
    const db = getDatabase();

    const workflows = await db
      .select()
      .from(collaborationWorkflowsTable)
      .where(eq(collaborationWorkflowsTable.userId, userId))
      .orderBy(desc(collaborationWorkflowsTable.createdAt));

    return workflows.map(workflow => this.parseWorkflow(workflow));
  }

  // Get workflow executions
  static async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    const db = getDatabase();

    const executions = await db
      .select()
      .from(workflowExecutionsTable)
      .where(eq(workflowExecutionsTable.workflowId, workflowId))
      .orderBy(desc(workflowExecutionsTable.startedAt));

    return executions.map(execution => this.parseExecution(execution));
  }

  // Get workflow templates
  static async getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
    const db = getDatabase();

    const templates = await db
      .select()
      .from(workflowTemplatesTable)
      .orderBy(desc(workflowTemplatesTable.usageCount));

    return templates.map(template => this.parseTemplate(template));
  }

  // Create workflow from template
  static async createFromTemplate(
    templateId: string,
    participatingAgents: string[],
    userId: string,
    customizations?: {
      name?: string;
      description?: string;
    }
  ): Promise<CollaborationWorkflow> {
    const db = getDatabase();

    const [template] = await db
      .select()
      .from(workflowTemplatesTable)
      .where(eq(workflowTemplatesTable.id, templateId))
      .limit(1);

    if (!template) {
      throw new Error('Template not found');
    }

    const templateDefinition = JSON.parse(template.templateDefinition);
    
    const request: CreateWorkflowRequest = {
      name: customizations?.name || template.name,
      description: customizations?.description || template.description,
      workflowType: 'pipeline',
      participatingAgents,
      configuration: templateDefinition,
    };

    // Update template usage
    await db
      .update(workflowTemplatesTable)
      .set({
        usageCount: template.usageCount + 1,
        updatedAt: new Date(),
      })
      .where(eq(workflowTemplatesTable.id, templateId));

    return this.createWorkflow(request, userId);
  }

  // Helper methods to parse database results
  private static parseWorkflow(dbWorkflow: any): CollaborationWorkflow {
    return {
      ...dbWorkflow,
      configuration: JSON.parse(dbWorkflow.configuration),
      participatingAgents: JSON.parse(dbWorkflow.participatingAgents),
      executionHistory: dbWorkflow.executionHistory ? JSON.parse(dbWorkflow.executionHistory) : [],
      collaborationMetrics: dbWorkflow.collaborationMetrics ? JSON.parse(dbWorkflow.collaborationMetrics) : undefined,
      finalResult: dbWorkflow.finalResult ? JSON.parse(dbWorkflow.finalResult) : undefined,
      startedAt: dbWorkflow.startedAt ? new Date(dbWorkflow.startedAt) : undefined,
      completedAt: dbWorkflow.completedAt ? new Date(dbWorkflow.completedAt) : undefined,
      createdAt: new Date(dbWorkflow.createdAt),
      updatedAt: new Date(dbWorkflow.updatedAt),
    };
  }

  private static parseExecution(dbExecution: any): WorkflowExecution {
    return {
      ...dbExecution,
      executionContext: dbExecution.executionContext ? JSON.parse(dbExecution.executionContext) : {},
      stepResults: dbExecution.stepResults ? JSON.parse(dbExecution.stepResults) : {},
      activeAgents: dbExecution.activeAgents ? JSON.parse(dbExecution.activeAgents) : [],
      agentAssignments: dbExecution.agentAssignments ? JSON.parse(dbExecution.agentAssignments) : {},
      finalOutput: dbExecution.finalOutput ? JSON.parse(dbExecution.finalOutput) : undefined,
      startedAt: new Date(dbExecution.startedAt),
      completedAt: dbExecution.completedAt ? new Date(dbExecution.completedAt) : undefined,
      updatedAt: new Date(dbExecution.updatedAt),
    };
  }

  private static parseTemplate(dbTemplate: any): WorkflowTemplate {
    return {
      ...dbTemplate,
      templateDefinition: JSON.parse(dbTemplate.templateDefinition),
      requiredAgentRoles: JSON.parse(dbTemplate.requiredAgentRoles),
      createdAt: new Date(dbTemplate.createdAt),
      updatedAt: new Date(dbTemplate.updatedAt),
    };
  }
}
```

### 3. Agent Coordination Service

```typescript
// src/main/agents/collaboration/coordination.service.ts
import { eq } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { 
  agentInteractionsTable, 
  collaborationKnowledgeTable 
} from './collaboration.schema';
import { AgentService } from '../agent.service';
import { LlmProviderService } from '../../llm/llm-provider.service';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { 
  AgentInteraction, 
  CollaborationKnowledge,
  WorkflowStep 
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
        contextData: { stepId: step.id },
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
          result: result.summary || 'Step completed successfully' 
        },
        relatedStepId: step.id,
      });

      // Share knowledge if valuable insights were generated
      if (result.insights?.length > 0) {
        await this.shareKnowledge(
          assignedAgentId,
          step.name,
          result.insights,
          'insight'
        );
      }

      return result;

    } catch (error) {
      // Record failure
      await this.recordInteraction({
        fromAgentId: assignedAgentId,
        interactionType: 'coordination',
        message: `Step failed: ${step.name} - ${error instanceof Error ? error.message : 'Unknown error'}`,
        contextData: { stepId: step.id, error: true },
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
      // Ask coordinator agent to assign
      const coordinator = await AgentService.findById(this.coordinatorAgentId);
      if (!coordinator) {
        return this.findBestAgent(step);
      }

      const provider = await LlmProviderService.findById(coordinator.llmProviderId);
      if (!provider) {
        return this.findBestAgent(step);
      }

      const aiProvider = createOpenAI({
        apiKey: provider.apiKey,
      });

      const agentDetails = await this.getAgentDetails();
      const prompt = `As a workflow coordinator, assign the best agent for this step:

Step: ${step.name}
Description: ${step.description}
Required Skills: ${step.requiredSkills.join(', ')}
Instructions: ${step.instructions}

Available Agents:
${agentDetails.map(agent => 
  `- ${agent.name} (${agent.role}): ${agent.skills?.join(', ') || 'General skills'}`
).join('\n')}

Return only the agent ID of the best match.`;

      const response = await generateText({
        model: aiProvider('gpt-4o-mini'),
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
          contextData: { stepId: step.id, assignedAgentId },
          relatedStepId: step.id,
        });

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
    // Simple heuristic: first agent (could be enhanced with skill matching)
    return this.participatingAgents[0];
  }

  // Execute step with AI
  private async executeStepWithAI(
    step: WorkflowStep,
    agent: any,
    provider: any,
    context: string
  ): Promise<any> {
    const aiProvider = createOpenAI({
      apiKey: provider.apiKey,
    });

    const modelConfig = JSON.parse(agent.modelParameters || '{}');

    const systemPrompt = `You are ${agent.name}, a ${agent.role}.

${agent.backstory}

You are working as part of a collaborative team on a workflow. Your role is to complete the assigned step with high quality.

Current Context:
${context}

Complete the step and provide:
1. A summary of what you accomplished
2. The actual output/result
3. Any insights or recommendations for the team
4. Any questions or concerns for other team members

Be thorough and professional in your response.`;

    const prompt = `Step: ${step.name}

Description: ${step.description}

Instructions: ${step.instructions}

Expected Output: ${step.expectedOutput}

Please complete this step thoroughly and provide detailed results.`;

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
      questions: result.questions || [],
      rawResponse: response.text,
      tokensUsed: response.usage?.totalTokens || 0,
    };
  }

  // Parse step result from AI response
  private parseStepResult(response: string): any {
    try {
      // Try to extract structured information from response
      const lines = response.split('\n');
      const result: any = {};

      let currentSection = '';
      let content: string[] = [];

      for (const line of lines) {
        const lower = line.toLowerCase().trim();
        
        if (lower.includes('summary:') || lower.includes('completed:')) {
          currentSection = 'summary';
          content = [];
        } else if (lower.includes('output:') || lower.includes('result:')) {
          currentSection = 'output';
          content = [];
        } else if (lower.includes('insight') || lower.includes('recommendation')) {
          currentSection = 'insights';
          content = [];
        } else if (lower.includes('question') || lower.includes('concern')) {
          currentSection = 'questions';
          content = [];
        } else if (line.trim()) {
          content.push(line.trim());
        }

        if (currentSection && content.length > 0) {
          result[currentSection] = content.join(' ');
        }
      }

      return result;
    } catch (error) {
      return {
        summary: 'Step completed',
        output: response,
        insights: [],
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
    context += `- Required Skills: ${step.requiredSkills.join(', ')}\n`;

    if (step.dependsOn.length > 0) {
      context += `- Depends on steps: ${step.dependsOn.join(', ')}\n`;
    }

    if (knowledge.length > 0) {
      context += `\nRelevant Team Knowledge:\n`;
      knowledge.forEach(item => {
        context += `- ${item.title}: ${item.content}\n`;
      });
    }

    return context;
  }

  // Gather relevant knowledge for step execution
  private async gatherRelevantKnowledge(step: WorkflowStep): Promise<CollaborationKnowledge[]> {
    const db = getDatabase();

    const knowledge = await db
      .select()
      .from(collaborationKnowledgeTable)
      .where(eq(collaborationKnowledgeTable.isActive, true))
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

    const knowledgeContent = Array.isArray(content) ? content.join('\n') : content;

    await db.insert(collaborationKnowledgeTable).values({
      workflowId: this.executionId, // Using execution ID as workflow reference
      title,
      content: knowledgeContent,
      knowledgeType: type,
      createdByAgentId: agentId,
      validatedByAgents: JSON.stringify([]),
      tags: JSON.stringify([]),
    });

    // Record knowledge sharing interaction
    await this.recordInteraction({
      fromAgentId: agentId,
      interactionType: 'knowledge_sharing',
      message: `Shared knowledge: ${title}`,
      contextData: { 
        knowledgeType: type, 
        content: knowledgeContent.substring(0, 200) 
      },
    });
  }

  // Record agent interaction
  private async recordInteraction(interaction: Omit<AgentInteraction, 'id' | 'workflowExecutionId' | 'createdAt' | 'respondedAt' | 'responseReceived'>): Promise<void> {
    const db = getDatabase();

    await db.insert(agentInteractionsTable).values({
      workflowExecutionId: this.executionId,
      ...interaction,
      contextData: interaction.contextData ? JSON.stringify(interaction.contextData) : null,
      responseData: null,
    });
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
            skills: [], // Could be enhanced with actual skills data
          });
        }
      } catch (error) {
        // Skip unavailable agents
      }
    }

    return agents;
  }
}
```

### 4. IPC Handlers

```typescript
// src/main/agents/collaboration/collaboration.handlers.ts
import { ipcMain } from 'electron';
import { WorkflowService } from './workflow.service';
import { CollaborationAnalyticsService } from './analytics.service';
import type { IpcResponse } from '../../types';
import type { CreateWorkflowRequest } from './collaboration.types';

export function setupCollaborationHandlers(): void {
  // Create workflow
  ipcMain.handle(
    'collaboration:createWorkflow',
    async (_, request: CreateWorkflowRequest): Promise<IpcResponse> => {
      try {
        // TODO: Get current user ID from auth system
        const userId = 'current-user-id';
        const workflow = await WorkflowService.createWorkflow(request, userId);
        return { success: true, data: workflow };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create workflow',
        };
      }
    }
  );

  // Get user workflows
  ipcMain.handle(
    'collaboration:getUserWorkflows',
    async (): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const workflows = await WorkflowService.getUserWorkflows(userId);
        return { success: true, data: workflows };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get workflows',
        };
      }
    }
  );

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

  // Get workflow executions
  ipcMain.handle(
    'collaboration:getExecutions',
    async (_, workflowId: string): Promise<IpcResponse> => {
      try {
        const executions = await WorkflowService.getWorkflowExecutions(workflowId);
        return { success: true, data: executions };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get executions',
        };
      }
    }
  );

  // Get workflow templates
  ipcMain.handle(
    'collaboration:getTemplates',
    async (): Promise<IpcResponse> => {
      try {
        const templates = await WorkflowService.getWorkflowTemplates();
        return { success: true, data: templates };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get templates',
        };
      }
    }
  );

  // Create workflow from template
  ipcMain.handle(
    'collaboration:createFromTemplate',
    async (_, templateId: string, participatingAgents: string[], customizations?: any): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const workflow = await WorkflowService.createFromTemplate(
          templateId,
          participatingAgents,
          userId,
          customizations
        );
        return { success: true, data: workflow };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create workflow from template',
        };
      }
    }
  );

  // Get collaboration analytics
  ipcMain.handle(
    'collaboration:getAnalytics',
    async (_, workflowId: string): Promise<IpcResponse> => {
      try {
        const analytics = await CollaborationAnalyticsService.getWorkflowAnalytics(workflowId);
        return { success: true, data: analytics };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get analytics',
        };
      }
    }
  );
}
```

### 5. Frontend Components

```typescript
// src/renderer/components/collaboration/workflow-builder.tsx
import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, Trash2, Play, Users, Workflow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CreateWorkflowRequest, WorkflowStep } from '@/types/collaboration';

const workflowSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  workflowType: z.enum(['pipeline', 'parallel', 'conditional']),
  participatingAgents: z.array(z.string()).min(2, 'At least 2 agents required'),
  coordinatorAgentId: z.string().optional(),
});

interface WorkflowBuilderProps {
  agents: Array<{ id: string; name: string; role: string }>;
  onWorkflowCreated: (workflow: any) => void;
}

export function WorkflowBuilder({ agents, onWorkflowCreated }: WorkflowBuilderProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<CreateWorkflowRequest>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      workflowType: 'pipeline',
      participatingAgents: [],
    },
  });

  const addStep = useCallback(() => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      name: '',
      description: '',
      type: 'implementation',
      requiredSkills: [],
      dependsOn: [],
      canRunInParallel: false,
      instructions: '',
      expectedOutput: '',
    };
    setSteps(prev => [...prev, newStep]);
  }, []);

  const updateStep = useCallback((index: number, updates: Partial<WorkflowStep>) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, ...updates } : step
    ));
  }, []);

  const removeStep = useCallback((index: number) => {
    setSteps(prev => prev.filter((_, i) => i !== index));
  }, []);

  const onSubmit = async (data: CreateWorkflowRequest) => {
    if (steps.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'At least one workflow step is required.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const request: CreateWorkflowRequest = {
        ...data,
        configuration: {
          steps,
          coordination: {
            communicationStyle: 'technical',
            decisionMaking: data.coordinatorAgentId ? 'coordinator' : 'consensus',
            knowledgeSharing: true,
          },
          constraints: {
            maxExecutionTime: 3600, // 1 hour
            maxRetries: 3,
            allowParallelExecution: data.workflowType === 'parallel',
          },
        },
      };

      const response = await window.api.collaboration.createWorkflow(request);
      
      if (response.success) {
        onWorkflowCreated(response.data);
        toast({
          title: 'Workflow Created',
          description: 'Your collaboration workflow has been created successfully.',
        });
        setOpen(false);
        form.reset();
        setSteps([]);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create workflow',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Workflow className="h-4 w-4" />
          Create Workflow
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Multi-Agent Workflow Builder
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workflow Name</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Feature Development Pipeline" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="workflowType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Workflow Type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pipeline">Pipeline (Sequential)</SelectItem>
                            <SelectItem value="parallel">Parallel Execution</SelectItem>
                            <SelectItem value="conditional">Conditional Branching</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describe what this workflow accomplishes..."
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Agent Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Team Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="participatingAgents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Participating Agents</FormLabel>
                      <div className="space-y-2">
                        <Select 
                          onValueChange={(value) => {
                            if (!field.value.includes(value)) {
                              field.onChange([...field.value, value]);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add agents to workflow" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map((agent) => (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name} - {agent.role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((agentId) => {
                            const agent = agents.find(a => a.id === agentId);
                            return agent ? (
                              <Badge 
                                key={agent.id} 
                                variant="secondary"
                                className="gap-1"
                              >
                                {agent.name}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-auto p-0 text-xs"
                                  onClick={() => {
                                    field.onChange(field.value.filter(id => id !== agentId));
                                  }}
                                >
                                  ×
                                </Button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="coordinatorAgentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Coordinator Agent (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a coordinator agent" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch('participatingAgents').map((agentId) => {
                            const agent = agents.find(a => a.id === agentId);
                            return agent ? (
                              <SelectItem key={agent.id} value={agent.id}>
                                {agent.name} - {agent.role}
                              </SelectItem>
                            ) : null;
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Workflow Steps */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Workflow Steps</CardTitle>
                  <Button type="button" onClick={addStep} size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    Add Step
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {steps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No steps defined yet. Click "Add Step" to get started.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <Card key={step.id} className="border-dashed">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Step {index + 1}</Badge>
                              <Input
                                value={step.name}
                                onChange={(e) => updateStep(index, { name: e.target.value })}
                                placeholder="Step name"
                                className="w-48"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeStep(index)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-2 space-y-3">
                          <Textarea
                            value={step.description}
                            onChange={(e) => updateStep(index, { description: e.target.value })}
                            placeholder="Step description"
                            rows={2}
                          />
                          
                          <div className="grid grid-cols-2 gap-3">
                            <Select 
                              value={step.type}
                              onValueChange={(value) => updateStep(index, { type: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="analysis">Analysis</SelectItem>
                                <SelectItem value="implementation">Implementation</SelectItem>
                                <SelectItem value="review">Review</SelectItem>
                                <SelectItem value="testing">Testing</SelectItem>
                                <SelectItem value="documentation">Documentation</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Input
                              value={step.requiredSkills.join(', ')}
                              onChange={(e) => updateStep(index, { 
                                requiredSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                              })}
                              placeholder="Required skills (comma-separated)"
                            />
                          </div>
                          
                          <Textarea
                            value={step.instructions}
                            onChange={(e) => updateStep(index, { instructions: e.target.value })}
                            placeholder="Detailed instructions for this step"
                            rows={2}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="gap-2">
                {isCreating ? (
                  'Creating...'
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Create Workflow
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
```

### 6. Workflow Execution Monitor

```typescript
// src/renderer/components/collaboration/execution-monitor.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Square, Users, MessageSquare, Brain, Clock, CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { CollaborationWorkflow, WorkflowExecution, AgentInteraction } from '@/types/collaboration';

interface ExecutionMonitorProps {
  workflow: CollaborationWorkflow;
  onWorkflowStart: (workflowId: string) => void;
}

export function ExecutionMonitor({ workflow, onWorkflowStart }: ExecutionMonitorProps) {
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [interactions, setInteractions] = useState<AgentInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExecutions();
    
    // Poll for updates if workflow is active
    if (workflow.status === 'active') {
      const interval = setInterval(loadExecutions, 5000);
      return () => clearInterval(interval);
    }
  }, [workflow.id, workflow.status]);

  const loadExecutions = async () => {
    try {
      const response = await window.api.collaboration.getExecutions(workflow.id);
      if (response.success) {
        setExecutions(response.data);
      }
    } catch (error) {
      console.error('Failed to load executions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWorkflow = async () => {
    onWorkflowStart(workflow.id);
    // Refresh executions after a short delay
    setTimeout(loadExecutions, 1000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const currentExecution = executions.find(e => e.status === 'running') || executions[0];
  const progressPercentage = workflow.totalSteps > 0 
    ? Math.round((workflow.currentStep / workflow.totalSteps) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {workflow.name}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={workflow.status === 'active' ? 'default' : 'secondary'}>
                  {getStatusIcon(workflow.status)}
                  {workflow.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {workflow.participatingAgents.length} agents
                </span>
                <span className="text-sm text-muted-foreground">
                  {workflow.configuration.steps.length} steps
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {workflow.status === 'draft' && (
                <Button onClick={handleStartWorkflow} className="gap-2">
                  <Play className="h-4 w-4" />
                  Start Workflow
                </Button>
              )}
              {workflow.status === 'active' && (
                <Button variant="outline" className="gap-2">
                  <Pause className="h-4 w-4" />
                  Pause
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        {workflow.status === 'active' && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{workflow.currentStep}/{workflow.totalSteps} steps</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Step {workflow.currentStep}</span>
                <span>{progressPercentage}% complete</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Execution Details */}
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Execution</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
          <TabsTrigger value="interactions">Agent Interactions</TabsTrigger>
          <TabsTrigger value="knowledge">Team Knowledge</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {currentExecution ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Execution #{currentExecution.executionNumber}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Started {formatDistanceToNow(currentExecution.startedAt, { addSuffix: true })}</span>
                  <span>Trigger: {currentExecution.triggerReason}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Step */}
                  {currentExecution.currentStepId && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Current Step</h4>
                      <p className="text-sm">Step ID: {currentExecution.currentStepId}</p>
                    </div>
                  )}
                  
                  {/* Active Agents */}
                  <div>
                    <h4 className="font-medium mb-2">Active Agents</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentExecution.activeAgents.map((agentId) => (
                        <Badge key={agentId} variant="outline">
                          Agent {agentId.slice(-8)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Step Results */}
                  {Object.keys(currentExecution.stepResults).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Step Results</h4>
                      <ScrollArea className="h-32 w-full border rounded p-2">
                        <pre className="text-xs">
                          {JSON.stringify(currentExecution.stepResults, null, 2)}
                        </pre>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No active execution. Start the workflow to begin.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {executions.length > 0 ? (
            <div className="space-y-4">
              {executions.map((execution) => (
                <Card key={execution.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Execution #{execution.executionNumber}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={execution.status === 'completed' ? 'default' : 'secondary'}>
                            {getStatusIcon(execution.status)}
                            {execution.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm space-y-1">
                      <div>Trigger: {execution.triggerReason}</div>
                      {execution.completedAt && (
                        <div>
                          Duration: {Math.round(
                            (new Date(execution.completedAt).getTime() - 
                             new Date(execution.startedAt).getTime()) / 1000
                          )}s
                        </div>
                      )}
                      {execution.errorMessage && (
                        <div className="text-destructive">
                          Error: {execution.errorMessage}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>No execution history yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="interactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Agent Communications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Agent interaction timeline will appear here during execution.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Shared Knowledge Base
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Knowledge items created during collaboration will appear here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Validation & Testing

### Manual Testing Checklist

- [ ] **Workflow Creation**: Create workflows with multiple agents and steps
- [ ] **Agent Coordination**: Verify agents can collaborate and delegate tasks
- [ ] **Step Execution**: Test sequential and parallel step execution
- [ ] **Knowledge Sharing**: Verify agents share insights and learnings
- [ ] **Error Handling**: Test recovery from agent failures and errors
- [ ] **Monitoring**: Real-time execution monitoring and progress tracking

### Implementation Validation

1. **Database Schema**: Verify all tables created with proper relationships
2. **Coordination Logic**: Test agent assignment and task delegation
3. **AI Integration**: Test multi-agent AI execution and communication
4. **Service Layer**: Test all workflow operations and state management
5. **Frontend Interface**: Test workflow creation and monitoring interfaces

## Success Criteria

✅ **Multi-Agent Coordination**: Agents work together seamlessly on complex tasks
✅ **Intelligent Assignment**: Smart assignment of tasks based on agent capabilities
✅ **Knowledge Sharing**: Agents learn from each other and build shared knowledge
✅ **Real-time Monitoring**: Complete visibility into workflow execution and agent interactions
✅ **Template System**: Reusable workflow patterns for common collaboration scenarios

## Next Steps

After completing this task:
1. **Performance Optimization**: Optimize multi-agent coordination for larger teams
2. **Advanced Patterns**: Implement recursive and conditional workflow patterns
3. **Analytics Enhancement**: Add detailed collaboration analytics and insights
4. **Integration**: Connect with external tools and services for enhanced workflows

This task represents the pinnacle of the agent system - true AI team collaboration where specialized agents work together like human team members to solve complex problems and execute sophisticated workflows.