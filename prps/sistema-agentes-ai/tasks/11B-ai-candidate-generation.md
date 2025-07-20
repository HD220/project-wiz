# Task 11B: AI Candidate Generation System - Enhanced

## Overview

Implement the intelligent AI-powered candidate generation system that analyzes job requirements, generates diverse agent candidates with optimal configurations, and provides smart team composition recommendations. This micro-task focuses on the sophisticated AI capabilities that make agent hiring intelligent and automated.

## User Value

After completing this task, users can:
- Get AI-generated agent candidates tailored to specific project needs
- Receive optimal team composition recommendations based on project analysis
- See diverse candidates with different experience levels and specializations
- Benefit from intelligent matching scores and detailed reasoning
- Access pre-configured agent profiles optimized for their technology stack

## Technical Requirements

### Prerequisites
- Task 11A: Project Analysis & Database Foundation completed
- Existing LLM provider system operational
- AI SDK with text generation capabilities
- Job posting foundation service available

### Extended Database Schema

```sql
-- Agent candidates generated for job postings
CREATE TABLE agent_candidates (
    id TEXT PRIMARY KEY,
    job_posting_id TEXT NOT NULL REFERENCES agent_job_postings(id) ON DELETE CASCADE,
    
    -- Agent profile
    suggested_name TEXT NOT NULL,
    suggested_role TEXT NOT NULL,
    personality TEXT NOT NULL,
    backstory TEXT NOT NULL,
    instructions TEXT NOT NULL,
    
    -- Skills and capabilities
    skills TEXT NOT NULL, -- JSON array of skills
    specializations TEXT, -- JSON array of specializations
    experience_level TEXT NOT NULL, -- junior, mid, senior, expert
    
    -- Configuration
    model_parameters TEXT, -- JSON with optimized model config
    recommended_provider_type TEXT, -- openai, deepseek, anthropic
    
    -- Scoring and ranking
    match_score INTEGER NOT NULL, -- 0-100 compatibility score
    reasoning TEXT NOT NULL, -- Why this candidate was generated
    strengths TEXT, -- JSON array of strengths
    ideal_for TEXT, -- JSON array of ideal use cases
    
    -- Status
    status TEXT NOT NULL DEFAULT 'candidate', -- candidate, hired, rejected
    hired_as_agent_id TEXT REFERENCES agents(id),
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Performance indexes
CREATE INDEX agent_candidates_job_posting_idx ON agent_candidates(job_posting_id);
CREATE INDEX agent_candidates_match_score_idx ON agent_candidates(match_score);
CREATE INDEX agent_candidates_status_idx ON agent_candidates(status);
```

### Core Types

```typescript
export interface AgentCandidate {
  id: string;
  jobPostingId: string;
  
  // Profile
  suggestedName: string;
  suggestedRole: string;
  personality: string;
  backstory: string;
  instructions: string;
  
  // Capabilities
  skills: string[];
  specializations: string[];
  experienceLevel: ExperienceLevel;
  
  // Configuration
  modelParameters: ModelParameters;
  recommendedProviderType: ProviderType;
  
  // Scoring
  matchScore: number;
  reasoning: string;
  strengths: string[];
  idealFor: string[];
  
  status: CandidateStatus;
  hiredAsAgentId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'expert';
export type CandidateStatus = 'candidate' | 'hired' | 'rejected';

export interface TeamComposition {
  recommended: {
    role: string;
    skills: string[];
    priority: number;
    reasoning: string;
    estimatedWorkload: string;
  }[];
  currentTeam?: {
    role: string;
    covered: boolean;
    gaps?: string[];
  }[];
  optimalTeamSize: number;
  balanceScore: number;
  collaborationDynamics: string;
}
```

## Implementation Steps

### 1. Extended Database Schema

