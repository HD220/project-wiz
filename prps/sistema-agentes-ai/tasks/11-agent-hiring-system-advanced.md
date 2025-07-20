# Task 11: Agent Hiring System - Advanced

## Overview

Implement an intelligent agent hiring system that analyzes project requirements, generates specialized agent candidates with optimal configurations, and provides smart recommendations for team composition. This system uses AI to understand project context and automatically suggest the best agent profiles for specific development needs.

## User Value

After completing this task, users can:
- Get intelligent agent recommendations based on project analysis
- Automatically generate specialized agents for detected project needs
- Receive optimal team composition suggestions
- Hire agents with pre-configured skills and expertise
- Build balanced development teams efficiently

## Technical Requirements

### Database Schema

```sql
-- Agent job postings for tracking hiring requests
CREATE TABLE agent_job_postings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    project_id TEXT REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL, -- JSON array of requirements
    preferred_skills TEXT, -- JSON array of skills
    project_context TEXT, -- JSON with project analysis
    
    -- Job status
    status TEXT NOT NULL DEFAULT 'analyzing', -- analyzing, candidates_ready, hiring, completed, cancelled
    priority INTEGER NOT NULL DEFAULT 5,
    urgency TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    
    -- Analysis results
    analysis_result TEXT, -- JSON with project analysis
    team_composition_recommendation TEXT, -- JSON with team structure
    
    -- Timing
    posted_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    deadline INTEGER, -- Optional deadline timestamp
    completed_at INTEGER,
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Generated agent candidates for job postings
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

-- Project analysis cache for performance
CREATE TABLE project_analyses (
    id TEXT PRIMARY KEY,
    project_path TEXT NOT NULL,
    file_hash TEXT NOT NULL, -- Hash of analyzed files
    
    -- Analysis results
    technology_stack TEXT NOT NULL, -- JSON array
    project_type TEXT NOT NULL, -- web, mobile, desktop, cli, library
    complexity_score INTEGER NOT NULL, -- 1-10
    development_phase TEXT NOT NULL, -- planning, development, testing, maintenance
    
    -- Detected needs
    missing_skills TEXT, -- JSON array of missing skills
    recommended_roles TEXT, -- JSON array of recommended roles
    team_gaps TEXT, -- JSON array of identified gaps
    
    -- Metadata
    analyzed_files_count INTEGER NOT NULL,
    analysis_duration INTEGER, -- in seconds
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    expires_at INTEGER NOT NULL -- Cache expiration
);

-- Agent hiring history for analytics
CREATE TABLE agent_hirings (
    id TEXT PRIMARY KEY,
    job_posting_id TEXT NOT NULL REFERENCES agent_job_postings(id),
    candidate_id TEXT NOT NULL REFERENCES agent_candidates(id),
    hired_agent_id TEXT NOT NULL REFERENCES agents(id),
    user_id TEXT NOT NULL REFERENCES users(id),
    
    -- Hiring details
    hiring_reason TEXT, -- Why this candidate was chosen
    customizations_made TEXT, -- JSON with any modifications made
    initial_feedback TEXT, -- User's first impressions
    
    -- Performance tracking
    performance_rating INTEGER, -- 1-5 stars after some usage
    performance_notes TEXT,
    would_recommend BOOLEAN,
    
    hired_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

### Core Types

```typescript
// Job posting types
export interface AgentJobPosting {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  description: string;
  requirements: string[];
  preferredSkills?: string[];
  projectContext?: ProjectContext;
  
  status: JobPostingStatus;
  priority: number;
  urgency: UrgencyLevel;
  
  analysisResult?: ProjectAnalysis;
  teamCompositionRecommendation?: TeamComposition;
  
