# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-010
title: Agent Tools Integration - Advanced Implementation
description: Implement agent tool system for performing actions beyond chat
source_document: prps/sistema-agentes-ai/README.md
priority: low
estimated_effort: 5 hours
dependencies: [TASK-005, TASK-009]
tech_stack: [Electron, React, TypeScript, AI SDK Tools, Node.js APIs]
domain_context: Agent System - Tool Integration and Action Execution
project_type: desktop
feature_level: advanced
delivers_value: Agents can perform file operations, Git commands, and system interactions
```

## Primary Goal

**Enable agents to use tools for performing actions like file management, Git operations, and system interactions through AI SDK tool calling**

### Success Criteria
- [ ] Agents can execute file system operations (create, read, update, delete files)
- [ ] Git integration tools for repository management
- [ ] Project analysis tools for codebase understanding
- [ ] Communication tools for inter-agent messaging
- [ ] Tool execution results are tracked and displayed
- [ ] Tool permissions and safety controls implemented
- [ ] Custom tool development framework available

## Complete Context

### Project Architecture Context
```
project-wiz/
├── src/
│   ├── main/                    # Backend (Electron main process)
│   │   ├── agents/              # Agent bounded context
│   │   │   ├── tools/           # NEW - Tool system
│   │   │   │   ├── tools.schema.ts # Tool execution tracking
│   │   │   │   ├── tool-registry.ts # Available tools registry
│   │   │   │   ├── file-tools.ts # File system operations
│   │   │   │   ├── git-tools.ts # Git operations
│   │   │   │   ├── analysis-tools.ts # Code analysis
│   │   │   │   ├── communication-tools.ts # Agent messaging
│   │   │   │   └── tool.handlers.ts # IPC handlers
│   │   │   ├── agent-chat.service.ts # Enhanced with tools
│   │   │   └── tasks/           # From TASK-009
│   │   └── main.ts              # Tool registration
│   └── renderer/                # Frontend (React)
│       ├── app/                 # Tool management pages
│       │   └── agents/
│       │       └── [agentId]/
│       │           └── tools.tsx # NEW - Tool usage monitoring
│       ├── components/          # Tool components
│       └── store/               # Tool store management
```

### Technology-Specific Context
```yaml
tool_system:
  framework: AI SDK tool calling with Zod validation
  execution: Secure tool execution with permission controls
  tracking: Tool usage logging and result storage
  safety: Sandboxed execution and user confirmation for destructive operations
  
tool_categories:
  file_system: Create, read, update, delete files and directories
  git_operations: Clone, commit, push, pull, branch management
  project_analysis: Parse AST, dependency analysis, code metrics
  communication: Send messages between agents, notifications
  system_info: Get system information, process management
  
security_model:
  permissions: Tool-specific permission levels
  confirmation: User approval for destructive operations
  sandboxing: Limited file system access
  logging: Complete audit trail of tool usage
```

### Existing Code Patterns
```typescript
// Pattern 1: AI SDK Tool Definition
// Using Zod schemas for tool parameter validation
import { tool } from 'ai';
import { z } from 'zod';

export const fileReadTool = tool({
  description: 'Read content from a file',
  parameters: z.object({
    filePath: z.string().describe('Path to the file to read'),
    encoding: z.enum(['utf8', 'base64']).default('utf8').describe('File encoding'),
  }),
  execute: async ({ filePath, encoding }) => {
    // Validate file path and permissions
    const safePath = await validateFilePath(filePath);
    const content = await fs.readFile(safePath, encoding);
    
    return {
      success: true,
      content,
      filePath: safePath,
      size: content.length,
    };
  },
});

// Pattern 2: Tool Registry System
// Central registry for all available tools
export class ToolRegistry {
  private static tools = new Map<string, any>();
  
  static register(name: string, tool: any): void {
    this.tools.set(name, tool);
  }
  
  static getTools(agentId: string, permissions: string[]): Record<string, any> {
    const allowedTools: Record<string, any> = {};
    
    for (const [name, tool] of this.tools.entries()) {
      if (this.hasPermission(name, permissions)) {
        allowedTools[name] = tool;
      }
    }
    
    return allowedTools;
  }
  
  private static hasPermission(toolName: string, permissions: string[]): boolean {
    const toolPermissions = this.getToolPermissions(toolName);
    return toolPermissions.some(p => permissions.includes(p));
  }
}