```typescript
// Update src/main/agents/hiring/hiring.schema.ts
export const agentCandidatesTable = sqliteTable('agent_candidates', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobPostingId: text('job_posting_id').notNull().references(() => agentJobPostingsTable.id, { onDelete: 'cascade' }),
  
  suggestedName: text('suggested_name').notNull(),
  suggestedRole: text('suggested_role').notNull(),
  personality: text('personality').notNull(),
  backstory: text('backstory').notNull(),
  instructions: text('instructions').notNull(),
  
  skills: text('skills').notNull(), // JSON
  specializations: text('specializations'), // JSON
  experienceLevel: text('experience_level').notNull(),
  
  modelParameters: text('model_parameters'), // JSON
  recommendedProviderType: text('recommended_provider_type'),
  
  matchScore: integer('match_score').notNull(),
  reasoning: text('reasoning').notNull(),
  strengths: text('strengths'), // JSON
  idealFor: text('ideal_for'), // JSON
  
  status: text('status').notNull().default('candidate'),
  hiredAsAgentId: text('hired_as_agent_id').references(() => agentsTable.id),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Performance indexes
export const candidatesJobPostingIndex = index('agent_candidates_job_posting_idx')
  .on(agentCandidatesTable.jobPostingId);
export const candidatesMatchScoreIndex = index('agent_candidates_match_score_idx')
  .on(agentCandidatesTable.matchScore);
export const candidatesStatusIndex = index('agent_candidates_status_idx')
  .on(agentCandidatesTable.status);

// Relations
export const agentCandidatesRelations = relations(agentCandidatesTable, ({ one }) => ({
  jobPosting: one(agentJobPostingsTable, {
    fields: [agentCandidatesTable.jobPostingId],
    references: [agentJobPostingsTable.id],
  }),
  hiredAgent: one(agentsTable, {
    fields: [agentCandidatesTable.hiredAsAgentId],
    references: [agentsTable.id],
  }),
}));

// Type inference
export type SelectAgentCandidate = typeof agentCandidatesTable.$inferSelect;
export type InsertAgentCandidate = typeof agentCandidatesTable.$inferInsert;
```

### 2. AI Candidate Generation Service

```typescript
// src/main/agents/hiring/candidate-generation.service.ts
import { getDatabase } from '../../database/connection';
import { agentCandidatesTable, agentJobPostingsTable } from './hiring.schema';
import { LlmProviderService } from '../../llm/llm-provider.service';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createDeepSeek } from '@ai-sdk/deepseek';
import { eq } from 'drizzle-orm';
import type { 
  AgentCandidate, 
  TeamComposition, 
  ProjectAnalysis,
  ExperienceLevel,
  InsertAgentCandidate 
} from './hiring.types';

export class CandidateGenerationService {
  // Main candidate generation pipeline
  static async generateCandidatesForJob(jobPostingId: string): Promise<AgentCandidate[]> {
    const db = getDatabase();

    // Get job posting details
    const [jobPosting] = await db
      .select()
      .from(agentJobPostingsTable)
      .where(eq(agentJobPostingsTable.id, jobPostingId))
      .limit(1);

    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    const requirements = JSON.parse(jobPosting.requirements);
    const preferredSkills = jobPosting.preferredSkills ? JSON.parse(jobPosting.preferredSkills) : [];
    const projectAnalysis = jobPosting.analysisResult ? JSON.parse(jobPosting.analysisResult) : null;

    // Generate diverse candidate profiles
    const candidateProfiles = await this.generateCandidateProfiles(
      requirements,
      preferredSkills,
      projectAnalysis,
      jobPosting.urgency,
      jobPosting.description
    );

    // Store candidates in database
    const savedCandidates: AgentCandidate[] = [];
    for (const profile of candidateProfiles) {
      const candidateData: InsertAgentCandidate = {
        jobPostingId,
        ...profile,
        skills: JSON.stringify(profile.skills),
        specializations: JSON.stringify(profile.specializations || []),
        strengths: JSON.stringify(profile.strengths || []),
        idealFor: JSON.stringify(profile.idealFor || []),
        modelParameters: JSON.stringify(profile.modelParameters || {}),
      };

      const [savedCandidate] = await db
        .insert(agentCandidatesTable)
        .values(candidateData)
        .returning();

      if (savedCandidate) {
        savedCandidates.push(this.parseCandidate(savedCandidate));
      }
    }

    return savedCandidates;
  }

  // AI-powered candidate profile generation
  private static async generateCandidateProfiles(
    requirements: string[],
    preferredSkills: string[],
    projectAnalysis: ProjectAnalysis | null,
    urgency: string,
    description: string
  ): Promise<Omit<AgentCandidate, 'id' | 'jobPostingId' | 'createdAt' | 'updatedAt' | 'status' | 'hiredAsAgentId'>[]> {
    const prompt = this.buildCandidateGenerationPrompt(
      requirements,
      preferredSkills,
      projectAnalysis,
      urgency,
      description
    );

    try {
      const provider = await LlmProviderService.getDefaultProvider();
      if (!provider) {
        throw new Error('No LLM provider available for candidate generation');
      }

      const aiProvider = this.createAIProvider(provider);
      
      const response = await generateText({
        model: aiProvider(provider.model || 'gpt-4o-mini'),
        prompt,
        temperature: 0.8, // Higher creativity for diverse candidates
        maxTokens: 4000,
      });

      const candidatesData = JSON.parse(response.text);
      
      return candidatesData.candidates.map((candidate: any, index: number) => ({
        suggestedName: candidate.suggestedName || `AI Agent ${index + 1}`,
        suggestedRole: candidate.suggestedRole || 'Developer',
        personality: candidate.personality || 'Professional and helpful',
        backstory: candidate.backstory || 'Experienced professional ready to help',
        instructions: candidate.instructions || 'Assist with development tasks',
        skills: candidate.skills || requirements.slice(0, 5),
        specializations: candidate.specializations || [],
        experienceLevel: candidate.experienceLevel || 'mid',
        matchScore: this.validateMatchScore(candidate.matchScore),
        reasoning: candidate.reasoning || 'Good match for project requirements',
        strengths: candidate.strengths || [],
        idealFor: candidate.idealFor || [],
        modelParameters: this.getOptimalModelConfig(candidate.experienceLevel),
        recommendedProviderType: this.getOptimalProviderType(candidate, requirements),
      }));
    } catch (error) {
      console.error('AI candidate generation failed:', error);
      return this.generateFallbackCandidates(requirements, preferredSkills);
    }
  }

  // Build comprehensive prompt for candidate generation
  private static buildCandidateGenerationPrompt(
    requirements: string[],
    preferredSkills: string[],
    projectAnalysis: ProjectAnalysis | null,
    urgency: string,
    description: string
  ): string {
    return `Generate 4-6 diverse AI agent candidates for this development project:

