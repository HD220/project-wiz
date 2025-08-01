# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-01-ai-agent-toolset/spec.md

## Architecture Overview

### Vercel AI SDK Tool Integration

**Tool Definition Pattern:**
```typescript
import { tool } from 'ai';
import { z } from 'zod';

const fileReadTool = tool({
  description: 'Read contents of a file from the workspace',
  parameters: z.object({
    filePath: z.string().describe('Path to file relative to workspace root'),
    encoding: z.enum(['utf8', 'base64']).default('utf8').optional()
  }),
  execute: async ({ filePath, encoding }) => {
    // Implementation with proper error handling
    return { content: string, size: number, lastModified: Date };
  }
});
```

**Tool Integration in generateText:**
```typescript
const response = await generateText({
  model: model,
  messages: messages,
  tools: {
    readFile: fileReadTool,
    writeFile: fileWriteTool,
    runGitCommand: gitTool,
    analyzeCode: codeAnalysisTool,
    // ... other tools
  },
  maxToolRoundtrips: 10
});
```

### Current Worker Integration Analysis

**Existing Response Generator:**
- Located in `src/worker/response-generator.ts`
- Uses Vercel AI SDK `generateText` function
- Currently no tool integration
- Processes messages and returns text responses

**Integration Strategy:**
- Extend existing ResponseGenerator with tool support
- Maintain backward compatibility with current job structure
- Add tool context from workspace and job data
- Preserve existing error handling patterns

## Technical Requirements

### 1. Tool Architecture Foundation

**Core Tool Framework:**
```typescript
// Base tool interface
interface AgentTool {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  execute: (params: any, context: ToolExecutionContext) => Promise<ToolResult>;
}

// Tool execution context
interface ToolExecutionContext {
  taskId: string;
  workspaceDir?: string;
  repositoryUrl?: string;
  branch?: string;
  userId: string;
  projectId?: string;
  conversationId?: string;
}

// Standardized tool result
interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}
```

**Tool Registry System:**
```typescript
class AgentToolRegistry {
  private tools = new Map<string, AgentTool>();
  
  register(tool: AgentTool): void
  get(name: string): AgentTool | undefined
  getAll(): Record<string, AgentTool>
  getByCategory(category: string): AgentTool[]
}
```

### 2. File System Tools

**File Operations Tool Set:**
```typescript
// Read file contents
const readFileTool = tool({
  description: 'Read contents of a file from the current workspace',
  parameters: z.object({
    filePath: z.string().describe('Path to file relative to workspace root'),
    encoding: z.enum(['utf8', 'base64']).default('utf8').optional()
  }),
  execute: async ({ filePath, encoding }, context) => {
    // Validate path is within workspace
    // Read file with proper error handling
    // Return structured response
  }
});

// Write file contents
const writeFileTool = tool({
  description: 'Write content to a file in the current workspace',
  parameters: z.object({
    filePath: z.string().describe('Path to file relative to workspace root'),
    content: z.string().describe('Content to write to the file'),
    createDirectories: z.boolean().default(true).optional()
  }),
  execute: async ({ filePath, content, createDirectories }, context) => {
    // Validate path and permissions
    // Create directories if needed
    // Write file with atomic operation
  }
});

// List directory contents
const listDirectoryTool = tool({
  description: 'List contents of a directory in the workspace',
  parameters: z.object({
    dirPath: z.string().default('.').describe('Directory path relative to workspace root'),
    recursive: z.boolean().default(false).optional(),
    includeHidden: z.boolean().default(false).optional()
  }),
  execute: async ({ dirPath, recursive, includeHidden }, context) => {
    // List directory with filtering
    // Return structured file/directory information
  }
});
```

### 3. Git Operation Tools

