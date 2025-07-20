# Task 10A: Tool Foundation & Registry - Enhanced

## Overview

Establish the foundational tool system with database schema, tool registry, permission management, and basic file operation tools. This micro-task creates the essential infrastructure for agent tool capabilities while keeping complexity manageable.

## User Value

After completing this task, users can:
- Define and register tools for agent use
- Control agent permissions for different tool categories
- Watch agents perform basic file operations safely
- Monitor tool execution history and results

## Technical Requirements

### Prerequisites
- Task 05: Agent Chat Interface must be completed
- Existing database schema and IPC patterns
- AI SDK with tool calling support available

### Database Schema Extensions

```sql
-- Tool execution tracking for audit and monitoring
CREATE TABLE tool_executions (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    parameters TEXT NOT NULL, -- JSON
    result TEXT, -- JSON result
    success BOOLEAN NOT NULL,
    error TEXT,
    execution_time INTEGER, -- milliseconds
    user_approved BOOLEAN, -- For destructive operations
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Agent permissions for granular tool access control
CREATE TABLE agent_permissions (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    permission TEXT NOT NULL, -- read, write, system, destructive, network
    granted_by TEXT NOT NULL, -- User ID who granted permission
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    UNIQUE(agent_id, permission)
);

-- Performance indexes
CREATE INDEX tool_executions_agent_id_idx ON tool_executions(agent_id);
CREATE INDEX tool_executions_created_at_idx ON tool_executions(created_at);
CREATE INDEX agent_permissions_agent_id_idx ON agent_permissions(agent_id);
```

### Core Types

```typescript
export type ToolPermission = 
  | "read"        // Safe read-only operations
  | "write"       // File modification operations
  | "system"      // System-level operations
  | "destructive" // Operations that can delete data
  | "network";    // Network and external API access

export interface ToolDefinition {
  name: string;
  tool: any;
  permissions: ToolPermission[];
  description: string;
  category: 'file' | 'git' | 'analysis' | 'communication' | 'system';
  destructive: boolean;
}
```

## Implementation Steps

### 1. Database Schema Implementation

```typescript
// src/main/agents/tools/tools.schema.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';
import { agentsTable } from '../agents.schema';

export type ToolPermission = 
  | "read" 
  | "write" 
  | "system" 
  | "destructive" 
  | "network";

export const toolExecutionsTable = sqliteTable("tool_executions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id").notNull().references(() => agentsTable.id, { onDelete: "cascade" }),
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
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id").notNull().references(() => agentsTable.id, { onDelete: "cascade" }),
  permission: text("permission").$type<ToolPermission>().notNull(),
  grantedBy: text("granted_by").notNull(), // User ID who granted permission
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Indexes for performance
export const toolExecutionAgentIndex = index("tool_executions_agent_id_idx")
  .on(toolExecutionsTable.agentId);
export const toolExecutionTimeIndex = index("tool_executions_created_at_idx")
  .on(toolExecutionsTable.createdAt);
export const agentPermissionIndex = index("agent_permissions_agent_id_idx")
  .on(agentPermissionsTable.agentId);

// Type inference
export type SelectToolExecution = typeof toolExecutionsTable.$inferSelect;
export type InsertToolExecution = typeof toolExecutionsTable.$inferInsert;
export type SelectAgentPermission = typeof agentPermissionsTable.$inferSelect;
export type InsertAgentPermission = typeof agentPermissionsTable.$inferInsert;
```

### 2. Tool Registry System

```typescript
// src/main/agents/tools/tool-registry.ts
import { eq } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { toolExecutionsTable, agentPermissionsTable } from './tools.schema';
import { fileTools } from './file-tools';
import type { ToolPermission, InsertToolExecution } from './tools.schema';

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
    return {
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
    };
  }

  private static async logToolExecution(data: InsertToolExecution): Promise<void> {
    const db = getDatabase();
    await db.insert(toolExecutionsTable).values(data);
  }

  private static async requestUserApproval(
    toolName: string, 
    parameters: any
  ): Promise<boolean> {
    // TODO: Implement actual user approval dialog
    // For now, auto-approve but log the request
    console.log(`Auto-approving ${toolName} with parameters:`, parameters);
    return true;
  }

  static getAllTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  static getToolByName(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  // Permission management methods
  static async grantPermission(
    agentId: string, 
    permission: ToolPermission, 
    grantedBy: string
  ): Promise<void> {
    const db = getDatabase();

    // Check if permission already exists
    const existing = await db
      .select()
      .from(agentPermissionsTable)
      .where(
        eq(agentPermissionsTable.agentId, agentId) &&
        eq(agentPermissionsTable.permission, permission)
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(agentPermissionsTable).values({
        agentId,
        permission,
        grantedBy,
      });
    }
  }

  static async revokePermission(agentId: string, permission: ToolPermission): Promise<void> {
    const db = getDatabase();

    await db
      .delete(agentPermissionsTable)
      .where(
        eq(agentPermissionsTable.agentId, agentId) &&
        eq(agentPermissionsTable.permission, permission)
      );
  }
}
```

### 3. File Operation Tools