// Pattern 3: Enhanced Chat with Tools
// Integration with existing chat service
export class AgentChatService {
  static async sendMessage(agentId: string, userMessage: string, userId: string) {
    // ... existing code ...
    
    // Get agent's available tools
    const agentPermissions = await this.getAgentPermissions(agentId);
    const tools = ToolRegistry.getTools(agentId, agentPermissions);
    
    // Generate response with tools
    const result = await generateText({
      model,
      messages: [...messageHistory, { role: "user", content: userMessage }],
      tools, // Available tools for this agent
      maxSteps: 5, // Allow multiple tool calls
    });
    
    // Log tool usage
    if (result.toolCalls?.length) {
      await this.logToolUsage(agentId, result.toolCalls);
    }
    
    return result;
  }
}
```

### Project-Specific Conventions
```yaml
tool_naming:
  - snake_case for tool identifiers
  - descriptive names indicating action and target
  - namespaced by category (file_read, git_commit, etc.)

permission_levels:
  - read: Safe read-only operations
  - write: File modification operations  
  - system: System-level operations
  - destructive: Operations that can delete data
  - network: Network and external API access

tool_execution:
  - All tools return standardized result format
  - Tool calls are logged for audit and debugging
  - Destructive operations require user confirmation
  - File operations are sandboxed to project directory
  - Git operations use existing Git service
```

### Validation Commands
```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checks
npm run quality:check    # All quality checks
npm test tools           # Tool-specific tests
```

## Implementation Steps

### Phase 1: Tool Schema and Registry
```
CREATE src/main/agents/tools/tools.schema.ts:
  - DESIGN_SCHEMA:
    ```typescript
    export type ToolPermission = 
      | "read" 
      | "write" 
      | "system" 
      | "destructive" 
      | "network";
    
    export const toolExecutionsTable = sqliteTable("tool_executions", {
      id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
      agentId: text("agent_id")
        .notNull()
        .references(() => agentsTable.id, { onDelete: "cascade" }),
      toolName: text("tool_name").notNull(),
      parameters: text("parameters").notNull(), // JSON
      result: text("result"), // JSON result
      success: integer("success", { mode: "boolean" }).notNull(),
      error: text("error"),
      executionTime: integer("execution_time"), // milliseconds
      userApproved: integer("user_approved", { mode: "boolean" }), // For destructive operations
      createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    });
    
    export const agentPermissionsTable = sqliteTable("agent_permissions", {
      id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
      agentId: text("agent_id")
        .notNull()
        .references(() => agentsTable.id, { onDelete: "cascade" }),
      permission: text("permission").$type<ToolPermission>().notNull(),
      grantedBy: text("granted_by").notNull(), // User ID who granted permission
      createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`CURRENT_TIMESTAMP`),
    });
    
    // Indexes for performance
    export const toolExecutionAgentIndex = index("tool_executions_agent_id_idx")
      .on(toolExecutionsTable.agentId);
    export const agentPermissionIndex = index("agent_permissions_agent_id_idx")
      .on(agentPermissionsTable.agentId);
    
    export type SelectToolExecution = typeof toolExecutionsTable.$inferSelect;
    export type InsertToolExecution = typeof toolExecutionsTable.$inferInsert;
    export type SelectAgentPermission = typeof agentPermissionsTable.$inferSelect;
    export type InsertAgentPermission = typeof agentPermissionsTable.$inferInsert;
    ```