  postedAt: Date;
  deadline?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type JobPostingStatus = 
  | 'analyzing' 
  | 'candidates_ready' 
  | 'hiring' 
  | 'completed' 
  | 'cancelled';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'urgent';

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

export interface ProjectAnalysis {
  technologyStack: string[];
  projectType: ProjectType;
  complexityScore: number; // 1-10
  developmentPhase: DevelopmentPhase;
  missingSkills: string[];
  recommendedRoles: string[];
  teamGaps: string[];
  analyzedFilesCount: number;
  analysisDuration?: number;
}

export type ProjectType = 'web' | 'mobile' | 'desktop' | 'cli' | 'library' | 'api';
export type DevelopmentPhase = 'planning' | 'development' | 'testing' | 'maintenance';

export interface TeamComposition {
  recommended: {
    role: string;
    skills: string[];
    priority: number;
    reasoning: string;
  }[];
  currentTeam?: {
    role: string;
    covered: boolean;
    gaps?: string[];
  }[];
  optimalTeamSize: number;
  balanceScore: number;
}

export interface ProjectContext {
  projectPath?: string;
  gitRemote?: string;
  packageManager?: string;
  buildTools: string[];
  testingFrameworks: string[];
  deploymentTargets: string[];
  teamSize?: number;
  timeline?: string;
  budget?: string;
}

export interface HiringRequest {
  title: string;
  description: string;
  requirements: string[];
  preferredSkills?: string[];
  urgency?: UrgencyLevel;
  deadline?: Date;
  projectContext?: ProjectContext;
}

export interface AgentHiring {
  id: string;
  jobPostingId: string;
  candidateId: string;
  hiredAgentId: string;
  userId: string;
  hiringReason?: string;
  customizationsMade?: Record<string, any>;
  initialFeedback?: string;
  performanceRating?: number;
  performanceNotes?: string;
  wouldRecommend?: boolean;
  hiredAt: Date;
  updatedAt: Date;
}
```

## Implementation Steps

### 1. Database Schema and Types

```typescript
// src/main/agents/hiring/hiring.schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { usersTable } from '../../user/users.schema';
import { agentsTable } from '../agents.schema';
import { projectsTable } from '../../project/projects.schema';

export const agentJobPostingsTable = sqliteTable('agent_job_postings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => usersTable.id),
  projectId: text('project_id').references(() => projectsTable.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements').notNull(), // JSON
  preferredSkills: text('preferred_skills'), // JSON
  projectContext: text('project_context'), // JSON
  
  status: text('status').notNull().default('analyzing'),
  priority: integer('priority').notNull().default(5),
  urgency: text('urgency').notNull().default('medium'),
  
  analysisResult: text('analysis_result'), // JSON
  teamCompositionRecommendation: text('team_composition_recommendation'), // JSON
  
  postedAt: integer('posted_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  deadline: integer('deadline', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

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

export const projectAnalysesTable = sqliteTable('project_analyses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectPath: text('project_path').notNull(),
  fileHash: text('file_hash').notNull(),
  
  technologyStack: text('technology_stack').notNull(), // JSON
  projectType: text('project_type').notNull(),
  complexityScore: integer('complexity_score').notNull(),
  developmentPhase: text('development_phase').notNull(),
  
  missingSkills: text('missing_skills'), // JSON
  recommendedRoles: text('recommended_roles'), // JSON
  teamGaps: text('team_gaps'), // JSON
  
  analyzedFilesCount: integer('analyzed_files_count').notNull(),
  analysisDuration: integer('analysis_duration'),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
});

export const agentHiringsTable = sqliteTable('agent_hirings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  jobPostingId: text('job_posting_id').notNull().references(() => agentJobPostingsTable.id),
  candidateId: text('candidate_id').notNull().references(() => agentCandidatesTable.id),
  hiredAgentId: text('hired_agent_id').notNull().references(() => agentsTable.id),
  userId: text('user_id').notNull().references(() => usersTable.id),
  
  hiringReason: text('hiring_reason'),
  customizationsMade: text('customizations_made'), // JSON
  initialFeedback: text('initial_feedback'),
  
  performanceRating: integer('performance_rating'),
  performanceNotes: text('performance_notes'),
  wouldRecommend: integer('would_recommend', { mode: 'boolean' }),
  
  hiredAt: integer('hired_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const agentJobPostingsRelations = relations(agentJobPostingsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [agentJobPostingsTable.userId],
    references: [usersTable.id],
  }),
  project: one(projectsTable, {
    fields: [agentJobPostingsTable.projectId],
    references: [projectsTable.id],
  }),
  candidates: many(agentCandidatesTable),
  hirings: many(agentHiringsTable),
}));

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
export type SelectAgentJobPosting = typeof agentJobPostingsTable.$inferSelect;
export type InsertAgentJobPosting = typeof agentJobPostingsTable.$inferInsert;
export type SelectAgentCandidate = typeof agentCandidatesTable.$inferSelect;
export type InsertAgentCandidate = typeof agentCandidatesTable.$inferInsert;
export type SelectProjectAnalysis = typeof projectAnalysesTable.$inferSelect;
export type InsertProjectAnalysis = typeof projectAnalysesTable.$inferInsert;
export type SelectAgentHiring = typeof agentHiringsTable.$inferSelect;
export type InsertAgentHiring = typeof agentHiringsTable.$inferInsert;
```

### 2. Project Analysis Service

```typescript
// src/main/agents/hiring/project-analysis.service.ts
import { readdir, readFile, stat } from 'fs/promises';
import { join, extname } from 'path';
import { eq } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { projectAnalysesTable } from './hiring.schema';
import { createHash } from 'crypto';
import type { ProjectAnalysis, ProjectType, DevelopmentPhase } from './hiring.types';

export class ProjectAnalysisService {
  // Analyze project structure and requirements
  static async analyzeProject(projectPath: string): Promise<ProjectAnalysis> {
    const startTime = Date.now();
    
    try {
      // Check cache first
      const cached = await this.getCachedAnalysis(projectPath);
      if (cached) {
        return cached;
      }

      // Perform fresh analysis
      const analysis = await this.performAnalysis(projectPath);
      
      // Cache results
      await this.cacheAnalysis(projectPath, analysis, Date.now() - startTime);
      
      return analysis;
    } catch (error) {
      console.error('Project analysis failed:', error);
      throw new Error('Failed to analyze project structure');
    }
  }

  private static async performAnalysis(projectPath: string): Promise<ProjectAnalysis> {
    const files = await this.scanProjectFiles(projectPath);
    const packageFiles = await this.analyzePackageFiles(projectPath);
    
    const technologyStack = this.detectTechnologyStack(files, packageFiles);
    const projectType = this.determineProjectType(files, packageFiles);
    const complexityScore = this.calculateComplexity(files, packageFiles);
    const developmentPhase = this.detectDevelopmentPhase(files, packageFiles);
    
    const missingSkills = this.detectMissingSkills(technologyStack, files);
    const recommendedRoles = this.recommendRoles(technologyStack, projectType, complexityScore);
    const teamGaps = this.identifyTeamGaps(technologyStack, files);

    return {
      technologyStack,
      projectType,
      complexityScore,
      developmentPhase,
      missingSkills,
      recommendedRoles,
      teamGaps,
      analyzedFilesCount: files.length,
    };
  }

  private static async scanProjectFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const maxFiles = 1000; // Limit to prevent excessive scanning
    
