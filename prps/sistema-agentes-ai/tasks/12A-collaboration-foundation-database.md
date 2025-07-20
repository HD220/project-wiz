# Task 12A: Collaboration Foundation & Database - Enhanced

## Overview

Establish the foundational database schema and core service layer for multi-agent collaboration workflows. This micro-task creates the essential infrastructure for agents to work together on complex tasks, including workflow definitions, execution tracking, and knowledge management foundation.

## User Value

After completing this task, users can:
- Define multi-agent collaboration workflows with structured steps
- Store and retrieve workflow configurations and metadata
- Track basic workflow execution states and progress
- Establish the foundation for agent team coordination
- Manage workflow templates for reusable collaboration patterns

## Technical Requirements

### Prerequisites
- Existing agent system from previous tasks
- SQLite database with Drizzle ORM
- TypeScript type system
- Basic user authentication available

### Core Database Schema

```sql
-- Collaboration workflows for multi-agent coordination
CREATE TABLE collaboration_workflows (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    project_id TEXT REFERENCES projects(id),
    
    -- Workflow definition
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    workflow_type TEXT NOT NULL DEFAULT 'pipeline', -- pipeline, parallel, conditional
    
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

-- Performance indexes
CREATE INDEX collaboration_workflows_user_idx ON collaboration_workflows(user_id);
CREATE INDEX collaboration_workflows_status_idx ON collaboration_workflows(status);
CREATE INDEX workflow_executions_workflow_idx ON workflow_executions(workflow_id);
CREATE INDEX workflow_executions_status_idx ON workflow_executions(status);
CREATE INDEX workflow_templates_category_idx ON workflow_templates(category);
```

## Implementation Steps

### 1. Database Schema Definition

```typescript
// src/main/agents/collaboration/collaboration.schema.ts
import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';
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

// Performance indexes
export const workflowsUserIndex = index('collaboration_workflows_user_idx')
  .on(collaborationWorkflowsTable.userId);
export const workflowsStatusIndex = index('collaboration_workflows_status_idx')
  .on(collaborationWorkflowsTable.status);
export const executionsWorkflowIndex = index('workflow_executions_workflow_idx')
  .on(workflowExecutionsTable.workflowId);
export const executionsStatusIndex = index('workflow_executions_status_idx')
  .on(workflowExecutionsTable.status);
export const templatesCategoryIndex = index('workflow_templates_category_idx')
  .on(workflowTemplatesTable.category);

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
}));

export const workflowExecutionsRelations = relations(workflowExecutionsTable, ({ one }) => ({
  workflow: one(collaborationWorkflowsTable, {
    fields: [workflowExecutionsTable.workflowId],
    references: [collaborationWorkflowsTable.id],
  }),
}));

// Type inference
export type SelectCollaborationWorkflow = typeof collaborationWorkflowsTable.$inferSelect;
export type InsertCollaborationWorkflow = typeof collaborationWorkflowsTable.$inferInsert;
export type SelectWorkflowExecution = typeof workflowExecutionsTable.$inferSelect;
export type InsertWorkflowExecution = typeof workflowExecutionsTable.$inferInsert;
export type SelectWorkflowTemplate = typeof workflowTemplatesTable.$inferSelect;
export type InsertWorkflowTemplate = typeof workflowTemplatesTable.$inferInsert;
```

### 2. Core Types Definition