CREATE src/main/agents/tools/tool-registry.ts:
  - IMPLEMENT: Central tool registry and management
    ```typescript
    import { tool } from 'ai';
    import { fileTools } from './file-tools';
    import { gitTools } from './git-tools';
    import { analysisTools } from './analysis-tools';
    import { communicationTools } from './communication-tools';
    
    export interface ToolDefinition {
      name: string;
      tool: any;
      permissions: ToolPermission[];
      description: string;
      category: 'file' | 'git' | 'analysis' | 'communication' | 'system';
      destructive: boolean;
    }
    
    export class ToolRegistry {
      private static tools: Map<string, ToolDefinition> = new Map();
      private static initialized = false;
      
      static initialize(): void {
        if (this.initialized) return;
        
        // Register file tools
        for (const [name, toolDef] of Object.entries(fileTools)) {
          this.register(name, toolDef);
        }
        
        // Register git tools
        for (const [name, toolDef] of Object.entries(gitTools)) {
          this.register(name, toolDef);
        }
        
        // Register analysis tools
        for (const [name, toolDef] of Object.entries(analysisTools)) {
          this.register(name, toolDef);
        }
        
        // Register communication tools
        for (const [name, toolDef] of Object.entries(communicationTools)) {
          this.register(name, toolDef);
        }
        
        this.initialized = true;
      }
      
      static register(name: string, toolDef: ToolDefinition): void {
        this.tools.set(name, toolDef);
      }
      
      static async getToolsForAgent(agentId: string): Promise<Record<string, any>> {
        const permissions = await this.getAgentPermissions(agentId);
        const allowedTools: Record<string, any> = {};
        
        for (const [name, toolDef] of this.tools.entries()) {
          if (this.hasRequiredPermissions(toolDef.permissions, permissions)) {
            allowedTools[name] = this.createToolWithLogging(name, toolDef, agentId);
          }
        }
        
        return allowedTools;
      }
      
      private static async getAgentPermissions(agentId: string): Promise<ToolPermission[]> {
        const db = getDatabase();
        
        const permissions = await db
          .select({ permission: agentPermissionsTable.permission })
          .from(agentPermissionsTable)
          .where(eq(agentPermissionsTable.agentId, agentId));
        
        return permissions.map(p => p.permission);
      }
      
      private static hasRequiredPermissions(
        required: ToolPermission[], 
        available: ToolPermission[]
      ): boolean {
        return required.every(perm => available.includes(perm));
      }
      
      private static createToolWithLogging(
        name: string, 
        toolDef: ToolDefinition, 
        agentId: string
      ) {
        return tool({
          description: toolDef.tool.description,
          parameters: toolDef.tool.parameters,
          execute: async (parameters: any) => {
            const startTime = Date.now();
            
            try {
              // Check for destructive operations
              if (toolDef.destructive) {
                const approved = await this.requestUserApproval(name, parameters);
                if (!approved) {
                  throw new Error("User denied permission for destructive operation");
                }
              }
              
              // Execute the tool
              const result = await toolDef.tool.execute(parameters);
              const executionTime = Date.now() - startTime;
              
              // Log successful execution
              await this.logToolExecution({
                agentId,
                toolName: name,
                parameters: JSON.stringify(parameters),
                result: JSON.stringify(result),
                success: true,
                executionTime,
                userApproved: toolDef.destructive,
              });
              
              return result;
            } catch (error) {
              const executionTime = Date.now() - startTime;
              
              // Log failed execution
              await this.logToolExecution({
                agentId,
                toolName: name,
                parameters: JSON.stringify(parameters),
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                executionTime,
              });
              
              throw error;
            }
          },
        });
      }
      
      private static async logToolExecution(data: InsertToolExecution): Promise<void> {
        const db = getDatabase();
        await db.insert(toolExecutionsTable).values(data);
      }
      
      private static async requestUserApproval(
        toolName: string, 
        parameters: any
      ): Promise<boolean> {
        // In a real implementation, this would show a dialog to the user
        // For now, return true (auto-approve) but this should be implemented
        console.log(`Requesting approval for ${toolName} with parameters:`, parameters);
        return true;
      }
      
      static getAllTools(): ToolDefinition[] {
        return Array.from(this.tools.values());
      }
      
      static getToolByName(name: string): ToolDefinition | undefined {
        return this.tools.get(name);
      }
    }
    ```