    const scanDirectory = async (dir: string, depth = 0): Promise<void> => {
      if (depth > 5 || files.length >= maxFiles) return; // Limit depth and file count
      
      try {
        const entries = await readdir(dir);
        
        for (const entry of entries) {
          if (files.length >= maxFiles) break;
          
          // Skip common directories
          if (['node_modules', '.git', 'dist', 'build', '.next', 'coverage'].includes(entry)) {
            continue;
          }
          
          const fullPath = join(dir, entry);
          const stats = await stat(fullPath);
          
          if (stats.isDirectory()) {
            await scanDirectory(fullPath, depth + 1);
          } else if (stats.isFile()) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    };

    await scanDirectory(projectPath);
    return files;
  }

  private static async analyzePackageFiles(projectPath: string): Promise<Record<string, any>> {
    const packageFiles: Record<string, any> = {};
    
    const packageFilesToCheck = [
      'package.json',
      'Cargo.toml',
      'requirements.txt',
      'pom.xml',
      'build.gradle',
      'composer.json',
    ];

    for (const fileName of packageFilesToCheck) {
      try {
        const filePath = join(projectPath, fileName);
        const content = await readFile(filePath, 'utf-8');
        
        if (fileName.endsWith('.json')) {
          packageFiles[fileName] = JSON.parse(content);
        } else {
          packageFiles[fileName] = content;
        }
      } catch (error) {
        // File doesn't exist or can't be read
      }
    }

    return packageFiles;
  }

  private static detectTechnologyStack(files: string[], packageFiles: Record<string, any>): string[] {
    const technologies = new Set<string>();

    // Detect from file extensions
    const extensionMap: Record<string, string[]> = {
      '.ts': ['TypeScript'],
      '.tsx': ['TypeScript', 'React'],
      '.js': ['JavaScript'],
      '.jsx': ['JavaScript', 'React'],
      '.vue': ['Vue.js'],
      '.py': ['Python'],
      '.rs': ['Rust'],
      '.go': ['Go'],
      '.java': ['Java'],
      '.kt': ['Kotlin'],
      '.swift': ['Swift'],
      '.php': ['PHP'],
      '.rb': ['Ruby'],
      '.cs': ['C#'],
      '.cpp': ['C++'],
      '.c': ['C'],
      '.html': ['HTML'],
      '.css': ['CSS'],
      '.scss': ['Sass'],
      '.less': ['Less'],
      '.sql': ['SQL'],
    };

    files.forEach(file => {
      const ext = extname(file);
      if (extensionMap[ext]) {
        extensionMap[ext].forEach(tech => technologies.add(tech));
      }
    });

    // Detect from package.json
    if (packageFiles['package.json']) {
      const pkg = packageFiles['package.json'];
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      Object.keys(deps).forEach(dep => {
        if (dep.includes('react')) technologies.add('React');
        if (dep.includes('vue')) technologies.add('Vue.js');
        if (dep.includes('angular')) technologies.add('Angular');
        if (dep.includes('express')) technologies.add('Express.js');
        if (dep.includes('nest')) technologies.add('NestJS');
        if (dep.includes('next')) technologies.add('Next.js');
        if (dep.includes('nuxt')) technologies.add('Nuxt.js');
        if (dep.includes('svelte')) technologies.add('Svelte');
        if (dep.includes('prisma')) technologies.add('Prisma');
        if (dep.includes('drizzle')) technologies.add('Drizzle ORM');
        if (dep.includes('sequelize')) technologies.add('Sequelize');
        if (dep.includes('mongoose')) technologies.add('MongoDB');
        if (dep.includes('redis')) technologies.add('Redis');
        if (dep.includes('socket.io')) technologies.add('Socket.io');
        if (dep.includes('graphql')) technologies.add('GraphQL');
        if (dep.includes('apollo')) technologies.add('Apollo');
        if (dep.includes('jest')) technologies.add('Jest');
        if (dep.includes('vitest')) technologies.add('Vitest');
        if (dep.includes('cypress')) technologies.add('Cypress');
        if (dep.includes('playwright')) technologies.add('Playwright');
        if (dep.includes('webpack')) technologies.add('Webpack');
        if (dep.includes('vite')) technologies.add('Vite');
        if (dep.includes('rollup')) technologies.add('Rollup');
        if (dep.includes('electron')) technologies.add('Electron');
        if (dep.includes('tailwind')) technologies.add('Tailwind CSS');
        if (dep.includes('styled-components')) technologies.add('Styled Components');
      });
    }

    // Detect from other package files
    if (packageFiles['Cargo.toml']) technologies.add('Rust');
    if (packageFiles['requirements.txt']) technologies.add('Python');
    if (packageFiles['pom.xml']) technologies.add('Java');
    if (packageFiles['build.gradle']) technologies.add('Java');
    if (packageFiles['composer.json']) technologies.add('PHP');

    return Array.from(technologies);
  }

  private static determineProjectType(files: string[], packageFiles: Record<string, any>): ProjectType {
    // Check package.json for clues
    if (packageFiles['package.json']) {
      const pkg = packageFiles['package.json'];
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['electron'] || deps['@electron/forge']) return 'desktop';
      if (deps['react-native'] || deps['expo']) return 'mobile';
      if (deps['express'] || deps['fastify'] || deps['koa']) return 'api';
      if (deps['react'] || deps['vue'] || deps['angular']) return 'web';
    }

    // Check file patterns
    const hasWebFiles = files.some(f => 
      f.includes('index.html') || 
      f.includes('public/') || 
      f.includes('src/pages/')
    );
    
    const hasMobileFiles = files.some(f => 
      f.includes('android/') || 
      f.includes('ios/') ||
      f.includes('.xcodeproj')
    );

    const hasApiFiles = files.some(f =>
      f.includes('routes/') ||
      f.includes('controllers/') ||
      f.includes('api/')
    );

    if (hasMobileFiles) return 'mobile';
    if (hasApiFiles) return 'api';
    if (hasWebFiles) return 'web';
    
    // Default based on most common patterns
    if (files.some(f => f.includes('main.') || f.includes('cli.'))) return 'cli';
    if (files.some(f => f.includes('lib/') || f.includes('src/lib/'))) return 'library';
    
    return 'web'; // Default fallback
  }

  private static calculateComplexity(files: string[], packageFiles: Record<string, any>): number {
    let complexity = 1;
    
    // File count factor
    if (files.length > 500) complexity += 2;
    else if (files.length > 200) complexity += 1;
    
    // Technology diversity
    const techCount = this.detectTechnologyStack(files, packageFiles).length;
    if (techCount > 10) complexity += 2;
    else if (techCount > 5) complexity += 1;
    
    // Package dependencies
    if (packageFiles['package.json']) {
      const pkg = packageFiles['package.json'];
      const depCount = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length;
      if (depCount > 50) complexity += 2;
      else if (depCount > 20) complexity += 1;
    }

    // Directory structure depth
    const maxDepth = Math.max(...files.map(f => f.split('/').length));
    if (maxDepth > 8) complexity += 1;
    
    return Math.min(complexity, 10); // Cap at 10
  }

  private static detectDevelopmentPhase(files: string[], packageFiles: Record<string, any>): DevelopmentPhase {
    const hasTests = files.some(f => 
      f.includes('test') || 
      f.includes('spec') ||
      f.includes('__tests__')
    );
    
    const hasCI = files.some(f =>
      f.includes('.github/workflows') ||
      f.includes('.gitlab-ci') ||
      f.includes('Jenkinsfile')
    );
    
    const hasBuiltFiles = files.some(f =>
      f.includes('dist/') ||
      f.includes('build/') ||
      f.includes('out/')
    );

    if (hasCI && hasTests && hasBuiltFiles) return 'maintenance';
    if (hasTests && hasBuiltFiles) return 'testing';
    if (files.length > 20) return 'development';
    
    return 'planning';
  }

