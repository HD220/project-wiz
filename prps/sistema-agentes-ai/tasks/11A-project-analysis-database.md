# Task 11A: Project Analysis & Database Foundation - Enhanced

## Overview

Establish the foundation for the intelligent agent hiring system with comprehensive database schema, project analysis capabilities, and technology detection. This micro-task creates the essential infrastructure for understanding project context and storing hiring data.

## User Value

After completing this task, users can:
- Get automatic project analysis with technology stack detection
- Store and cache project analysis results for performance
- Access foundational data structures for hiring workflows
- Benefit from intelligent project understanding capabilities

## Technical Requirements

### Prerequisites
- Existing database connection and migration system
- Project directory access for file scanning
- Node.js filesystem APIs for file analysis

### Database Schema Design

```sql
-- Core hiring system tables
CREATE TABLE agent_job_postings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    project_id TEXT REFERENCES projects(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL, -- JSON array
    preferred_skills TEXT, -- JSON array
    project_context TEXT, -- JSON with project analysis
    
    -- Job status and priority
    status TEXT NOT NULL DEFAULT 'analyzing', -- analyzing, candidates_ready, hiring, completed, cancelled
    priority INTEGER NOT NULL DEFAULT 5,
    urgency TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
    
    -- Analysis results (will be populated by later tasks)
    analysis_result TEXT, -- JSON with project analysis
    team_composition_recommendation TEXT, -- JSON with team structure
    
    -- Timing
    posted_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    deadline INTEGER, -- Optional deadline timestamp
    completed_at INTEGER,
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Project analysis cache for performance optimization
CREATE TABLE project_analyses (
    id TEXT PRIMARY KEY,
    project_path TEXT NOT NULL,
    file_hash TEXT NOT NULL, -- Hash of analyzed files for cache validation
    
    -- Analysis results
    technology_stack TEXT NOT NULL, -- JSON array
    project_type TEXT NOT NULL, -- web, mobile, desktop, cli, library, api
    complexity_score INTEGER NOT NULL, -- 1-10 scale
    development_phase TEXT NOT NULL, -- planning, development, testing, maintenance
    
    -- Detected needs and recommendations
    missing_skills TEXT, -- JSON array of missing skills
    recommended_roles TEXT, -- JSON array of recommended roles
    team_gaps TEXT, -- JSON array of identified gaps
    
    -- Metadata
    analyzed_files_count INTEGER NOT NULL,
    analysis_duration INTEGER, -- Analysis time in seconds
    
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    expires_at INTEGER NOT NULL -- Cache expiration timestamp
);

-- Performance indexes
CREATE INDEX agent_job_postings_user_id_idx ON agent_job_postings(user_id);
CREATE INDEX agent_job_postings_status_idx ON agent_job_postings(status);
CREATE INDEX project_analyses_path_idx ON project_analyses(project_path);
CREATE INDEX project_analyses_expires_idx ON project_analyses(expires_at);
```

### Core Types

```typescript
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
```

## Implementation Steps

### 1. Database Schema Implementation

```typescript
// src/main/agents/hiring/hiring.schema.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { usersTable } from '../../user/users.schema';
import { projectsTable } from '../../project/projects.schema';

// Main job postings table
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
  
  analysisResult: text('analysis_result'), // JSON - for future tasks
  teamCompositionRecommendation: text('team_composition_recommendation'), // JSON - for future tasks
  
  postedAt: integer('posted_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  deadline: integer('deadline', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Project analysis cache table
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

// Performance indexes
export const jobPostingsUserIndex = index('agent_job_postings_user_id_idx')
  .on(agentJobPostingsTable.userId);
export const jobPostingsStatusIndex = index('agent_job_postings_status_idx')
  .on(agentJobPostingsTable.status);
export const projectAnalysesPathIndex = index('project_analyses_path_idx')
  .on(projectAnalysesTable.projectPath);
export const projectAnalysesExpiresIndex = index('project_analyses_expires_idx')
  .on(projectAnalysesTable.expiresAt);

// Relations
export const agentJobPostingsRelations = relations(agentJobPostingsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [agentJobPostingsTable.userId],
    references: [usersTable.id],
  }),
  project: one(projectsTable, {
    fields: [agentJobPostingsTable.projectId],
    references: [projectsTable.id],
  }),
}));

// Type inference
export type SelectAgentJobPosting = typeof agentJobPostingsTable.$inferSelect;
export type InsertAgentJobPosting = typeof agentJobPostingsTable.$inferInsert;
export type SelectProjectAnalysis = typeof projectAnalysesTable.$inferSelect;
export type InsertProjectAnalysis = typeof projectAnalysesTable.$inferInsert;
```