```

### Phase 2: File System Tools
```
CREATE src/main/agents/tools/file-tools.ts:
  - IMPLEMENT: File system operation tools
    ```typescript
    import { tool } from 'ai';
    import { z } from 'zod';
    import { promises as fs } from 'fs';
    import path from 'path';
    import { ToolDefinition } from './tool-registry';
    
    // Security: Only allow operations within project directory
    const PROJECT_ROOT = process.cwd();
    
    function validateFilePath(filePath: string): string {
      const resolvedPath = path.resolve(PROJECT_ROOT, filePath);
      
      // Ensure path is within project directory
      if (!resolvedPath.startsWith(PROJECT_ROOT)) {
        throw new Error("Access denied: Path outside project directory");
      }
      
      return resolvedPath;
    }
    
    export const fileTools: Record<string, ToolDefinition> = {
      file_read: {
        name: 'file_read',
        permissions: ['read'],
        description: 'Read content from a file',
        category: 'file',
        destructive: false,
        tool: tool({
          description: 'Read the contents of a file',
          parameters: z.object({
            filePath: z.string().describe('Relative path to the file from project root'),
            encoding: z.enum(['utf8', 'base64']).default('utf8').describe('File encoding'),
          }),
          execute: async ({ filePath, encoding }) => {
            const safePath = validateFilePath(filePath);
            
            try {
              const stats = await fs.stat(safePath);
              if (!stats.isFile()) {
                throw new Error("Path is not a file");
              }
              
              const content = await fs.readFile(safePath, encoding as any);
              
              return {
                success: true,
                content,
                filePath,
                size: stats.size,
                lastModified: stats.mtime.toISOString(),
              };
            } catch (error) {
              throw new Error(`Failed to read file: ${error.message}`);
            }
          },
        }),
      },
      
      file_write: {
        name: 'file_write',
        permissions: ['write'],
        description: 'Write content to a file',
        category: 'file',
        destructive: false,
        tool: tool({
          description: 'Write content to a file, creating it if it doesn\'t exist',
          parameters: z.object({
            filePath: z.string().describe('Relative path to the file from project root'),
            content: z.string().describe('Content to write to the file'),
            encoding: z.enum(['utf8', 'base64']).default('utf8').describe('File encoding'),
            backup: z.boolean().default(true).describe('Create backup if file exists'),
          }),
          execute: async ({ filePath, content, encoding, backup }) => {
            const safePath = validateFilePath(filePath);
            
            try {
              // Create backup if file exists and backup is requested
              if (backup) {
                try {
                  await fs.access(safePath);
                  const backupPath = `${safePath}.backup.${Date.now()}`;
                  await fs.copyFile(safePath, backupPath);
                } catch {
                  // File doesn't exist, no backup needed
                }
              }
              
              // Ensure directory exists
              const dir = path.dirname(safePath);
              await fs.mkdir(dir, { recursive: true });
              
              // Write file
              await fs.writeFile(safePath, content, encoding as any);
              
              const stats = await fs.stat(safePath);
              
              return {
                success: true,
                filePath,
                size: stats.size,
                backup: backup,
                lastModified: stats.mtime.toISOString(),
              };
            } catch (error) {
              throw new Error(`Failed to write file: ${error.message}`);
            }
          },
        }),
      },
      
      file_delete: {
        name: 'file_delete',
        permissions: ['destructive'],
        description: 'Delete a file',
        category: 'file',
        destructive: true,
        tool: tool({
          description: 'Delete a file (requires user confirmation)',
          parameters: z.object({
            filePath: z.string().describe('Relative path to the file from project root'),
            backup: z.boolean().default(true).describe('Create backup before deletion'),
          }),
          execute: async ({ filePath, backup }) => {
            const safePath = validateFilePath(filePath);
            
            try {
              const stats = await fs.stat(safePath);
              if (!stats.isFile()) {
                throw new Error("Path is not a file");
              }
              
              // Create backup if requested
              if (backup) {
                const backupPath = `${safePath}.deleted.${Date.now()}`;
                await fs.copyFile(safePath, backupPath);
              }
              
              await fs.unlink(safePath);
              
              return {
                success: true,
                filePath,
                backup: backup,
                deletedAt: new Date().toISOString(),
              };
            } catch (error) {
              throw new Error(`Failed to delete file: ${error.message}`);
            }
          },
        }),
      },
      
      directory_list: {
        name: 'directory_list',
        permissions: ['read'],
        description: 'List contents of a directory',
        category: 'file',
        destructive: false,
        tool: tool({
          description: 'List files and directories in a given path',
          parameters: z.object({
            directoryPath: z.string().describe('Relative path to the directory from project root'),
            recursive: z.boolean().default(false).describe('List contents recursively'),
            includeHidden: z.boolean().default(false).describe('Include hidden files'),
          }),
          execute: async ({ directoryPath, recursive, includeHidden }) => {
            const safePath = validateFilePath(directoryPath);
            
            try {
              const stats = await fs.stat(safePath);
              if (!stats.isDirectory()) {
                throw new Error("Path is not a directory");
              }
              
              const listDirectory = async (dirPath: string): Promise<any[]> => {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                const items = [];
                
                for (const entry of entries) {
                  if (!includeHidden && entry.name.startsWith('.')) {
                    continue;
                  }
                  
                  const fullPath = path.join(dirPath, entry.name);
                  const relativePath = path.relative(PROJECT_ROOT, fullPath);
                  const stats = await fs.stat(fullPath);
                  
                  const item = {
                    name: entry.name,
                    path: relativePath,
                    type: entry.isDirectory() ? 'directory' : 'file',
                    size: entry.isFile() ? stats.size : null,
                    lastModified: stats.mtime.toISOString(),
                  };
                  
                  if (recursive && entry.isDirectory()) {
                    item.children = await listDirectory(fullPath);
                  }
                  
                  items.push(item);
                }
                
                return items;
              };
              
              const contents = await listDirectory(safePath);
              
              return {
                success: true,
                directoryPath,
                contents,
                total: contents.length,
              };
            } catch (error) {
              throw new Error(`Failed to list directory: ${error.message}`);
            }
          },
        }),
      },
    };
    ```