  private static detectMissingSkills(technologies: string[], files: string[]): string[] {
    const missingSkills: string[] = [];
    
    // Check for common missing skills based on technology stack
    if (technologies.includes('React') && !technologies.includes('TypeScript')) {
      missingSkills.push('TypeScript integration');
    }
    
    if (technologies.includes('JavaScript') && !files.some(f => f.includes('test'))) {
      missingSkills.push('Testing setup');
    }
    
    if (technologies.includes('Node.js') && !technologies.includes('Express.js')) {
      missingSkills.push('Backend framework');
    }
    
    if (!files.some(f => f.includes('README'))) {
      missingSkills.push('Documentation');
    }
    
    if (!files.some(f => f.includes('.git'))) {
      missingSkills.push('Version control');
    }

    return missingSkills;
  }

  private static recommendRoles(technologies: string[], projectType: ProjectType, complexity: number): string[] {
    const roles = new Set<string>();

    // Core roles based on project type
    if (projectType === 'web') {
      roles.add('Frontend Developer');
      if (technologies.some(t => ['Node.js', 'Express.js', 'NestJS'].includes(t))) {
        roles.add('Full-Stack Developer');
      }
    }

    if (projectType === 'api') {
      roles.add('Backend Developer');
      roles.add('API Developer');
    }

    if (projectType === 'mobile') {
      roles.add('Mobile Developer');
    }

    if (projectType === 'desktop') {
      roles.add('Desktop Developer');
    }

    // Specialized roles based on technologies
    if (technologies.includes('React') || technologies.includes('Vue.js')) {
      roles.add('React Developer');
    }

    if (technologies.includes('TypeScript')) {
      roles.add('TypeScript Developer');
    }

    if (technologies.some(t => ['MongoDB', 'PostgreSQL', 'MySQL'].includes(t))) {
      roles.add('Database Developer');
    }

    if (technologies.includes('GraphQL')) {
      roles.add('GraphQL Developer');
    }

    // Additional roles based on complexity
    if (complexity >= 7) {
      roles.add('Tech Lead');
      roles.add('DevOps Engineer');
    }

    if (complexity >= 5) {
      roles.add('QA Engineer');
      roles.add('Code Reviewer');
    }

    // Always useful roles
    roles.add('Project Manager');
    roles.add('Documentation Specialist');

    return Array.from(roles);
  }

  private static identifyTeamGaps(technologies: string[], files: string[]): string[] {
    const gaps: string[] = [];
    
    if (!files.some(f => f.includes('test'))) {
      gaps.push('Testing strategy and implementation');
    }
    
    if (!files.some(f => f.includes('docker') || f.includes('ci'))) {
      gaps.push('DevOps and deployment setup');
    }
    
    if (!files.some(f => f.includes('docs') || f.includes('README'))) {
      gaps.push('Technical documentation');
    }
    
    if (technologies.length > 5 && !gaps.includes('Testing strategy and implementation')) {
      gaps.push('Technology integration and architecture review');
    }

    return gaps;
  }

  private static async getCachedAnalysis(projectPath: string): Promise<ProjectAnalysis | null> {
    const db = getDatabase();
    
    try {
      const fileHash = await this.generateProjectHash(projectPath);
      const now = Date.now() / 1000;
      
      const [cached] = await db
        .select()
        .from(projectAnalysesTable)
        .where(eq(projectAnalysesTable.projectPath, projectPath))
        .limit(1);

      if (cached && cached.expiresAt > now && cached.fileHash === fileHash) {
        return {
          technologyStack: JSON.parse(cached.technologyStack),
          projectType: cached.projectType as ProjectType,
          complexityScore: cached.complexityScore,
          developmentPhase: cached.developmentPhase as DevelopmentPhase,
          missingSkills: cached.missingSkills ? JSON.parse(cached.missingSkills) : [],
          recommendedRoles: cached.recommendedRoles ? JSON.parse(cached.recommendedRoles) : [],
          teamGaps: cached.teamGaps ? JSON.parse(cached.teamGaps) : [],
          analyzedFilesCount: cached.analyzedFilesCount,
          analysisDuration: cached.analysisDuration || undefined,
        };
      }
    } catch (error) {
      // Cache miss or error, proceed with fresh analysis
    }

    return null;
  }

  private static async cacheAnalysis(
    projectPath: string, 
    analysis: ProjectAnalysis, 
    duration: number
  ): Promise<void> {
    const db = getDatabase();
    
    try {
      const fileHash = await this.generateProjectHash(projectPath);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      await db.insert(projectAnalysesTable).values({
        projectPath,
        fileHash,
        technologyStack: JSON.stringify(analysis.technologyStack),
        projectType: analysis.projectType,
        complexityScore: analysis.complexityScore,
        developmentPhase: analysis.developmentPhase,
        missingSkills: JSON.stringify(analysis.missingSkills),
        recommendedRoles: JSON.stringify(analysis.recommendedRoles),
        teamGaps: JSON.stringify(analysis.teamGaps),
        analyzedFilesCount: analysis.analyzedFilesCount,
        analysisDuration: duration,
        expiresAt,
      });
    } catch (error) {
      // Cache write failed, not critical
      console.warn('Failed to cache project analysis:', error);
    }
  }

  private static async generateProjectHash(projectPath: string): Promise<string> {
    try {
      // Generate hash based on key project files
      const keyFiles = ['package.json', 'tsconfig.json', 'vite.config.ts', '.env.example'];
      const contents: string[] = [];
      
      for (const fileName of keyFiles) {
        try {
          const filePath = join(projectPath, fileName);
          const content = await readFile(filePath, 'utf-8');
          contents.push(content);
        } catch (error) {
          // File doesn't exist
        }
      }
      
      return createHash('md5').update(contents.join('')).digest('hex');
    } catch (error) {
      return Date.now().toString(); // Fallback to timestamp
    }
  }
}
```

### 3. Agent Hiring Service

```typescript
// src/main/agents/hiring/agent-hiring.service.ts
import { eq, and, desc } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { 
  agentJobPostingsTable, 
  agentCandidatesTable, 
  agentHiringsTable 
} from './hiring.schema';
import { agentsTable } from '../agents.schema';
import { AgentService } from '../agent.service';
import { LlmProviderService } from '../../llm/llm-provider.service';
import { ProjectAnalysisService } from './project-analysis.service';
import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import type { 
  HiringRequest, 
  AgentJobPosting, 
  AgentCandidate, 
  ProjectAnalysis,
  TeamComposition,
  AgentHiring
} from './hiring.types';