### 2. Project Analysis Service

```typescript
// src/main/agents/hiring/project-analysis.service.ts
import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { eq } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { projectAnalysesTable } from './hiring.schema';
import { createHash } from 'crypto';
import type { ProjectAnalysis, ProjectType, DevelopmentPhase } from './hiring.types';

export class ProjectAnalysisService {
  // Main analysis function with caching
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
      
      // Cache results for 24 hours
      await this.cacheAnalysis(projectPath, analysis, Date.now() - startTime);
      
      return analysis;
    } catch (error) {
      console.error('Project analysis failed:', error);
      throw new Error(`Failed to analyze project: ${error.message}`);
    }
  }

  // Core analysis implementation
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

  // File scanning with optimizations
  private static async scanProjectFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    const maxFiles = 1000; // Limit to prevent excessive scanning
    const excludePatterns = [
      'node_modules', '.git', 'dist', 'build', '.next', 'coverage', 
      '.cache', '.nuxt', '.output', 'target', 'vendor'
    ];
    
    const scanDirectory = async (dir: string, depth = 0): Promise<void> => {
      if (depth > 5 || files.length >= maxFiles) return;
      
      try {
        const entries = await readdir(dir);
        
        for (const entry of entries) {
          if (files.length >= maxFiles) break;
          
          // Skip excluded directories and files
          if (excludePatterns.some(pattern => entry.includes(pattern))) {
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

  // Package file analysis for dependency detection
  private static async analyzePackageFiles(projectPath: string): Promise<Record<string, any>> {
    const packageFiles: Record<string, any> = {};
    
    const packageFilesToCheck = [
      'package.json',      // Node.js
      'Cargo.toml',        // Rust
      'requirements.txt',  // Python
      'pyproject.toml',    // Python
      'pom.xml',          // Java Maven
      'build.gradle',     // Java Gradle
      'composer.json',    // PHP
      'go.mod',           // Go
      'Gemfile',          // Ruby
      'mix.exs',          // Elixir
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

  // Technology stack detection with comprehensive patterns
  private static detectTechnologyStack(files: string[], packageFiles: Record<string, any>): string[] {
    const technologies = new Set<string>();

    // File extension mapping
    const extensionMap: Record<string, string[]> = {
      '.ts': ['TypeScript'],
      '.tsx': ['TypeScript', 'React'],
      '.js': ['JavaScript'],
      '.jsx': ['JavaScript', 'React'],
      '.vue': ['Vue.js'],
      '.svelte': ['Svelte'],
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
      '.dart': ['Dart', 'Flutter'],
      '.ex': ['Elixir'],
      '.exs': ['Elixir'],
    };

    // Detect from file extensions
    files.forEach(file => {
      const ext = extname(file);
      if (extensionMap[ext]) {
        extensionMap[ext].forEach(tech => technologies.add(tech));
      }
    });

    // Detect from package.json dependencies
    if (packageFiles['package.json']) {
      const pkg = packageFiles['package.json'];
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      const dependencyMap: Record<string, string[]> = {
        'react': ['React'],
        'vue': ['Vue.js'],
        'angular': ['Angular'],
        'svelte': ['Svelte'],
        'express': ['Express.js', 'Node.js'],
        'fastify': ['Fastify', 'Node.js'],
        'koa': ['Koa', 'Node.js'],
        'nestjs': ['NestJS', 'Node.js'],
        'next': ['Next.js', 'React'],
        'nuxt': ['Nuxt.js', 'Vue.js'],
        'gatsby': ['Gatsby', 'React'],
        'prisma': ['Prisma'],
        'drizzle-orm': ['Drizzle ORM'],
        'sequelize': ['Sequelize'],
        'mongoose': ['MongoDB', 'Mongoose'],
        'redis': ['Redis'],
        'socket.io': ['Socket.io'],
        'graphql': ['GraphQL'],
        'apollo': ['Apollo GraphQL'],
        'jest': ['Jest'],
        'vitest': ['Vitest'],
        'cypress': ['Cypress'],
        'playwright': ['Playwright'],
        'webpack': ['Webpack'],
        'vite': ['Vite'],
        'rollup': ['Rollup'],
        'electron': ['Electron'],
        'tailwindcss': ['Tailwind CSS'],
        'styled-components': ['Styled Components'],
        'material-ui': ['Material-UI'],
        'chakra-ui': ['Chakra UI'],
        'typescript': ['TypeScript'],
      };
      
      Object.keys(deps).forEach(dep => {
        const normalizedDep = dep.toLowerCase();
        for (const [pattern, techs] of Object.entries(dependencyMap)) {
          if (normalizedDep.includes(pattern)) {
            techs.forEach(tech => technologies.add(tech));
          }
        }
      });
    }

    // Detect from other package files
    if (packageFiles['Cargo.toml']) technologies.add('Rust');
    if (packageFiles['requirements.txt']) technologies.add('Python');
    if (packageFiles['pyproject.toml']) technologies.add('Python');
    if (packageFiles['pom.xml']) technologies.add('Java');
    if (packageFiles['build.gradle']) technologies.add('Java');
    if (packageFiles['composer.json']) technologies.add('PHP');
    if (packageFiles['go.mod']) technologies.add('Go');
    if (packageFiles['Gemfile']) technologies.add('Ruby');
    if (packageFiles['mix.exs']) technologies.add('Elixir');

    return Array.from(technologies);
  }

  // Project type determination
  private static determineProjectType(files: string[], packageFiles: Record<string, any>): ProjectType {
    // Check package.json for clues
    if (packageFiles['package.json']) {
      const pkg = packageFiles['package.json'];
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      
      if (deps['electron'] || deps['@electron/forge'] || deps['@electron-forge/cli']) return 'desktop';
      if (deps['react-native'] || deps['expo'] || deps['@react-native/cli']) return 'mobile';
      if (deps['express'] || deps['fastify'] || deps['koa'] || deps['@nestjs/core']) return 'api';
      if (deps['react'] || deps['vue'] || deps['@angular/core'] || deps['svelte']) return 'web';
    }

    // Check file patterns
    const hasWebFiles = files.some(f => 
      basename(f) === 'index.html' || 
      f.includes('/public/') || 
      f.includes('/pages/') ||
      f.includes('/src/pages/')
    );
    
    const hasMobileFiles = files.some(f => 
      f.includes('/android/') || 
      f.includes('/ios/') ||
      f.includes('.xcodeproj') ||
      basename(f) === 'AndroidManifest.xml'
    );

    const hasApiFiles = files.some(f =>
      f.includes('/routes/') ||
      f.includes('/controllers/') ||
      f.includes('/api/') ||
      f.includes('/server/')
    );

    const hasDesktopFiles = files.some(f =>
      f.includes('/main/') && f.includes('/renderer/') ||
      basename(f) === 'main.ts' ||
      basename(f) === 'electron.ts'
    );

    if (hasDesktopFiles) return 'desktop';
    if (hasMobileFiles) return 'mobile';
    if (hasApiFiles) return 'api';
    if (hasWebFiles) return 'web';
    
    // Default based on common patterns
    if (files.some(f => basename(f).includes('main.') || basename(f).includes('cli.'))) return 'cli';
    if (files.some(f => f.includes('/lib/') || f.includes('/src/lib/'))) return 'library';
    
    return 'web'; // Default fallback
  }

  // Complexity calculation
  private static calculateComplexity(files: string[], packageFiles: Record<string, any>): number {
    let complexity = 1;
    
    // File count factor
    if (files.length > 500) complexity += 3;
    else if (files.length > 200) complexity += 2;
    else if (files.length > 50) complexity += 1;
    
    // Technology diversity
    const techCount = this.detectTechnologyStack(files, packageFiles).length;
    if (techCount > 15) complexity += 3;
    else if (techCount > 8) complexity += 2;
    else if (techCount > 4) complexity += 1;
    
    // Package dependencies
    if (packageFiles['package.json']) {
      const pkg = packageFiles['package.json'];
      const depCount = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length;
      if (depCount > 100) complexity += 3;
      else if (depCount > 50) complexity += 2;
      else if (depCount > 20) complexity += 1;
    }

    // Directory structure depth
    const maxDepth = Math.max(...files.map(f => f.split('/').length));
    if (maxDepth > 10) complexity += 2;
    else if (maxDepth > 8) complexity += 1;
    
    return Math.min(complexity, 10); // Cap at 10
  }

  // Development phase detection
  private static detectDevelopmentPhase(files: string[], packageFiles: Record<string, any>): DevelopmentPhase {
    const hasTests = files.some(f => 
      f.includes('/test/') || 
      f.includes('/tests/') ||
      f.includes('/__tests__/') ||
      f.includes('.test.') ||
      f.includes('.spec.')
    );
    
    const hasCI = files.some(f =>
      f.includes('/.github/workflows/') ||
      f.includes('/.gitlab-ci') ||
      basename(f) === 'Jenkinsfile' ||
      basename(f) === '.travis.yml'
    );
    
    const hasBuiltFiles = files.some(f =>
      f.includes('/dist/') ||
      f.includes('/build/') ||
      f.includes('/out/') ||
      f.includes('/.next/')
    );

    const hasDocumentation = files.some(f =>
      basename(f).toLowerCase().includes('readme') ||
      f.includes('/docs/') ||
      f.includes('/documentation/')
    );

    if (hasCI && hasTests && hasBuiltFiles && hasDocumentation) return 'maintenance';
    if (hasTests && hasBuiltFiles) return 'testing';
    if (files.length > 20 && hasDocumentation) return 'development';
    
    return 'planning';
  }

  // Missing skills detection
  private static detectMissingSkills(technologies: string[], files: string[]): string[] {
    const missingSkills: string[] = [];
    
    // Check for common missing skills based on technology stack
    if (technologies.includes('React') && !technologies.includes('TypeScript')) {
      missingSkills.push('TypeScript integration');
    }
    
    if (technologies.includes('JavaScript') && !files.some(f => f.includes('test'))) {
      missingSkills.push('Testing setup');
    }
    
    if (technologies.includes('Node.js') && !technologies.some(t => ['Express.js', 'Fastify', 'NestJS'].includes(t))) {
      missingSkills.push('Backend framework');
    }
    
    if (!files.some(f => basename(f).toLowerCase().includes('readme'))) {
      missingSkills.push('Documentation');
    }
    
    if (!files.some(f => f.includes('/.git'))) {
      missingSkills.push('Version control setup');
    }

    if (technologies.length > 5 && !files.some(f => f.includes('docker'))) {
      missingSkills.push('Containerization');
    }

    if (!files.some(f => f.includes('.env') || f.includes('config'))) {
      missingSkills.push('Configuration management');
    }

    return missingSkills;
  }

  // Role recommendations
  private static recommendRoles(technologies: string[], projectType: ProjectType, complexity: number): string[] {
    const roles = new Set<string>();

    // Core roles based on project type
    switch (projectType) {
      case 'web':
        roles.add('Frontend Developer');
        if (technologies.some(t => ['Node.js', 'Express.js', 'NestJS'].includes(t))) {
          roles.add('Full-Stack Developer');
        }
        break;
      case 'api':
        roles.add('Backend Developer');
        roles.add('API Developer');
        break;
      case 'mobile':
        roles.add('Mobile Developer');
        break;
      case 'desktop':
        roles.add('Desktop Developer');
        break;
      case 'cli':
        roles.add('CLI Developer');
        break;
      case 'library':
        roles.add('Library Developer');
        break;
    }

    // Specialized roles based on technologies
    if (technologies.includes('React') || technologies.includes('Vue.js') || technologies.includes('Angular')) {
      roles.add('Frontend Specialist');
    }

    if (technologies.includes('TypeScript')) {
      roles.add('TypeScript Developer');
    }

    if (technologies.some(t => ['MongoDB', 'PostgreSQL', 'MySQL', 'Prisma', 'Drizzle ORM'].includes(t))) {
      roles.add('Database Developer');
    }

    if (technologies.includes('GraphQL')) {
      roles.add('GraphQL Developer');
    }

    // Additional roles based on complexity
    if (complexity >= 8) {
      roles.add('Tech Lead');
      roles.add('DevOps Engineer');
      roles.add('System Architect');
    }

    if (complexity >= 6) {
      roles.add('QA Engineer');
      roles.add('Code Reviewer');
    }

    if (complexity >= 4) {
      roles.add('Technical Writer');
    }

    // Always useful roles
    roles.add('Project Manager');
    roles.add('Code Mentor');

    return Array.from(roles);
  }

  // Team gap identification
  private static identifyTeamGaps(technologies: string[], files: string[]): string[] {
    const gaps: string[] = [];
    
    if (!files.some(f => f.includes('test'))) {
      gaps.push('Testing strategy and implementation');
    }
    
    if (!files.some(f => f.includes('docker') || f.includes('/.github') || f.includes('ci'))) {
      gaps.push('DevOps and deployment automation');
    }
    
    if (!files.some(f => f.includes('/docs/') || basename(f).toLowerCase().includes('readme'))) {
      gaps.push('Technical documentation and guides');
    }
    
    if (technologies.length > 8) {
      gaps.push('Technology integration and architecture review');
    }

    if (!files.some(f => f.includes('security') || f.includes('auth'))) {
      gaps.push('Security implementation and review');
    }

    if (!files.some(f => f.includes('performance') || f.includes('optimization'))) {
      gaps.push('Performance optimization');
    }

    return gaps;
  }

  // Cache management
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
        analysisDuration: Math.round(duration / 1000),
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
      const keyFiles = ['package.json', 'tsconfig.json', 'vite.config.ts', 'webpack.config.js', 'Cargo.toml'];
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

  // Clean expired cache entries
  static async cleanExpiredCache(): Promise<void> {
    const db = getDatabase();
    const now = Date.now() / 1000;
    
    try {
      await db
        .delete(projectAnalysesTable)
        .where(eq(projectAnalysesTable.expiresAt, now));
    } catch (error) {
      console.warn('Failed to clean expired cache:', error);
    }
  }
}
```