## Project Context
Description: ${description}
Requirements: ${requirements.join(', ')}
Preferred Skills: ${preferredSkills.join(', ')}
Urgency: ${urgency}

${projectAnalysis ? `
## Project Analysis
Technology Stack: ${projectAnalysis.technologyStack.join(', ')}
Project Type: ${projectAnalysis.projectType}
Complexity Score: ${projectAnalysis.complexityScore}/10
Development Phase: ${projectAnalysis.developmentPhase}
Recommended Roles: ${projectAnalysis.recommendedRoles.join(', ')}
Missing Skills: ${projectAnalysis.missingSkills.join(', ')}
Team Gaps: ${projectAnalysis.teamGaps.join(', ')}
` : ''}

## Generation Guidelines
1. Create 4-6 diverse candidates with different experience levels (junior, mid, senior, expert)
2. Each candidate should have unique specializations and personalities
3. Match candidates to specific project needs and technology stack
4. Provide realistic professional names and detailed backstories
5. Generate specific, actionable instructions for each candidate
6. Calculate match scores (0-100) based on fit with requirements
7. Include reasoning for why each candidate is recommended

## Required JSON Response Format
\`\`\`json
{
  "candidates": [
    {
      "suggestedName": "Alex Rodriguez",
      "suggestedRole": "Senior Full-Stack Developer",
      "personality": "Analytical problem-solver with excellent communication skills. Detail-oriented and collaborative.",
      "backstory": "5+ years experience building scalable web applications. Led development teams and mentored junior developers. Specialized in React, Node.js, and cloud architecture.",
      "instructions": "Focus on architectural decisions, code quality, and team leadership. Provide technical guidance, conduct code reviews, and ensure best practices are followed.",
      "skills": ["React", "Node.js", "TypeScript", "AWS", "PostgreSQL", "Docker"],
      "specializations": ["Web Architecture", "Team Leadership", "Performance Optimization"],
      "experienceLevel": "senior",
      "matchScore": 92,
      "reasoning": "Strong technical background matching the project's technology stack. Leadership experience valuable for team coordination and architectural decisions.",
      "strengths": ["Technical Leadership", "System Design", "Mentoring"],
      "idealFor": ["Architecture Planning", "Code Reviews", "Team Coordination", "Complex Problem Solving"]
    }
  ]
}
\`\`\`

Generate candidates with varied experience levels and complementary skill sets that would work well together as a team.`;
  }

  // Generate team composition recommendations
  static async generateTeamComposition(
    requirements: string[],
    preferredSkills: string[],
    projectAnalysis: ProjectAnalysis | null,
    urgency: string
  ): Promise<TeamComposition> {
    const prompt = `Analyze this project and generate optimal team composition:

## Project Requirements
Requirements: ${requirements.join(', ')}
Preferred Skills: ${preferredSkills.join(', ')}
Urgency: ${urgency}

${projectAnalysis ? `
## Project Analysis
Technology Stack: ${projectAnalysis.technologyStack.join(', ')}
Project Type: ${projectAnalysis.projectType}
Complexity Score: ${projectAnalysis.complexityScore}/10
Development Phase: ${projectAnalysis.developmentPhase}
Missing Skills: ${projectAnalysis.missingSkills.join(', ')}
Team Gaps: ${projectAnalysis.teamGaps.join(', ')}
` : ''}

Generate a JSON response with optimal team composition including:
1. Recommended roles with priorities (1-10)
2. Skills needed for each role
3. Reasoning for each recommendation
4. Estimated workload for each role
5. Optimal team size (1-8 members)
6. Balance score (1-10)
7. Collaboration dynamics description

Format as valid JSON:
\`\`\`json
{
  "recommended": [
    {
      "role": "Lead Developer",
      "skills": ["React", "TypeScript", "System Design"],
      "priority": 10,
      "reasoning": "Essential for technical leadership and architecture decisions",
      "estimatedWorkload": "Full-time, 40h/week"
    }
  ],
  "optimalTeamSize": 3,
  "balanceScore": 8,
  "collaborationDynamics": "Balanced team with complementary skills and clear role separation"
}
\`\`\``;

    try {
      const provider = await LlmProviderService.getDefaultProvider();
      if (!provider) {
        throw new Error('No LLM provider available');
      }

      const aiProvider = this.createAIProvider(provider);
      
      const response = await generateText({
        model: aiProvider(provider.model || 'gpt-4o-mini'),
        prompt,
        temperature: 0.3, // Lower temperature for more consistent recommendations
        maxTokens: 2000,
      });

      const teamData = JSON.parse(response.text);
      
      return {
        recommended: teamData.recommended || [],
        optimalTeamSize: teamData.optimalTeamSize || 3,
        balanceScore: teamData.balanceScore || 7,
        collaborationDynamics: teamData.collaborationDynamics || 'Well-balanced team structure',
      };
    } catch (error) {
      console.error('Team composition generation failed:', error);
      return this.generateFallbackTeamComposition(requirements);
    }
  }

  // Get candidates for job posting
  static async getCandidatesForJob(jobPostingId: string): Promise<AgentCandidate[]> {
    const db = getDatabase();

    const candidates = await db
      .select()
      .from(agentCandidatesTable)
      .where(eq(agentCandidatesTable.jobPostingId, jobPostingId))
      .orderBy(desc(agentCandidatesTable.matchScore));

    return candidates.map(candidate => this.parseCandidate(candidate));
  }

  // Update candidate status
  static async updateCandidateStatus(
    candidateId: string, 
    status: CandidateStatus, 
    hiredAsAgentId?: string
  ): Promise<void> {
    const db = getDatabase();

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (hiredAsAgentId) {
      updateData.hiredAsAgentId = hiredAsAgentId;
    }

    await db
      .update(agentCandidatesTable)
      .set(updateData)
      .where(eq(agentCandidatesTable.id, candidateId));
  }

  // Helper methods
  private static createAIProvider(provider: any) {
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

  private static validateMatchScore(score: any): number {
    const numScore = Number(score);
    if (isNaN(numScore)) return 75; // Default score
    return Math.min(100, Math.max(1, numScore));
  }

  private static getOptimalModelConfig(experienceLevel: ExperienceLevel): Record<string, any> {
    const configs = {
      junior: {
        temperature: 0.3,
        maxTokens: 1500,
        topP: 0.8,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
      },
      mid: {
        temperature: 0.5,
        maxTokens: 2000,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.2,
      },
      senior: {
        temperature: 0.4,
        maxTokens: 2500,
        topP: 0.9,
        frequencyPenalty: 0.2,
        presencePenalty: 0.1,
      },
      expert: {
        temperature: 0.3,
        maxTokens: 3000,
        topP: 0.8,
        frequencyPenalty: 0.2,
        presencePenalty: 0.2,
      },
    };

    return configs[experienceLevel] || configs.mid;
  }

  private static getOptimalProviderType(candidate: any, requirements: string[]): string {
    // Simple heuristic for provider selection
    if (requirements.some(req => req.toLowerCase().includes('creative') || req.toLowerCase().includes('content'))) {
      return 'openai';
    }
    if (requirements.some(req => req.toLowerCase().includes('code') || req.toLowerCase().includes('technical'))) {
      return 'deepseek';
    }
    return 'openai'; // Default
  }

  private static generateFallbackCandidates(requirements: string[], preferredSkills: string[]): any[] {
    return [
      {
        suggestedName: 'Alex Developer',
        suggestedRole: 'Full-Stack Developer',
        personality: 'Analytical, detail-oriented, and collaborative',
        backstory: 'Experienced full-stack developer with expertise in modern web technologies',
        instructions: 'Help with development tasks, code review, and technical decision making',
        skills: requirements.slice(0, 5),
        specializations: ['Web Development', 'API Design'],
        experienceLevel: 'senior',
        matchScore: 85,
        reasoning: 'Strong match for full-stack development requirements',
        strengths: ['Problem solving', 'Code quality', 'Team collaboration'],
        idealFor: ['Feature development', 'Architecture planning', 'Code review'],
        modelParameters: this.getOptimalModelConfig('senior'),
        recommendedProviderType: 'openai',
      },
      {
        suggestedName: 'Jordan Specialist',
        suggestedRole: 'Frontend Specialist',
        personality: 'Creative, user-focused, and technically proficient',
        backstory: 'Frontend specialist with deep expertise in modern UI frameworks and user experience',
        instructions: 'Focus on user interface development, component design, and user experience optimization',
        skills: ['React', 'TypeScript', 'CSS', 'UX Design'].concat(preferredSkills.slice(0, 2)),
        specializations: ['Frontend Development', 'UI/UX Design', 'Performance Optimization'],
        experienceLevel: 'mid',
        matchScore: 78,
        reasoning: 'Specialized frontend skills complement full-stack capabilities',
        strengths: ['UI/UX Design', 'Frontend Architecture', 'User-Centric Development'],
        idealFor: ['Component development', 'UI design', 'Frontend optimization'],
        modelParameters: this.getOptimalModelConfig('mid'),
        recommendedProviderType: 'openai',
      },
    ];
  }

  private static generateFallbackTeamComposition(requirements: string[]): TeamComposition {
    return {
      recommended: [
        {
          role: 'Lead Developer',
          skills: requirements.slice(0, 3),
          priority: 10,
          reasoning: 'Essential for technical leadership and architecture decisions',
          estimatedWorkload: 'Full-time, 40h/week',
        },
        {
          role: 'Support Developer',
          skills: requirements.slice(1, 4),
          priority: 8,
          reasoning: 'Additional development capacity and specialized skills',
          estimatedWorkload: 'Part-time, 20h/week',
        },
      ],
      optimalTeamSize: 2,
      balanceScore: 7,
      collaborationDynamics: 'Balanced team with clear role separation and complementary skills',
    };
  }

  private static parseCandidate(dbCandidate: any): AgentCandidate {
    return {
      ...dbCandidate,
      skills: JSON.parse(dbCandidate.skills),
      specializations: dbCandidate.specializations ? JSON.parse(dbCandidate.specializations) : [],
      strengths: dbCandidate.strengths ? JSON.parse(dbCandidate.strengths) : [],
      idealFor: dbCandidate.idealFor ? JSON.parse(dbCandidate.idealFor) : [],
      modelParameters: dbCandidate.modelParameters ? JSON.parse(dbCandidate.modelParameters) : {},
      createdAt: new Date(dbCandidate.createdAt),
      updatedAt: new Date(dbCandidate.updatedAt),
    };
  }
}
```

### 3. Enhanced Job Processing Service

```typescript
// src/main/agents/hiring/job-processing.service.ts
import { eq } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { agentJobPostingsTable } from './hiring.schema';
import { ProjectAnalysisService } from './project-analysis.service';
import { CandidateGenerationService } from './candidate-generation.service';
import { JobPostingService } from './job-posting.service';