export class AgentHiringService {
  // Create a job posting and analyze requirements
  static async createJobPosting(
    request: HiringRequest, 
    userId: string
  ): Promise<AgentJobPosting> {
    const db = getDatabase();

    const jobData = {
      userId,
      title: request.title,
      description: request.description,
      requirements: JSON.stringify(request.requirements),
      preferredSkills: request.preferredSkills ? JSON.stringify(request.preferredSkills) : null,
      projectContext: request.projectContext ? JSON.stringify(request.projectContext) : null,
      urgency: request.urgency || 'medium',
      deadline: request.deadline,
      status: 'analyzing' as const,
    };

    const [jobPosting] = await db
      .insert(agentJobPostingsTable)
      .values(jobData)
      .returning();

    if (!jobPosting) {
      throw new Error('Failed to create job posting');
    }

    // Start analysis and candidate generation in background
    this.processJobPosting(jobPosting.id).catch(console.error);

    return this.parseJobPosting(jobPosting);
  }

  // Process job posting: analyze requirements and generate candidates
  private static async processJobPosting(jobPostingId: string): Promise<void> {
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

      // Analyze project if context provided
      let projectAnalysis: ProjectAnalysis | undefined;
      if (jobPosting.projectContext) {
        const context = JSON.parse(jobPosting.projectContext);
        if (context.projectPath) {
          projectAnalysis = await ProjectAnalysisService.analyzeProject(context.projectPath);
        }
      }

      // Generate team composition recommendation
      const teamComposition = await this.generateTeamComposition(
        JSON.parse(jobPosting.requirements),
        JSON.parse(jobPosting.preferredSkills || '[]'),
        projectAnalysis
      );

      // Update job posting with analysis
      await db
        .update(agentJobPostingsTable)
        .set({
          analysisResult: projectAnalysis ? JSON.stringify(projectAnalysis) : null,
          teamCompositionRecommendation: JSON.stringify(teamComposition),
          status: 'candidates_ready',
          updatedAt: new Date(),
        })
        .where(eq(agentJobPostingsTable.id, jobPostingId));

      // Generate agent candidates
      await this.generateCandidates(jobPostingId, JSON.parse(jobPosting.requirements), projectAnalysis);

    } catch (error) {
      console.error('Job posting processing failed:', error);
      
      // Mark as failed
      await db
        .update(agentJobPostingsTable)
        .set({
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(eq(agentJobPostingsTable.id, jobPostingId));
    }
  }

  // Generate team composition recommendation
  private static async generateTeamComposition(
    requirements: string[],
    preferredSkills: string[],
    projectAnalysis?: ProjectAnalysis
  ): Promise<TeamComposition> {
    // Use AI to analyze requirements and generate team composition
    const prompt = `Analyze these project requirements and generate optimal team composition:

Requirements: ${requirements.join(', ')}
Preferred Skills: ${preferredSkills.join(', ')}
${projectAnalysis ? `
Project Analysis:
- Technology Stack: ${projectAnalysis.technologyStack.join(', ')}
- Project Type: ${projectAnalysis.projectType}
- Complexity: ${projectAnalysis.complexityScore}/10
- Development Phase: ${projectAnalysis.developmentPhase}
- Missing Skills: ${projectAnalysis.missingSkills.join(', ')}
` : ''}

Generate a JSON response with optimal team composition including:
1. Recommended roles with priorities
2. Skills needed for each role
3. Reasoning for each recommendation
4. Optimal team size
5. Balance score (1-10)

Format as valid JSON.`;

    try {
      // Use a default LLM provider for analysis
      const provider = await LlmProviderService.getDefaultProvider();
      if (!provider) {
        throw new Error('No LLM provider available for analysis');
      }

      const aiProvider = createOpenAI({
        apiKey: provider.apiKey,
      });

      const response = await generateText({
        model: aiProvider('gpt-4o-mini'),
        prompt,
        temperature: 0.3,
        maxTokens: 1500,
      });

      const result = JSON.parse(response.text);
      
      return {
        recommended: result.recommended || [],
        optimalTeamSize: result.optimalTeamSize || 3,
        balanceScore: result.balanceScore || 7,
      };
    } catch (error) {
      console.error('Failed to generate team composition:', error);
      
      // Fallback composition
      return {
        recommended: [
          {
            role: 'Full-Stack Developer',
            skills: requirements.slice(0, 3),
            priority: 1,
            reasoning: 'Core development role based on requirements',
          },
        ],
        optimalTeamSize: 2,
        balanceScore: 6,
      };
    }
  }

  // Generate agent candidates for job posting
  private static async generateCandidates(
    jobPostingId: string,
    requirements: string[],
    projectAnalysis?: ProjectAnalysis
  ): Promise<void> {
    const candidates = await this.createCandidateProfiles(requirements, projectAnalysis);
    
    const db = getDatabase();
    
    for (const candidate of candidates) {
      await db.insert(agentCandidatesTable).values({
        jobPostingId,
        ...candidate,
        skills: JSON.stringify(candidate.skills),
        specializations: JSON.stringify(candidate.specializations || []),
        strengths: JSON.stringify(candidate.strengths || []),
        idealFor: JSON.stringify(candidate.idealFor || []),
        modelParameters: JSON.stringify(candidate.modelParameters || {}),
      });
    }
  }

  // Create candidate profiles using AI
  private static async createCandidateProfiles(
    requirements: string[],
    projectAnalysis?: ProjectAnalysis
  ): Promise<Omit<AgentCandidate, 'id' | 'jobPostingId' | 'createdAt' | 'updatedAt' | 'status' | 'hiredAsAgentId'>[]> {
    const prompt = `Generate 3-5 diverse AI agent candidates for this project:

Requirements: ${requirements.join(', ')}
${projectAnalysis ? `
Technology Stack: ${projectAnalysis.technologyStack.join(', ')}
Project Type: ${projectAnalysis.projectType}
Recommended Roles: ${projectAnalysis.recommendedRoles.join(', ')}
` : ''}

For each candidate, generate:
1. Suggested name (professional, creative)
2. Role title
3. Personality traits
4. Professional backstory
5. Specific instructions
6. Skills array
7. Experience level (junior/mid/senior/expert)
8. Match score (1-100)
9. Reasoning for recommendation
10. Strengths array
11. Ideal use cases

Create diverse candidates with different specializations and experience levels.
Format as JSON array.`;

    try {
      const provider = await LlmProviderService.getDefaultProvider();
      if (!provider) {
        throw new Error('No LLM provider available');
      }

      const aiProvider = createOpenAI({
        apiKey: provider.apiKey,
      });

      const response = await generateText({
        model: aiProvider('gpt-4o-mini'),
        prompt,
        temperature: 0.8, // Higher creativity for diverse candidates
        maxTokens: 3000,
      });

      const candidates = JSON.parse(response.text);
      
      return candidates.map((candidate: any) => ({
        suggestedName: candidate.suggestedName || 'AI Assistant',
        suggestedRole: candidate.suggestedRole || 'Developer',
        personality: candidate.personality || 'Professional and helpful',
        backstory: candidate.backstory || 'Experienced professional ready to help',
        instructions: candidate.instructions || 'Assist with development tasks',
        skills: candidate.skills || requirements.slice(0, 3),
        specializations: candidate.specializations || [],
        experienceLevel: candidate.experienceLevel || 'mid',
        matchScore: Math.min(100, Math.max(1, candidate.matchScore || 80)),
        reasoning: candidate.reasoning || 'Good match for project requirements',
        strengths: candidate.strengths || [],
        idealFor: candidate.idealFor || [],
        modelParameters: this.getOptimalModelConfig(candidate.experienceLevel),
        recommendedProviderType: 'openai',
      }));
    } catch (error) {
      console.error('Failed to generate candidates:', error);
      
      // Fallback candidates
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
      ];
    }
  }