### 3. Basic Job Posting Service

```typescript
// src/main/agents/hiring/job-posting.service.ts
import { eq, desc } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { agentJobPostingsTable } from './hiring.schema';
import type { InsertAgentJobPosting, SelectAgentJobPosting } from './hiring.schema';

export interface JobPostingInput {
  title: string;
  description: string;
  requirements: string[];
  preferredSkills?: string[];
  urgency?: 'low' | 'medium' | 'high' | 'urgent';
  deadline?: Date;
  projectContext?: {
    projectPath?: string;
    buildTools?: string[];
    testingFrameworks?: string[];
    deploymentTargets?: string[];
  };
}

export class JobPostingService {
  // Create job posting
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

    return this.parseJobPosting(jobPosting);
  }

  // Get user job postings
  static async getUserJobPostings(userId: string): Promise<SelectAgentJobPosting[]> {
    const db = getDatabase();

    const postings = await db
      .select()
      .from(agentJobPostingsTable)
      .where(eq(agentJobPostingsTable.userId, userId))
      .orderBy(desc(agentJobPostingsTable.createdAt));

    return postings.map(posting => this.parseJobPosting(posting));
  }

  // Get job posting by ID
  static async findById(jobPostingId: string): Promise<SelectAgentJobPosting | null> {
    const db = getDatabase();

    const [posting] = await db
      .select()
      .from(agentJobPostingsTable)
      .where(eq(agentJobPostingsTable.id, jobPostingId))
      .limit(1);

    return posting ? this.parseJobPosting(posting) : null;
  }

  // Update job posting status
  static async updateStatus(
    jobPostingId: string, 
    status: string, 
    analysisResult?: any, 
    teamComposition?: any
  ): Promise<void> {
    const db = getDatabase();

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (analysisResult) {
      updateData.analysisResult = JSON.stringify(analysisResult);
    }

    if (teamComposition) {
      updateData.teamCompositionRecommendation = JSON.stringify(teamComposition);
    }

    await db
      .update(agentJobPostingsTable)
      .set(updateData)
      .where(eq(agentJobPostingsTable.id, jobPostingId));
  }

  // Helper to parse database result
  private static parseJobPosting(dbPosting: any): SelectAgentJobPosting {
    return {
      ...dbPosting,
      requirements: JSON.parse(dbPosting.requirements),
      preferredSkills: dbPosting.preferredSkills ? JSON.parse(dbPosting.preferredSkills) : null,
      projectContext: dbPosting.projectContext ? JSON.parse(dbPosting.projectContext) : null,
      analysisResult: dbPosting.analysisResult ? JSON.parse(dbPosting.analysisResult) : null,
      teamCompositionRecommendation: dbPosting.teamCompositionRecommendation ? 
        JSON.parse(dbPosting.teamCompositionRecommendation) : null,
      postedAt: new Date(dbPosting.postedAt),
      deadline: dbPosting.deadline ? new Date(dbPosting.deadline) : null,
      completedAt: dbPosting.completedAt ? new Date(dbPosting.completedAt) : null,
      createdAt: new Date(dbPosting.createdAt),
      updatedAt: new Date(dbPosting.updatedAt),
    };
  }
}
```