```

### Phase 3: Git and Analysis Tools
```
CREATE src/main/agents/tools/git-tools.ts:
  - IMPLEMENT: Git operation tools
    ```typescript
    import { tool } from 'ai';
    import { z } from 'zod';
    import { GitService } from '@/main/git/git.service';
    
    export const gitTools: Record<string, ToolDefinition> = {
      git_status: {
        name: 'git_status',
        permissions: ['read'],
        description: 'Get Git repository status',
        category: 'git',
        destructive: false,
        tool: tool({
          description: 'Get the current status of the Git repository',
          parameters: z.object({
            detailed: z.boolean().default(false).describe('Include detailed file information'),
          }),
          execute: async ({ detailed }) => {
            try {
              const status = await GitService.getStatus();
              
              if (detailed) {
                return {
                  success: true,
                  status,
                  branch: status.current,
                  modified: status.files.filter(f => f.working_dir === 'M'),
                  added: status.files.filter(f => f.index === 'A'),
                  deleted: status.files.filter(f => f.working_dir === 'D'),
                  untracked: status.files.filter(f => f.index === '?' && f.working_dir === '?'),
                };
              }
              
              return {
                success: true,
                branch: status.current,
                ahead: status.ahead,
                behind: status.behind,
                modified: status.modified.length,
                staged: status.staged.length,
                untracked: status.not_added.length,
              };
            } catch (error) {
              throw new Error(`Failed to get Git status: ${error.message}`);
            }
          },
        }),
      },
      
      git_commit: {
        name: 'git_commit',
        permissions: ['write'],
        description: 'Create a Git commit',
        category: 'git',
        destructive: false,
        tool: tool({
          description: 'Create a Git commit with staged changes',
          parameters: z.object({
            message: z.string().describe('Commit message'),
            addAll: z.boolean().default(false).describe('Stage all changes before committing'),
          }),
          execute: async ({ message, addAll }) => {
            try {
              if (addAll) {
                await GitService.addAll();
              }
              
              const commit = await GitService.commit(message);
              
              return {
                success: true,
                hash: commit.commit,
                message: commit.summary.message,
                files: commit.summary.changes,
                author: commit.author,
              };
            } catch (error) {
              throw new Error(`Failed to create commit: ${error.message}`);
            }
          },
        }),
      },
      
      git_log: {
        name: 'git_log',
        permissions: ['read'],
        description: 'Get Git commit history',
        category: 'git',
        destructive: false,
        tool: tool({
          description: 'Get recent commit history',
          parameters: z.object({
            limit: z.number().default(10).describe('Number of commits to retrieve'),
            branch: z.string().optional().describe('Specific branch to get history from'),
          }),
          execute: async ({ limit, branch }) => {
            try {
              const log = await GitService.getLog(limit, branch);
              
              return {
                success: true,
                commits: log.all.map(commit => ({
                  hash: commit.hash,
                  message: commit.message,
                  author: commit.author_name,
                  date: commit.date,
                  refs: commit.refs,
                })),
                total: log.total,
              };
            } catch (error) {
              throw new Error(`Failed to get Git log: ${error.message}`);
            }
          },
        }),
      },
    };
    ```