**Git Command Tools:**
```typescript
// Execute git command
const gitCommandTool = tool({
  description: 'Execute git command in the current workspace',
  parameters: z.object({
    command: z.string().describe('Git command to execute (without "git" prefix)'),
    args: z.array(z.string()).optional().describe('Additional arguments for the command')
  }),
  execute: async ({ command, args }, context) => {
    // Validate git command safety
    // Execute in workspace directory
    // Return command output and status
  }
});

// Git status tool
const gitStatusTool = tool({
  description: 'Get git repository status including staged and unstaged changes',
  parameters: z.object({
    porcelain: z.boolean().default(true).optional()
  }),
  execute: async ({ porcelain }, context) => {
    // Get detailed git status
    // Parse and structure output
  }
});

// Create commit
const gitCommitTool = tool({
  description: 'Create a git commit with the provided message',
  parameters: z.object({
    message: z.string().describe('Commit message'),
    addAll: z.boolean().default(false).optional().describe('Add all changes before committing')
  }),
  execute: async ({ message, addAll }, context) => {
    // Optionally stage all changes
    // Create commit with validation
    // Return commit hash and details
  }
});
```

### 4. Code Analysis Tools

**Code Understanding Tools:**
```typescript
// Analyze code structure
const analyzeCodeStructureTool = tool({
  description: 'Analyze code structure including functions, classes, imports',
  parameters: z.object({
    filePath: z.string().describe('Path to code file to analyze'),
    language: z.enum(['typescript', 'javascript', 'python', 'java']).optional()
  }),
  execute: async ({ filePath, language }, context) => {
    // Parse code using appropriate parser
    // Extract functions, classes, imports
    // Return structured analysis
  }
});

// Find references
const findReferencesTool = tool({
  description: 'Find references to a symbol across the codebase',
  parameters: z.object({
    symbol: z.string().describe('Symbol name to find references for'),
    filePattern: z.string().optional().describe('File pattern to search within')
  }),
  execute: async ({ symbol, filePattern }, context) => {
    // Search for symbol references
    // Return locations with context
  }
});

// Dependency analysis
const analyzeDependenciesTool = tool({
  description: 'Analyze project dependencies from package.json or similar',
  parameters: z.object({
    includeDevDependencies: z.boolean().default(true).optional()
  }),
  execute: async ({ includeDevDependencies }, context) => {
    // Parse dependency files
    // Return structured dependency information
  }
});
```

### 5. Platform Integration Tools

**Project Wiz Platform Tools:**
```typescript
// Send message to channel
const sendMessageTool = tool({
  description: 'Send a message to a project channel or conversation',
  parameters: z.object({
    content: z.string().describe('Message content to send'),
    channelId: z.string().optional().describe('Channel ID (if not provided, uses current conversation)')
  }),
  execute: async ({ content, channelId }, context) => {
    // Send message using existing message service
    // Return message ID and status
  }
});

// Update job status
const updateJobStatusTool = tool({
  description: 'Update the current job status and progress',
  parameters: z.object({
    status: z.enum(['in_progress', 'completed', 'failed']),
    progress: z.number().min(0).max(100).optional(),
    statusMessage: z.string().optional()
  }),
  execute: async ({ status, progress, statusMessage }, context) => {
    // Update job status via event bus
    // Emit progress events
  }
});

// Query project information
const getProjectInfoTool = tool({
  description: 'Get information about the current project',
  parameters: z.object({
    includeChannels: z.boolean().default(false).optional(),
    includeMembers: z.boolean().default(false).optional()
  }),
  execute: async ({ includeChannels, includeMembers }, context) => {
    // Query project data from database
    // Return structured project information
  }
});
```

### 6. Development Environment Tools