  // Get optimal model configuration based on experience level
  private static getOptimalModelConfig(experienceLevel: string): Record<string, any> {
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

    return configs[experienceLevel as keyof typeof configs] || configs.mid;
  }

  // Hire a candidate and create actual agent
  static async hireCandidate(
    candidateId: string,
    userId: string,
    llmProviderId: string,
    customizations?: {
      name?: string;
      personality?: string;
      instructions?: string;
    }
  ): Promise<AgentHiring> {
    const db = getDatabase();

    // Get candidate details
    const [candidate] = await db
      .select()
      .from(agentCandidatesTable)
      .where(eq(agentCandidatesTable.id, candidateId))
      .limit(1);

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    if (candidate.status !== 'candidate') {
      throw new Error('Candidate is no longer available');
    }

    // Create actual agent
    const agentData = {
      name: customizations?.name || candidate.suggestedName,
      role: candidate.suggestedRole,
      personality: customizations?.personality || candidate.personality,
      backstory: candidate.backstory,
      instructions: customizations?.instructions || candidate.instructions,
      userId,
      llmProviderId,
      modelParameters: candidate.modelParameters,
    };

    const newAgent = await AgentService.create(agentData, userId);

    // Update candidate status
    await db
      .update(agentCandidatesTable)
      .set({
        status: 'hired',
        hiredAsAgentId: newAgent.id,
        updatedAt: new Date(),
      })
      .where(eq(agentCandidatesTable.id, candidateId));

    // Create hiring record
    const [hiring] = await db
      .insert(agentHiringsTable)
      .values({
        jobPostingId: candidate.jobPostingId,
        candidateId,
        hiredAgentId: newAgent.id,
        userId,
        customizationsMade: customizations ? JSON.stringify(customizations) : null,
      })
      .returning();

    return this.parseHiring(hiring);
  }

  // Get job postings for user
  static async getUserJobPostings(userId: string): Promise<AgentJobPosting[]> {
    const db = getDatabase();

    const postings = await db
      .select()
      .from(agentJobPostingsTable)
      .where(eq(agentJobPostingsTable.userId, userId))
      .orderBy(desc(agentJobPostingsTable.createdAt));

    return postings.map(posting => this.parseJobPosting(posting));
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

  // Helper methods to parse database results
  private static parseJobPosting(dbPosting: any): AgentJobPosting {
    return {
      ...dbPosting,
      requirements: JSON.parse(dbPosting.requirements),
      preferredSkills: dbPosting.preferredSkills ? JSON.parse(dbPosting.preferredSkills) : undefined,
      projectContext: dbPosting.projectContext ? JSON.parse(dbPosting.projectContext) : undefined,
      analysisResult: dbPosting.analysisResult ? JSON.parse(dbPosting.analysisResult) : undefined,
      teamCompositionRecommendation: dbPosting.teamCompositionRecommendation ? 
        JSON.parse(dbPosting.teamCompositionRecommendation) : undefined,
      postedAt: new Date(dbPosting.postedAt),
      deadline: dbPosting.deadline ? new Date(dbPosting.deadline) : undefined,
      completedAt: dbPosting.completedAt ? new Date(dbPosting.completedAt) : undefined,
      createdAt: new Date(dbPosting.createdAt),
      updatedAt: new Date(dbPosting.updatedAt),
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

  private static parseHiring(dbHiring: any): AgentHiring {
    return {
      ...dbHiring,
      customizationsMade: dbHiring.customizationsMade ? JSON.parse(dbHiring.customizationsMade) : undefined,
      hiredAt: new Date(dbHiring.hiredAt),
      updatedAt: new Date(dbHiring.updatedAt),
    };
  }
}
```

### 4. IPC Handlers

```typescript
// src/main/agents/hiring/hiring.handlers.ts
import { ipcMain } from 'electron';
import { AgentHiringService } from './agent-hiring.service';
import { ProjectAnalysisService } from './project-analysis.service';
import type { IpcResponse } from '../../types';
import type { HiringRequest } from './hiring.types';

export function setupHiringHandlers(): void {
  // Create job posting
  ipcMain.handle(
    'hiring:createJob',
    async (_, request: HiringRequest): Promise<IpcResponse> => {
      try {
        // TODO: Get current user ID from auth system
        const userId = 'current-user-id';
        const jobPosting = await AgentHiringService.createJobPosting(request, userId);
        return { success: true, data: jobPosting };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to create job posting',
        };
      }
    }
  );

  // Get user job postings
  ipcMain.handle(
    'hiring:getUserJobs',
    async (): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const jobPostings = await AgentHiringService.getUserJobPostings(userId);
        return { success: true, data: jobPostings };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get job postings',
        };
      }
    }
  );

  // Get candidates for job
  ipcMain.handle(
    'hiring:getCandidates',
    async (_, jobPostingId: string): Promise<IpcResponse> => {
      try {
        const candidates = await AgentHiringService.getCandidatesForJob(jobPostingId);
        return { success: true, data: candidates };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get candidates',
        };
      }
    }
  );

  // Hire candidate
  ipcMain.handle(
    'hiring:hireCandidate',
    async (_, candidateId: string, llmProviderId: string, customizations?: any): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const hiring = await AgentHiringService.hireCandidate(
          candidateId,
          userId,
          llmProviderId,
          customizations
        );
        return { success: true, data: hiring };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to hire candidate',
        };
      }
    }
  );

  // Analyze project
  ipcMain.handle(
    'hiring:analyzeProject',
    async (_, projectPath: string): Promise<IpcResponse> => {
      try {
        const analysis = await ProjectAnalysisService.analyzeProject(projectPath);
        return { success: true, data: analysis };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to analyze project',
        };
      }
    }
  );
}
```

### 5. Frontend Components

```typescript
// src/renderer/components/hiring/hiring-wizard.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Sparkles, FolderOpen } from 'lucide-react';
import type { HiringRequest, AgentJobPosting, AgentCandidate } from '@/types/hiring';

const hiringSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().min(1, 'Requirements are required'),
  preferredSkills: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'urgent']),
  projectPath: z.string().optional(),
});

interface HiringWizardProps {
  onJobCreated: (job: AgentJobPosting) => void;
}

export function HiringWizard({ onJobCreated }: HiringWizardProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentStep, setCurrentStep] = useState('details');

  const form = useForm<HiringRequest & { requirements: string; preferredSkills: string; projectPath: string }>({
    resolver: zodResolver(hiringSchema),
    defaultValues: {
      urgency: 'medium',
    },
  });

  const onSubmit = async (data: any) => {
    setIsCreating(true);
    try {
      const request: HiringRequest = {
        title: data.title,
        description: data.description,
        requirements: data.requirements.split(',').map((r: string) => r.trim()).filter(Boolean),
        preferredSkills: data.preferredSkills ? 
          data.preferredSkills.split(',').map((s: string) => s.trim()).filter(Boolean) : 
          undefined,
        urgency: data.urgency,
        projectContext: data.projectPath ? { projectPath: data.projectPath } : undefined,
      };

      const response = await window.api.hiring.createJob(request);
      
      if (response.success) {
        onJobCreated(response.data);
        toast({
          title: 'Job Posted Successfully',
          description: 'AI is analyzing your requirements and generating candidates.',
        });
        setOpen(false);
        form.reset();
        setCurrentStep('details');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Failed to Create Job',
        description: error instanceof Error ? error.message : 'Failed to create job posting',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectSelection = async () => {
    try {
      // Use file picker to select project directory
      const result = await window.electronAPI.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Project Directory',
      });

      if (!result.canceled && result.filePaths[0]) {
        form.setValue('projectPath', result.filePaths[0]);
        
        // Trigger project analysis
        toast({
          title: 'Analyzing Project',
          description: 'Scanning project structure for better recommendations.',
        });
        
        const analysisResponse = await window.api.hiring.analyzeProject(result.filePaths[0]);
        if (analysisResponse.success) {
          const analysis = analysisResponse.data;
          
          // Auto-fill requirements based on analysis
          const autoRequirements = [
            ...analysis.technologyStack,
            ...analysis.recommendedRoles,
            ...analysis.missingSkills,
          ].join(', ');
          
          form.setValue('requirements', autoRequirements);
          
          toast({
            title: 'Project Analyzed',
            description: 'Requirements have been auto-filled based on your project.',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze project. You can still proceed manually.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Hire AI Agent
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Intelligent Agent Hiring
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={currentStep} onValueChange={setCurrentStep} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Job Details</TabsTrigger>
            <TabsTrigger value="project">Project Analysis</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="details" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Describe Your Needs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g., Frontend Developer for React App" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Describe what you need help with..."
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Requirements (comma-separated)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="React, TypeScript, API integration..."
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="preferredSkills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Skills (optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="Next.js, Tailwind CSS, Jest..."
                                rows={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low - Can wait a few days</SelectItem>
                              <SelectItem value="medium">Medium - Need within a day</SelectItem>
                              <SelectItem value="high">High - Need ASAP</SelectItem>
                              <SelectItem value="urgent">Urgent - Critical blocker</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="project" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Analysis</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Let AI analyze your project to generate better recommendations
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleProjectSelection}
                        className="gap-2"
                      >
                        <FolderOpen className="h-4 w-4" />
                        Select Project Directory
                      </Button>
                      
                      {form.watch('projectPath') && (
                        <div className="flex-1">
                          <p className="text-sm font-medium">Selected:</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {form.watch('projectPath')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">What AI will analyze:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Technology stack and frameworks</li>
                        <li>• Project complexity and structure</li>
                        <li>• Missing skills and capabilities</li>
                        <li>• Recommended team composition</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <div className="flex justify-between">
                <div className="flex gap-2">
                  {currentStep === 'project' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('details')}
                    >
                      Previous
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {currentStep === 'details' && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep('project')}
                    >
                      Next: Project Analysis
                    </Button>
                  )}
                  
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? 'Creating Job...' : 'Post Job & Generate Candidates'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
```

### 6. Candidate Selection Interface

```typescript
// src/renderer/components/hiring/candidate-browser.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Star, User, Brain, Target, CheckCircle, Clock } from 'lucide-react';
import type { AgentCandidate, AgentJobPosting } from '@/types/hiring';

interface CandidateBrowserProps {
  jobPosting: AgentJobPosting;
  onCandidateHired: (candidate: AgentCandidate) => void;
}

export function CandidateBrowser({ jobPosting, onCandidateHired }: CandidateBrowserProps) {
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<AgentCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<AgentCandidate | null>(null);
  const [customizations, setCustomizations] = useState({
    name: '',
    personality: '',
    instructions: '',
  });
  const [isHiring, setIsHiring] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, [jobPosting.id]);

  const loadCandidates = async () => {
    try {
      const response = await window.api.hiring.getCandidates(jobPosting.id);
      if (response.success) {
        setCandidates(response.data);
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Failed to Load Candidates',
        description: error instanceof Error ? error.message : 'Failed to load candidates',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleHireCandidate = async (candidate: AgentCandidate) => {
    setIsHiring(true);
    try {
      // TODO: Get selected LLM provider
      const llmProviderId = 'default-provider-id';
      
      const hiringCustomizations = {
        name: customizations.name || candidate.suggestedName,
        personality: customizations.personality || candidate.personality,
        instructions: customizations.instructions || candidate.instructions,
      };

      const response = await window.api.hiring.hireCandidate(
        candidate.id,
        llmProviderId,
        hiringCustomizations
      );

      if (response.success) {
        onCandidateHired(candidate);
        toast({
          title: 'Agent Hired Successfully!',
          description: `${hiringCustomizations.name} has been added to your team.`,
        });
        setSelectedCandidate(null);
        loadCandidates(); // Refresh to show hired status
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast({
        title: 'Hiring Failed',
        description: error instanceof Error ? error.message : 'Failed to hire candidate',
        variant: 'destructive',
      });
    } finally {
      setIsHiring(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Generating AI candidates...</span>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            No candidates generated yet. Please check back in a moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">AI-Generated Candidates</h3>
          <p className="text-sm text-muted-foreground">
            {candidates.length} candidates found for "{jobPosting.title}"
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {candidates.map((candidate) => (
          <Card 
            key={candidate.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              candidate.status === 'hired' ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {candidate.suggestedName}
                    {candidate.status === 'hired' && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Hired
                      </Badge>
                    )}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {candidate.suggestedRole}
                  </p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{candidate.matchScore}/100</span>
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {candidate.experienceLevel}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {candidate.reasoning}
                </p>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-1">KEY SKILLS</h5>
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{candidate.skills.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div>
                <h5 className="text-xs font-medium text-muted-foreground mb-1">STRENGTHS</h5>
                <div className="flex flex-wrap gap-1">
                  {candidate.strengths.slice(0, 2).map((strength) => (
                    <Badge key={strength} variant="outline" className="text-xs">
                      {strength}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Match Score</span>
                  <span className="font-medium">{candidate.matchScore}%</span>
                </div>
                <Progress value={candidate.matchScore} className="h-1" />
              </div>
              
              <div className="flex gap-2">
                {candidate.status === 'candidate' ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedCandidate(candidate);
                          setCustomizations({
                            name: candidate.suggestedName,
                            personality: candidate.personality,
                            instructions: candidate.instructions,
                          });
                        }}
                      >
                        Hire Agent
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Hire {candidate.suggestedName}</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        <div className="grid gap-4">
                          <div>
                            <label className="text-sm font-medium">Agent Name</label>
                            <Input
                              value={customizations.name}
                              onChange={(e) => setCustomizations(prev => ({ ...prev, name: e.target.value }))}
                              placeholder={candidate.suggestedName}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Personality</label>
                            <Textarea
                              value={customizations.personality}
                              onChange={(e) => setCustomizations(prev => ({ ...prev, personality: e.target.value }))}
                              placeholder={candidate.personality}
                              rows={3}
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Instructions</label>
                            <Textarea
                              value={customizations.instructions}
                              onChange={(e) => setCustomizations(prev => ({ ...prev, instructions: e.target.value }))}
                              placeholder={candidate.instructions}
                              rows={4}
                            />
                          </div>
                        </div>
                        
                        <div className="bg-muted p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Candidate Details</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Experience:</span>
                              <span className="ml-2 capitalize">{candidate.experienceLevel}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Match Score:</span>
                              <span className="ml-2 font-medium">{candidate.matchScore}/100</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-muted-foreground">Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {candidate.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-4">
                          <Button variant="outline" onClick={() => setSelectedCandidate(null)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => handleHireCandidate(candidate)}
                            disabled={isHiring}
                          >
                            {isHiring ? 'Hiring...' : 'Confirm Hire'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button size="sm" variant="secondary" className="flex-1" disabled>
                    Already Hired
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Validation & Testing

### Manual Testing Checklist

- [ ] **Job Creation**: Create hiring requests with different requirements
- [ ] **Project Analysis**: Test automatic project analysis and requirement generation
- [ ] **Candidate Generation**: Verify AI generates diverse, relevant candidates
- [ ] **Candidate Hiring**: Successfully hire candidates and create agents
- [ ] **Customization**: Test candidate customization during hiring process
- [ ] **Team Composition**: Verify intelligent team recommendations

### Implementation Validation

1. **Database Schema**: Verify all tables created with proper relationships
2. **Project Analysis**: Test file scanning and technology detection
3. **AI Generation**: Test candidate generation with different inputs
4. **Service Layer**: Test all CRUD operations and business logic
5. **Frontend Integration**: Test complete hiring workflow

## Success Criteria

✅ **Intelligent Analysis**: AI analyzes projects and generates relevant requirements
✅ **Smart Candidates**: Generated candidates match project needs with high accuracy
✅ **Team Recommendations**: Provides optimal team composition suggestions
✅ **Seamless Hiring**: One-click hiring with customization options
✅ **Professional Interface**: Intuitive wizard-based hiring process

## Next Steps

After completing this task:
1. **Move to Task 12**: Implement Agent Collaboration for multi-agent workflows
2. **Analytics Enhancement**: Add hiring success metrics and candidate performance tracking
3. **Template System**: Create reusable job posting templates for common scenarios

This task transforms agent creation from manual configuration into an intelligent hiring process that understands project needs and generates optimal candidates automatically.