### 4. Basic IPC Handlers

```typescript
// src/main/agents/hiring/hiring.handlers.ts
import { ipcMain } from 'electron';
import { ProjectAnalysisService } from './project-analysis.service';
import { JobPostingService } from './job-posting.service';
import type { IpcResponse } from '../../types';
import type { JobPostingInput } from './job-posting.service';

export function setupHiringHandlers(): void {
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

  // Create basic job posting
  ipcMain.handle(
    'hiring:createJobPosting',
    async (_, input: JobPostingInput): Promise<IpcResponse> => {
      try {
        // TODO: Get current user ID from auth system
        const userId = 'current-user-id';
        const jobPosting = await JobPostingService.create(input, userId);
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
    'hiring:getUserJobPostings',
    async (): Promise<IpcResponse> => {
      try {
        const userId = 'current-user-id';
        const jobPostings = await JobPostingService.getUserJobPostings(userId);
        return { success: true, data: jobPostings };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to get job postings',
        };
      }
    }
  );

  // Clean expired cache
  ipcMain.handle(
    'hiring:cleanCache',
    async (): Promise<IpcResponse> => {
      try {
        await ProjectAnalysisService.cleanExpiredCache();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to clean cache',
        };
      }
    }
  );
}
```

## Validation Checkpoints

### Checkpoint 1: Database Foundation
- Verify job posting and analysis tables created properly
- Test job posting CRUD operations
- Validate foreign key relationships and indexes

### Checkpoint 2: Project Analysis
- Test file scanning with different project structures
- Verify technology stack detection accuracy
- Test complexity calculation and development phase detection
- Validate caching mechanism and expiration

### Checkpoint 3: Analysis Performance
- Test analysis with large codebases (1000+ files)
- Verify cache hit/miss behavior
- Test expired cache cleanup functionality
- Validate analysis completion within reasonable time

## Success Criteria

✅ **Database Foundation**: All hiring tables created with proper schema and relationships
✅ **Project Analysis**: Accurate technology detection and project understanding
✅ **Performance Optimization**: Efficient file scanning with smart caching
✅ **Data Management**: Reliable job posting creation and retrieval
✅ **Cache System**: Effective caching with automatic expiration

## Next Steps

After completing this foundation:
1. **Move to Task 11B**: Implement AI candidate generation system
2. **Enhanced Analysis**: Add code quality metrics and security scanning
3. **Performance Tuning**: Optimize file scanning for very large projects

This task establishes the essential infrastructure for intelligent project analysis and hiring data management, enabling sophisticated agent recommendation capabilities.