CREATE src/main/agents/tools/analysis-tools.ts:
  - IMPLEMENT: Code analysis tools
    ```typescript
    import { tool } from 'ai';
    import { z } from 'zod';
    import { promises as fs } from 'fs';
    import path from 'path';
    
    export const analysisTools: Record<string, ToolDefinition> = {
      analyze_project_structure: {
        name: 'analyze_project_structure',
        permissions: ['read'],
        description: 'Analyze project directory structure',
        category: 'analysis',
        destructive: false,
        tool: tool({
          description: 'Analyze the project directory structure and identify patterns',
          parameters: z.object({
            maxDepth: z.number().default(3).describe('Maximum directory depth to analyze'),
            excludePatterns: z.array(z.string()).default(['node_modules', '.git', 'dist', 'build']).describe('Patterns to exclude'),
          }),
          execute: async ({ maxDepth, excludePatterns }) => {
            try {
              const analyzeDirectory = async (dirPath: string, currentDepth: number = 0): Promise<any> => {
                if (currentDepth >= maxDepth) return null;
                
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                const structure = {
                  directories: 0,
                  files: 0,
                  fileTypes: {} as Record<string, number>,
                  children: {} as Record<string, any>,
                };
                
                for (const entry of entries) {
                  if (excludePatterns.some(pattern => entry.name.includes(pattern))) {
                    continue;
                  }
                  
                  if (entry.isDirectory()) {
                    structure.directories++;
                    const childStructure = await analyzeDirectory(
                      path.join(dirPath, entry.name), 
                      currentDepth + 1
                    );
                    if (childStructure) {
                      structure.children[entry.name] = childStructure;
                    }
                  } else {
                    structure.files++;
                    const ext = path.extname(entry.name) || 'no-extension';
                    structure.fileTypes[ext] = (structure.fileTypes[ext] || 0) + 1;
                  }
                }
                
                return structure;
              };
              
              const projectRoot = process.cwd();
              const structure = await analyzeDirectory(projectRoot);
              
              return {
                success: true,
                projectRoot,
                structure,
                summary: {
                  totalDirectories: structure.directories,
                  totalFiles: structure.files,
                  fileTypes: structure.fileTypes,
                },
              };
            } catch (error) {
              throw new Error(`Failed to analyze project structure: ${error.message}`);
            }
          },
        }),
      },
      
      find_files: {
        name: 'find_files',
        permissions: ['read'],
        description: 'Find files matching patterns',
        category: 'analysis',
        destructive: false,
        tool: tool({
          description: 'Find files in the project matching specific patterns',
          parameters: z.object({
            pattern: z.string().describe('File name pattern or extension (e.g., "*.ts", "component", ".json")'),
            directory: z.string().default('.').describe('Directory to search in'),
            caseSensitive: z.boolean().default(false).describe('Case sensitive search'),
            includeContent: z.boolean().default(false).describe('Include file content in results'),
          }),
          execute: async ({ pattern, directory, caseSensitive, includeContent }) => {
            try {
              const searchDirectory = async (dirPath: string): Promise<any[]> => {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                let results: any[] = [];
                
                for (const entry of entries) {
                  const fullPath = path.join(dirPath, entry.name);
                  const relativePath = path.relative(process.cwd(), fullPath);
                  
                  if (entry.isDirectory() && !entry.name.startsWith('.')) {
                    results = results.concat(await searchDirectory(fullPath));
                  } else if (entry.isFile()) {
                    const fileName = caseSensitive ? entry.name : entry.name.toLowerCase();
                    const searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
                    
                    let matches = false;
                    if (pattern.startsWith('*.')) {
                      // Extension match
                      const ext = pattern.substring(1);
                      matches = fileName.endsWith(ext);
                    } else {
                      // Name contains pattern
                      matches = fileName.includes(searchPattern);
                    }
                    
                    if (matches) {
                      const stats = await fs.stat(fullPath);
                      const fileInfo = {
                        name: entry.name,
                        path: relativePath,
                        size: stats.size,
                        lastModified: stats.mtime.toISOString(),
                      };
                      
                      if (includeContent && stats.size < 100000) { // Max 100KB
                        try {
                          fileInfo.content = await fs.readFile(fullPath, 'utf8');
                        } catch {
                          fileInfo.content = '[Binary or large file]';
                        }
                      }
                      
                      results.push(fileInfo);
                    }
                  }
                }
                
                return results;
              };
              
              const searchPath = path.resolve(process.cwd(), directory);
              const results = await searchDirectory(searchPath);
              
              return {
                success: true,
                pattern,
                directory,
                matches: results,
                total: results.length,
              };
            } catch (error) {
              throw new Error(`Failed to find files: ${error.message}`);
            }
          },
        }),
      },
    };
    ```
```

### Phase 4: Enhanced Chat Integration
```
UPDATE src/main/agents/agent-chat.service.ts:
  - ENHANCE: Chat service with tool integration
    ```typescript
    import { ToolRegistry } from './tools/tool-registry';
    
    export class AgentChatService {
      
      static async sendMessage(
        agentId: string,
        userMessage: string,
        userId: string
      ): Promise<{ userMessage: any; agentResponse: any }> {
        // ... existing code for conversation setup ...
        
        // Initialize tool registry if not done
        ToolRegistry.initialize();
        
        // Get agent's available tools
        const tools = await ToolRegistry.getToolsForAgent(agentId);
        
        // Enhanced system prompt with tool capabilities
        const toolDescriptions = Object.keys(tools).join(', ');
        const enhancedSystemPrompt = `${agent.systemPrompt}
        
        You have access to the following tools: ${toolDescriptions}
        
        Use tools when appropriate to help the user. Always explain what you're doing when using tools.
        For file operations, always use relative paths from the project root.
        Be careful with destructive operations and explain the consequences.`;
        
        // Generate response with tools
        const result = await generateText({
          model,
          messages: [
            { role: "system", content: enhancedSystemPrompt },
            ...messageHistory,
            { role: "user", content: userMessage },
          ],
          tools,
          maxSteps: 5, // Allow multiple tool calls in sequence
          temperature: JSON.parse(agent.modelConfig).temperature || 0.7,
          maxTokens: JSON.parse(agent.modelConfig).maxTokens || 2000,
        });
        
        // Store agent response with tool results
        const responseData = {
          text: result.text,
          toolCalls: result.toolCalls || [],
          toolResults: result.toolResults || [],
        };
        
        const agentMsg = await MessageService.create({
          conversationId: conversation.id,
          role: "assistant",
          content: result.text,
          toolCalls: JSON.stringify(result.toolCalls || []),
          metadata: JSON.stringify({
            agentId,
            model: provider.model,
            toolsUsed: result.toolCalls?.length || 0,
            usage: result.usage,
          }),
        });
        
        // Store conversation memory including tool usage
        if (result.toolCalls?.length) {
          await MemoryService.create({
            agentId,
            type: "context",
            content: `Used tools: ${result.toolCalls.map(tc => tc.toolName).join(', ')} to help with: ${userMessage}`,
            context: {
              conversationId: conversation.id,
              toolCalls: result.toolCalls,
            },
            importance: 7, // Tool usage is important to remember
          });
        }
        
        return { userMessage: userMsg, agentResponse: agentMsg };
      }
    }
    ```