export class JobProcessingService {
  // Process job posting: analyze project and generate candidates
  static async processJobPosting(jobPostingId: string): Promise<void> {
    const db = getDatabase();

    try {
      const [jobPosting] = await db
        .select()
        .from(agentJobPostingsTable)
        .where(eq(agentJobPostingsTable.id, jobPostingId))
        .limit(1);

      if (!jobPosting) {
        throw new Error('Job posting not found');
      }

      console.log(`Processing job posting: ${jobPosting.title}`);

      // Step 1: Analyze project if context provided
      let projectAnalysis = null;
      if (jobPosting.projectContext) {
        const context = JSON.parse(jobPosting.projectContext);
        if (context.projectPath) {
          console.log(`Analyzing project at: ${context.projectPath}`);
          projectAnalysis = await ProjectAnalysisService.analyzeProject(context.projectPath);
        }
      }

      // Step 2: Generate team composition recommendation
      console.log('Generating team composition recommendation');
      const requirements = JSON.parse(jobPosting.requirements);
      const preferredSkills = jobPosting.preferredSkills ? JSON.parse(jobPosting.preferredSkills) : [];
      
      const teamComposition = await CandidateGenerationService.generateTeamComposition(
        requirements,
        preferredSkills,
        projectAnalysis,
        jobPosting.urgency
      );

      // Step 3: Update job posting with analysis results
      console.log('Updating job posting with analysis results');
      await JobPostingService.updateStatus(
        jobPostingId, 
        'candidates_ready',
        projectAnalysis,
        teamComposition
      );

      // Step 4: Generate AI candidates
      console.log('Generating AI candidates');
      await CandidateGenerationService.generateCandidatesForJob(jobPostingId);

      console.log(`Job posting processing completed: ${jobPosting.title}`);

    } catch (error) {
      console.error('Job posting processing failed:', error);
      
      // Mark as failed
      await JobPostingService.updateStatus(jobPostingId, 'cancelled');
      throw error;
    }
  }