```typescript
// src/main/agents/tools/file-tools.ts
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';
import type { ToolDefinition } from './tool-registry';

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
    tool: {
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
    },
  },

  file_write: {
    name: 'file_write',
    permissions: ['write'],
    description: 'Write content to a file',
    category: 'file',
    destructive: false,
    tool: {
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
    },
  },

  directory_list: {
    name: 'directory_list',
    permissions: ['read'],
    description: 'List contents of a directory',
    category: 'file',
    destructive: false,
    tool: {
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
    },
  },

  file_delete: {
    name: 'file_delete',
    permissions: ['destructive'],
    description: 'Delete a file (requires confirmation)',
    category: 'file',
    destructive: true,
    tool: {
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
    },
  },
};
```

### 4. Permission Management Service

```typescript
// src/main/agents/tools/permission.service.ts
import { eq, and } from 'drizzle-orm';
import { getDatabase } from '../../database/connection';
import { agentPermissionsTable } from './tools.schema';
import type { ToolPermission, InsertAgentPermission } from './tools.schema';

export class PermissionService {
  // Grant basic permissions to newly created agents
  static async grantDefaultPermissions(agentId: string, grantedBy: string): Promise<void> {
    const defaultPermissions: ToolPermission[] = ['read'];
    
    for (const permission of defaultPermissions) {
      await this.grantPermission(agentId, permission, grantedBy);
    }
  }

  static async grantPermission(
    agentId: string, 
    permission: ToolPermission, 
    grantedBy: string
  ): Promise<void> {
    const db = getDatabase();

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
        grantedBy,
      });
    }
  }

  static async revokePermission(agentId: string, permission: ToolPermission): Promise<void> {
    const db = getDatabase();

    await db
      .delete(agentPermissionsTable)
      .where(
        and(
          eq(agentPermissionsTable.agentId, agentId),
          eq(agentPermissionsTable.permission, permission)
        )
      );
  }

  static async getAgentPermissions(agentId: string): Promise<ToolPermission[]> {
    const db = getDatabase();

    const permissions = await db
      .select({ permission: agentPermissionsTable.permission })
      .from(agentPermissionsTable)
      .where(eq(agentPermissionsTable.agentId, agentId));

    return permissions.map(p => p.permission);
  }

  static async getAllPermissions(): Promise<ToolPermission[]> {
    return ['read', 'write', 'system', 'destructive', 'network'];
  }
}
```

### 5. Basic IPC Handlers

```typescript
// src/main/agents/tools/tool.handlers.ts
import { ipcMain } from 'electron';
import { ToolRegistry } from './tool-registry';
import { PermissionService } from './permission.service';
import type { IpcResponse } from '../../types';
import type { ToolPermission } from './tools.schema';

export function setupToolHandlers(): void {
  // Initialize tool registry
  ipcMain.handle(
    "tools:initialize",
    async (): Promise<IpcResponse> => {
      try {
        ToolRegistry.initialize();
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to initialize tools",
        };
      }
    }
  );

  // Get available tools for agent
  ipcMain.handle(
    "tools:get-available",
    async (_, agentId: string): Promise<IpcResponse> => {
      try {
        const tools = ToolRegistry.getAllTools();
        const permissions = await PermissionService.getAgentPermissions(agentId);
        
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

  // Grant permission to agent
  ipcMain.handle(
    "tools:grant-permission",
    async (_, agentId: string, permission: ToolPermission): Promise<IpcResponse> => {
      try {
        // TODO: Get current user ID from auth system
        const userId = 'current-user-id';
        await PermissionService.grantPermission(agentId, permission, userId);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to grant permission",
        };
      }
    }
  );

  // Revoke permission from agent
  ipcMain.handle(
    "tools:revoke-permission",
    async (_, agentId: string, permission: ToolPermission): Promise<IpcResponse> => {
      try {
        await PermissionService.revokePermission(agentId, permission);
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to revoke permission",
        };
      }
    }
  );

  // Get agent permissions
  ipcMain.handle(
    "tools:get-permissions",
    async (_, agentId: string): Promise<IpcResponse> => {
      try {
        const permissions = await PermissionService.getAgentPermissions(agentId);
        return { success: true, data: permissions };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to get permissions",
        };
      }
    }
  );
}
```

## Validation Checkpoints

### Checkpoint 1: Database Foundation
- Verify tool tracking tables created properly
- Test permission storage and retrieval
- Validate foreign key relationships

### Checkpoint 2: Tool Registry
- Test tool registration system
- Verify permission checking logic
- Test tool execution logging

### Checkpoint 3: File Operations
- Test file reading with path validation
- Verify file writing with backup creation
- Test directory listing functionality
- Validate security path restrictions

## Success Criteria

✅ **Tool Infrastructure**: Registry system manages tool definitions and permissions
✅ **Security Model**: Path validation and permission checks prevent unauthorized access
✅ **File Operations**: Basic file tools (read, write, list, delete) work safely
✅ **Audit Trail**: All tool executions are logged with parameters and results
✅ **Permission Management**: Granular permission system controls tool access

## Next Steps

After completing this foundation:
1. **Move to Task 10B**: Implement Git and analysis tools
2. **Enhanced Security**: Add user approval dialogs for destructive operations
3. **Performance**: Optimize tool execution and logging

This task establishes the core tool system infrastructure that enables agents to perform actions beyond simple chat responses.