CREATE src/main/agents/tools/tool.handlers.ts:
  - IMPLEMENT: Tool management IPC handlers
    ```typescript
    export function setupToolHandlers(): void {
      
      ipcMain.handle(
        "tools:get-available",
        async (_, agentId: string): Promise<IpcResponse> => {
          try {
            const tools = ToolRegistry.getAllTools();
            const permissions = await this.getAgentPermissions(agentId);
            
            const availableTools = tools.filter(tool => 
              tool.permissions.every(perm => permissions.includes(perm))
            );
            
            return { success: true, data: availableTools };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to get tools",
            };
          }
        }
      );
      
      ipcMain.handle(
        "tools:get-executions",
        async (_, agentId: string): Promise<IpcResponse> => {
          try {
            const db = getDatabase();
            
            const executions = await db
              .select()
              .from(toolExecutionsTable)
              .where(eq(toolExecutionsTable.agentId, agentId))
              .orderBy(desc(toolExecutionsTable.createdAt))
              .limit(100);
            
            return { success: true, data: executions };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to get tool executions",
            };
          }
        }
      );
      
      ipcMain.handle(
        "tools:grant-permission",
        async (_, agentId: string, permission: ToolPermission): Promise<IpcResponse> => {
          try {
            const db = getDatabase();
            const userId = getCurrentUserId();
            
            // Check if permission already exists
            const existing = await db
              .select()
              .from(agentPermissionsTable)
              .where(
                and(
                  eq(agentPermissionsTable.agentId, agentId),
                  eq(agentPermissionsTable.permission, permission)
                )
              )
              .limit(1);
            
            if (existing.length === 0) {
              await db.insert(agentPermissionsTable).values({
                agentId,
                permission,
                grantedBy: userId,
              });
            }
            
            return { success: true, data: null };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to grant permission",
            };
          }
        }
      );
      
      ipcMain.handle(
        "tools:revoke-permission",
        async (_, agentId: string, permission: ToolPermission): Promise<IpcResponse> => {
          try {
            const db = getDatabase();
            
            await db
              .delete(agentPermissionsTable)
              .where(
                and(
                  eq(agentPermissionsTable.agentId, agentId),
                  eq(agentPermissionsTable.permission, permission)
                )
              );
            
            return { success: true, data: null };
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : "Failed to revoke permission",
            };
          }
        }
      );
    }
    ```