  // Process job posting in background
  static async processJobPostingAsync(jobPostingId: string): Promise<void> {
    // Run processing in background without blocking
    this.processJobPosting(jobPostingId).catch(error => {
      console.error(`Background job processing failed for ${jobPostingId}:`, error);
    });
  }

  // Get processing status
  static async getProcessingStatus(jobPostingId: string): Promise<{
    status: string;
    hasAnalysis: boolean;
    hasCandidates: boolean;
    candidateCount: number;
  }> {
    const db = getDatabase();

    const [jobPosting] = await db
      .select()
      .from(agentJobPostingsTable)
      .where(eq(agentJobPostingsTable.id, jobPostingId))
      .limit(1);

    if (!jobPosting) {
      throw new Error('Job posting not found');
    }

    const candidates = await CandidateGenerationService.getCandidatesForJob(jobPostingId);

    return {
      status: jobPosting.status,
      hasAnalysis: !!jobPosting.analysisResult,
      hasCandidates: candidates.length > 0,
      candidateCount: candidates.length,
    };
  }
}
```

### 4. Enhanced IPC Handlers

```typescript
// Update src/main/agents/hiring/hiring.handlers.ts
import { CandidateGenerationService } from './candidate-generation.service';
import { JobProcessingService } from './job-processing.service';