```typescript
// src/main/agents/collaboration/collaboration.types.ts
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

export type WorkflowType = 'pipeline' | 'parallel' | 'conditional';
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

### 3. Basic Workflow Service

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
  WorkflowTemplate,
  InsertCollaborationWorkflow,
  InsertWorkflowExecution,
  InsertWorkflowTemplate
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

    const workflowData: InsertCollaborationWorkflow = {
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

  // Get workflow by ID
  static async findById(workflowId: string, userId: string): Promise<CollaborationWorkflow | null> {
    const db = getDatabase();

    const [workflow] = await db
      .select()
      .from(collaborationWorkflowsTable)
      .where(and(
        eq(collaborationWorkflowsTable.id, workflowId),
        eq(collaborationWorkflowsTable.userId, userId)
      ))
      .limit(1);

    return workflow ? this.parseWorkflow(workflow) : null;
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

  // Update workflow status
  static async updateStatus(
    workflowId: string,
    status: string,
    updates?: {
      currentStep?: number;
      startedAt?: Date;
      completedAt?: Date;
      actualDuration?: number;
      collaborationMetrics?: any;
      finalResult?: any;
    }
  ): Promise<void> {
    const db = getDatabase();

    const updateData: any = {
      status,
      updatedAt: new Date(),
      ...updates,
    };

    await db
      .update(collaborationWorkflowsTable)
      .set(updateData)
      .where(eq(collaborationWorkflowsTable.id, workflowId));
  }

  // Create workflow execution
  static async createExecution(
    workflowId: string,
    userId: string,
    triggerReason: string = 'manual'
  ): Promise<WorkflowExecution> {
    const db = getDatabase();

    // Get existing executions to determine execution number
    const executions = await db
      .select()
      .from(workflowExecutionsTable)
      .where(eq(workflowExecutionsTable.workflowId, workflowId));

    const executionNumber = executions.length + 1;

    const executionData: InsertWorkflowExecution = {
      workflowId,
      executionNumber,
      triggerReason,
      triggeredBy: userId,
      executionContext: JSON.stringify({}),
      stepResults: JSON.stringify({}),
      activeAgents: JSON.stringify([]),
      agentAssignments: JSON.stringify({}),
      status: 'pending',
    };

    const [execution] = await db
      .insert(workflowExecutionsTable)
      .values(executionData)
      .returning();

    if (!execution) {
      throw new Error('Failed to create workflow execution');
    }

    return this.parseExecution(execution);
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

  // Create workflow template
  static async createTemplate(
    templateData: {
      name: string;
      description: string;
      category: string;
      templateDefinition: any;
      requiredAgentRoles: string[];
      recommendedAgentCount?: number;
    },
    userId?: string
  ): Promise<WorkflowTemplate> {
    const db = getDatabase();

    const data: InsertWorkflowTemplate = {
      name: templateData.name,
      description: templateData.description,
      category: templateData.category,
      templateDefinition: JSON.stringify(templateData.templateDefinition),
      requiredAgentRoles: JSON.stringify(templateData.requiredAgentRoles),
      recommendedAgentCount: templateData.recommendedAgentCount || 2,
      isSystemTemplate: !userId, // System template if no user ID
      createdByUserId: userId,
    };

    const [template] = await db
      .insert(workflowTemplatesTable)
      .values(data)
      .returning();

    if (!template) {
      throw new Error('Failed to create workflow template');
    }

    return this.parseTemplate(template);
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

### 4. Database Migration

```typescript
// Generate migration with: npm run db:generate
// Apply migration with: npm run db:migrate

// This will create the necessary migration files for:
// - collaboration_workflows table
// - workflow_executions table  
// - workflow_templates table
// - All indexes and relations
```

### 5. Basic IPC Handlers

```typescript
// src/main/agents/collaboration/collaboration.handlers.ts
import { ipcMain } from 'electron';
import { WorkflowService } from './workflow.service';
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

  // Get workflow by ID
  ipcMain.handle(
    'collaboration:getWorkflow',
    async (_, workflowId: string): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const workflow = await WorkflowService.findById(workflowId, userId);
        return { success: true, data: workflow };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get workflow',
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
}
```

## Validation Checkpoints

### Checkpoint 1: Database Foundation
- Test database schema creation and migration
- Verify all tables, indexes, and relations are properly created
- Test basic CRUD operations on workflow data
- Validate JSON serialization/deserialization of complex fields

### Checkpoint 2: Workflow Management
- Test workflow creation with multiple agents
- Verify agent validation and permission checking
- Test workflow template creation and usage
- Validate workflow execution record creation

### Checkpoint 3: Service Layer
- Test all WorkflowService methods
- Verify error handling and validation
- Test data parsing and type conversion
- Validate IPC handler responses

## Success Criteria

✅ **Database Foundation**: Complete schema with proper relationships and indexes
✅ **Workflow Management**: Robust workflow creation, validation, and storage
✅ **Template System**: Reusable workflow templates with usage tracking
✅ **Type Safety**: Complete TypeScript typing throughout the system
✅ **Error Handling**: Comprehensive validation and error reporting

## Next Steps

After completing the foundation:
1. **Move to Task 12B**: Implement agent coordination and execution engine
2. **Enhanced Validation**: Add more sophisticated workflow validation rules
3. **Performance Optimization**: Optimize database queries and indexing

This task establishes the essential foundation for multi-agent collaboration, providing the database schema, core types, and basic service layer needed for complex workflow management.