```

### Phase 5: Tool Monitoring Interface
```
CREATE src/renderer/app/agents/[agentId]/tools.tsx:
  - IMPLEMENT: Tool usage monitoring page
    ```tsx
    export default function AgentToolsPage() {
      const { agentId } = useParams();
      const { agents } = useAgentStore();
      const [availableTools, setAvailableTools] = useState<ToolDefinition[]>([]);
      const [toolExecutions, setToolExecutions] = useState<SelectToolExecution[]>([]);
      const [isLoading, setIsLoading] = useState(true);
      
      const agent = agents.find(a => a.id === agentId);
      
      useEffect(() => {
        if (agentId) {
          loadToolData();
        }
      }, [agentId]);
      
      const loadToolData = async () => {
        setIsLoading(true);
        try {
          const [toolsResult, executionsResult] = await Promise.all([
            window.api.tools.getAvailable(agentId),
            window.api.tools.getExecutions(agentId),
          ]);
          
          if (toolsResult.success) setAvailableTools(toolsResult.data);
          if (executionsResult.success) setToolExecutions(executionsResult.data);
        } catch (error) {
          console.error("Failed to load tool data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      if (!agent) {
        return <div>Agent not found</div>;
      }
      
      return (
        <div className="container max-w-6xl py-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{agent.name}'s Tools</h1>
                <p className="text-muted-foreground">
                  Manage tools and monitor usage
                </p>
              </div>
              
              <Button variant="outline" asChild>
                <Link to={`/agents/${agentId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Agent
                </Link>
              </Button>
            </div>
            
            {/* Available Tools */}
            <Card>
              <CardHeader>
                <CardTitle>Available Tools</CardTitle>
                <CardDescription>
                  Tools that this agent can use based on permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {availableTools.map((tool) => (
                    <div key={tool.name} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{tool.name}</h3>
                        <Badge variant={tool.destructive ? "destructive" : "default"}>
                          {tool.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {tool.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {tool.permissions.map((perm) => (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Tool Executions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Tool Usage</CardTitle>
                <CardDescription>
                  History of tool executions by this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {toolExecutions.map((execution) => (
                    <div key={execution.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{execution.toolName}</span>
                          <Badge variant={execution.success ? "default" : "destructive"}>
                            {execution.success ? "Success" : "Failed"}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {execution.error && (
                        <Alert variant="destructive" className="mb-3">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{execution.error}</AlertDescription>
                        </Alert>
                      )}
                      
                      <Collapsible>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="mr-2 h-3 w-3" />
                            View Details
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-sm font-medium">Parameters:</span>
                              <pre className="mt-1 p-2 bg-muted rounded text-xs">
                                {JSON.stringify(JSON.parse(execution.parameters), null, 2)}
                              </pre>
                            </div>
                            
                            {execution.result && (
                              <div>
                                <span className="text-sm font-medium">Result:</span>
                                <pre className="mt-1 p-2 bg-muted rounded text-xs">
                                  {JSON.stringify(JSON.parse(execution.result), null, 2)}
                                </pre>
                              </div>
                            )}
                            
                            <div className="text-xs text-muted-foreground">
                              Execution time: {execution.executionTime}ms
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    ```
```

## Validation Checkpoints

### Checkpoint 1: Tool System
```
VALIDATE_TOOLS:
  - TEST: File operation tools work correctly
  - VERIFY: Git tools integrate with existing Git service
  - CHECK: Tool permissions are enforced
  - CONFIRM: Tool execution logging works
```

### Checkpoint 2: Chat Integration
```
VALIDATE_CHAT_INTEGRATION:
  - TEST: Agents can use tools in conversations
  - VERIFY: Tool results are properly displayed
  - CHECK: Tool usage is logged and tracked
  - CONFIRM: Multiple tool calls work in sequence
```

### Checkpoint 3: Security and Permissions
```
VALIDATE_SECURITY:
  - TEST: File path validation prevents directory traversal
  - VERIFY: Destructive operations require confirmation
  - CHECK: Permission system blocks unauthorized tools
  - CONFIRM: Tool execution is sandboxed appropriately
```

## Use Cases & Examples

### Tool Usage Scenarios
1. **File Management**: Agent reads, edits, and organizes project files
2. **Git Operations**: Agent commits changes and manages repository
3. **Code Analysis**: Agent analyzes project structure and finds files
4. **Project Setup**: Agent creates new files and directories

### Example Tool Interaction
```typescript
// User: "Can you read the package.json file and tell me about the dependencies?"
// Agent uses file_read tool:
const result = await fileReadTool.execute({
  filePath: "package.json",
  encoding: "utf8"
});
// Agent then analyzes the content and responds with dependency information
```

## Dependencies & Prerequisites

### Required Files/Components
- [x] Agent chat system (TASK-005)
- [x] Task queue system (TASK-009)
- [x] AI SDK with tool calling support
- [x] Existing Git service integration
- [x] File system access patterns

### Required Patterns/Conventions
- [x] Tool definition and registry patterns
- [x] Security and permission models
- [x] IPC handler patterns for tool management
- [x] Database schema for tool tracking
- [x] UI components for tool monitoring

---

## Task Completion Checklist

- [ ] Tool registry system with categorized tools
- [ ] File system tools with security validation
- [ ] Git integration tools using existing services
- [ ] Project analysis tools for codebase understanding
- [ ] Permission system with granular controls
- [ ] Tool execution logging and audit trail
- [ ] Chat integration with tool calling
- [ ] Tool monitoring interface for users
- [ ] Security controls and user confirmations
- [ ] No TypeScript or linting errors

**Final Validation**: Run `npm run quality:check` and ensure all automated checks pass.

**Delivers**: After completing this task, agents can perform sophisticated actions beyond chat, including file management, Git operations, and project analysis, with proper security controls and monitoring.