export function setupHiringHandlers(): void {
  // ... existing handlers from 11A ...

  // Generate candidates for job
  ipcMain.handle(
    'hiring:generateCandidates',
    async (_, jobPostingId: string): Promise<IpcResponse> => {
      try {
        const candidates = await CandidateGenerationService.generateCandidatesForJob(jobPostingId);
        return { success: true, data: candidates };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate candidates',
        };
      }
    }
  );

  // Get candidates for job
  ipcMain.handle(
    'hiring:getCandidates',
    async (_, jobPostingId: string): Promise<IpcResponse> => {
      try {
        const candidates = await CandidateGenerationService.getCandidatesForJob(jobPostingId);
        return { success: true, data: candidates };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get candidates',
        };
      }
    }
  );

  // Generate team composition
  ipcMain.handle(
    'hiring:generateTeamComposition',
    async (_, requirements: string[], preferredSkills: string[], projectAnalysis?: any, urgency?: string): Promise<IpcResponse> => {
      try {
        const teamComposition = await CandidateGenerationService.generateTeamComposition(
          requirements,
          preferredSkills,
          projectAnalysis,
          urgency || 'medium'
        );
        return { success: true, data: teamComposition };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate team composition',
        };
      }
    }
  );

  // Process job posting
  ipcMain.handle(
    'hiring:processJob',
    async (_, jobPostingId: string): Promise<IpcResponse> => {
      try {
        await JobProcessingService.processJobPostingAsync(jobPostingId);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to process job posting',
        };
      }
    }
  );

  // Get processing status
  ipcMain.handle(
    'hiring:getProcessingStatus',
    async (_, jobPostingId: string): Promise<IpcResponse> => {
      try {
        const status = await JobProcessingService.getProcessingStatus(jobPostingId);
        return { success: true, data: status };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get processing status',
        };
      }
    }
  );

  // Update candidate status
  ipcMain.handle(
    'hiring:updateCandidateStatus',
    async (_, candidateId: string, status: string, hiredAsAgentId?: string): Promise<IpcResponse> => {
      try {
        await CandidateGenerationService.updateCandidateStatus(candidateId, status as any, hiredAsAgentId);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to update candidate status',
        };
      }
    }
  );
}
```

### 5. Enhanced Job Posting Service

```typescript
// Update src/main/agents/hiring/job-posting.service.ts
import { JobProcessingService } from './job-processing.service';