**Package Management and Build Tools:**
```typescript
// Run npm/yarn command
const runPackageCommandTool = tool({
  description: 'Run package manager command (npm, yarn, pnpm)',
  parameters: z.object({
    manager: z.enum(['npm', 'yarn', 'pnpm']).default('npm'),
    command: z.string().describe('Command to run (e.g., "install", "test", "build")'),
    args: z.array(z.string()).optional()
  }),
  execute: async ({ manager, command, args }, context) => {
    // Execute package manager command
    // Stream output for long-running commands
    // Return exit code and output
  }
});

// Run tests
const runTestsTool = tool({
  description: 'Run project tests with specified pattern or configuration',
  parameters: z.object({
    testPattern: z.string().optional().describe('Test file pattern or specific test'),
    watch: z.boolean().default(false).optional(),
    coverage: z.boolean().default(false).optional()
  }),
  execute: async ({ testPattern, watch, coverage }, context) => {
    // Run appropriate test command
    // Parse test results
    // Return structured test output
  }
});
```

### 7. Tool Security and Validation

**Security Measures:**
- Path traversal prevention for file operations
- Command injection prevention for shell commands
- Workspace isolation enforcement
- Resource usage limits (file size, command timeout)

**Input Validation:**
```typescript
// Path validation utility
function validateWorkspacePath(path: string, workspaceRoot: string): boolean {
  const resolvedPath = path.resolve(workspaceRoot, path);
  return resolvedPath.startsWith(workspaceRoot);
}

// Command validation for git operations
function validateGitCommand(command: string): boolean {
  const allowedCommands = ['status', 'add', 'commit', 'push', 'pull', 'branch', 'checkout'];
  return allowedCommands.includes(command.split(' ')[0]);
}
```

### 8. Error Handling and Logging

**Standardized Error Response:**
```typescript
interface ToolError {
  code: string;
  message: string;
  details?: any;
  recoverable: boolean;
}

function createToolError(code: string, message: string, recoverable = false): ToolResult {
  return {
    success: false,
    error: message,
    metadata: { code, recoverable }
  };
}
```

**Comprehensive Logging:**
- Tool execution start/end with parameters
- File system operations with paths and sizes
- Git command execution with output
- Platform API calls with response status
- Error scenarios with stack traces

### 9. Performance Optimization

**Caching Strategies:**
- File content caching for repeated reads
- Git status caching with invalidation
- Code analysis result caching by file hash
- Project information caching with TTL

**Resource Management:**
- File size limits for read/write operations
- Command timeout enforcement
- Memory usage monitoring for analysis tools
- Concurrent tool execution limits

### 10. ResponseGenerator Integration

**Enhanced ResponseGenerator:**
```typescript
// Updated response generator with tool support
class ResponseGenerator {
  async generateResponse(jobData: EnhancedJobData): Promise<string> {
    const tools = await this.buildToolSet(jobData);
    
    const response = await generateText({
      model: this.getModel(jobData.provider, jobData.model),
      messages: jobData.messages,
      tools: tools,
      maxToolRoundtrips: 10,
      onStepFinish: (step) => {
        // Log tool usage and results
        this.logToolExecution(step);
      }
    });
    
    return response.text;
  }
  
  private async buildToolSet(jobData: EnhancedJobData): Promise<Record<string, any>> {
    const context: ToolExecutionContext = {
      taskId: jobData.taskId,
      workspaceDir: jobData.workspace?.workingDirectory,
      repositoryUrl: jobData.workspace?.repoUrl,
      branch: jobData.workspace?.branch,
      userId: jobData.userId,
      projectId: jobData.projectId,
      conversationId: jobData.conversationId
    };
    
    // Return tool set based on context and permissions
    return this.toolRegistry.getToolsForContext(context);
  }
}
```

## External Dependencies

**New Dependencies Required:**
- **@babel/parser**: For JavaScript/TypeScript code parsing
  - Justification: Robust AST parsing for code analysis tools
  - Version: ^7.22.0

- **typescript**: For TypeScript-specific analysis
  - Justification: TypeScript compiler API for advanced code analysis
  - Version: ^5.1.0 (dev dependency, runtime API usage)

**Optional Dependencies:**
- **eslint**: For code quality analysis tools
- **prettier**: For code formatting tools
- Language-specific parsers as needed (Python, Java, etc.)