export class JobPostingService {
  // ... existing methods ...

  // Enhanced create method with automatic processing
  static async create(input: JobPostingInput, userId: string): Promise<SelectAgentJobPosting> {
    const db = getDatabase();

    const jobData: InsertAgentJobPosting = {
      userId,
      title: input.title,
      description: input.description,
      requirements: JSON.stringify(input.requirements),
      preferredSkills: input.preferredSkills ? JSON.stringify(input.preferredSkills) : null,
      projectContext: input.projectContext ? JSON.stringify(input.projectContext) : null,
      urgency: input.urgency || 'medium',
      deadline: input.deadline,
      status: 'analyzing',
    };

    const [jobPosting] = await db
      .insert(agentJobPostingsTable)
      .values(jobData)
      .returning();

    if (!jobPosting) {
      throw new Error('Failed to create job posting');
    }

    // Start processing in background
    JobProcessingService.processJobPostingAsync(jobPosting.id);

    return this.parseJobPosting(jobPosting);
  }
}
```

## Validation Checkpoints

### Checkpoint 1: AI Generation System
- Test candidate generation with various requirements
- Verify diversity in generated candidates (experience levels, roles)
- Test match score accuracy and reasoning quality
- Validate generated profile completeness

### Checkpoint 2: Team Composition
- Test team composition recommendations
- Verify role distribution and priority calculations
- Test balance score accuracy
- Validate collaboration dynamics suggestions

### Checkpoint 3: Processing Pipeline
- Test end-to-end job processing workflow
- Verify background processing doesn't block UI
- Test error handling and recovery
- Validate status updates throughout pipeline

## Success Criteria

✅ **Intelligent Generation**: AI creates diverse, relevant candidates with accurate match scores
✅ **Team Optimization**: Smart team composition recommendations based on project analysis
✅ **Processing Pipeline**: Robust background processing with status tracking
✅ **Quality Profiles**: Generated candidates have detailed, professional profiles
✅ **Performance**: Candidate generation completes within reasonable time limits

## Next Steps

After completing AI candidate generation:
1. **Move to Task 11C**: Implement hiring interface and workflow
2. **Enhanced AI**: Add candidate comparison and ranking features
3. **Analytics**: Track candidate generation success rates and user satisfaction

This task provides the sophisticated AI capabilities that make agent hiring intelligent and automated, generating optimal candidates tailored to specific project needs.