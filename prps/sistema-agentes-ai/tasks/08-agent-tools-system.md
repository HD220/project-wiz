# Task: Create Agent Tools System

## Meta Information

```yaml
id: TASK-008
title: Create Agent Tools System with Action Capabilities
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 4 hours
dependencies: [TASK-004, TASK-005, TASK-006, TASK-007]
tech_stack: [TypeScript, AI SDK Tools, Zod, Drizzle ORM]
domain_context: agents/tools
project_type: desktop
```

## Primary Goal

**Create a comprehensive tool system for agents that enables them to perform actions like sending messages, analyzing code, managing files, and creating tasks through validated tool calls integrated with AI SDK**

### Success Criteria
- [ ] Agent tools defined with Zod schemas for parameter validation
- [ ] Tool execution functions integrated with existing services
- [ ] Tool registration system for dynamic tool availability
- [ ] Security validation for tool parameter access and permissions
- [ ] Integration with AI SDK tool calling system
- [ ] Error handling and result formatting for tool responses
- [ ] Tool usage logging and monitoring capabilities

## Complete Context

### Project Architecture Context
```
src/main/
├── agents/                         # CURRENT DOMAIN
│   ├── agent-tools.ts              # THIS TASK - Tool definitions and execution
│   ├── agent-worker.ts             # DEPENDENCY - Tool usage in processing
│   ├── agent.service.ts            # DEPENDENCY - Agent operations
│   ├── memory.service.ts           # DEPENDENCY - Memory tool operations
│   └── task-queue.service.ts       # DEPENDENCY - Task creation tools
├── conversations/                  # INTEGRATION TARGET
│   ├── message.service.ts          # Tool: send messages
│   └── conversation.service.ts     # Tool: conversation management
├── project/                        # INTEGRATION TARGET
│   └── project.service.ts          # Tool: project analysis
├── git/                            # INTEGRATION TARGET (if exists)
│   └── git.service.ts              # Tool: git operations
```

### Technology-Specific Context
```yaml
ai_sdk_tools:
  framework: AI SDK tool calling system
  validation: Zod schemas for parameter validation
  execution: Async functions with error handling
  integration: Tools registered with generateText calls

database:
  type: SQLite
  orm_framework: Drizzle ORM
  access: Tools can access database through services
  transactions: Tools support atomic operations

backend:
  framework: Electron Main Process
  language: TypeScript
  api_pattern: Tools use existing service layers
  permissions: Tools validate user and agent permissions

security:
  validation: Comprehensive parameter validation
  permissions: User and agent access control
  logging: Tool usage audit trail
  sandboxing: Tools operate within safe boundaries

testing:
  unit_framework: Vitest
  test_command: npm test
  integration: Test tools with real AI SDK calls
  
build_tools:
  package_manager: npm
  linter: ESLint
  formatter: Prettier
  type_checker: TypeScript
```

### Existing Code Patterns
```typescript
// Pattern 1: AI SDK Tool Definition
import { tool } from 'ai';
import { z } from 'zod';

const sendMessageTool = tool({
  description: 'Send a message to a conversation',
  parameters: z.object({
    conversationId: z.string().describe('The conversation ID'),
    content: z.string().describe('The message content'),
  }),
  execute: async ({ conversationId, content }) => {
    const result = await MessageService.create({
      conversationId,
      content,
      authorId: agent.userId
    });
    return { success: true, messageId: result.id };
  },
});

// Pattern 2: Service Integration (from existing services)
import { MessageService } from '@/main/conversations/message.service';
import { ConversationService } from '@/main/conversations/conversation.service';
import { ProjectService } from '@/main/project/project.service';

// Pattern 3: Error Handling in Tools
const toolResult = await tool.execute(parameters).catch(error => ({
  success: false,
  error: error instanceof Error ? error.message : 'Unknown error'
}));

// Pattern 4: Permission Validation
if (!await this.validateAgentPermission(agentId, 'send_message', conversationId)) {
  throw new Error('Agent does not have permission to send messages to this conversation');
}
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: kebab-case
  variables: camelCase
  constants: SCREAMING_SNAKE_CASE
  classes: PascalCase
  methods: camelCase
  tools: camelCase with descriptive names

import_organization:
  - Node.js built-ins
  - External libraries (ai, zod)
  - Internal modules with @/ alias
  - Relative imports for same domain

error_handling:
  pattern: Comprehensive try/catch with specific error types
  logging: Structured logging for tool usage and errors
  recovery: Graceful failure with meaningful error messages
```

### Validation Commands
```bash
npm run type-check      # TypeScript type checking
npm run lint           # ESLint checks
npm run format         # Prettier formatting
npm test              # Run unit tests
npm run dev           # Start development for integration testing
```

## Implementation Steps

### Phase 1: Tool Foundation
```
CREATE src/main/agents/agent-tools.ts:
  - SETUP_IMPORTS:
    • Import AI SDK tool and Zod for tool definitions
    • Import existing service layers for tool execution
    • Import agent and user services for permission validation
    • Import logger for tool usage tracking
  
  - DEFINE_INTERFACES:
    • ToolExecutionContext (agent, user, permissions)
    • ToolResult (success, data, error, metadata)
    • ToolPermissions (action, resource, conditions)
    • ToolUsageStats (count, success rate, performance)
  
  - CREATE_TOOL_REGISTRY:
    • Central registry for all available tools
    • Dynamic tool registration and discovery
    • Tool categorization and organization
    • Tool availability based on agent capabilities
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check import paths and interface definitions
```

### Phase 2: Communication Tools
```
IMPLEMENT_COMMUNICATION_TOOLS:
  - SEND_MESSAGE_TOOL:
    • Zod schema for conversationId and content validation
    • Integration with MessageService.create
    • Permission validation for conversation access
    • Support for message formatting and attachments
  
  - CREATE_CONVERSATION_TOOL:
    • Zod schema for conversation creation parameters
    • Integration with ConversationService.create
    • Support for different conversation types (DM, group)
    • Participant management and permissions
  
  - JOIN_CONVERSATION_TOOL:
    • Zod schema for conversation joining
    • Permission validation for conversation access
    • Integration with conversation participant management
    • Support for invitation and approval workflows
  
  - SEARCH_MESSAGES_TOOL:
    • Zod schema for search parameters
    • Integration with message search capabilities
    • Context-aware search within accessible conversations
    • Result formatting and relevance scoring
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check service integrations and parameter validation
```

### Phase 3: Task and Memory Tools
```
IMPLEMENT_TASK_MEMORY_TOOLS:
  - CREATE_TASK_TOOL:
    • Zod schema for task creation parameters
    • Integration with TaskQueueService.enqueue
    • Support for different task types and priorities
    • Task scheduling and dependency management
  
  - STORE_MEMORY_TOOL:
    • Zod schema for memory storage parameters
    • Integration with MemoryService.store
    • Support for different memory types
    • Importance scoring and categorization
  
  - RETRIEVE_MEMORIES_TOOL:
    • Zod schema for memory retrieval parameters
    • Integration with MemoryService search and retrieval
    • Context-aware memory filtering
    • Relevance scoring and result limiting
  
  - UPDATE_AGENT_STATUS_TOOL:
    • Zod schema for status update parameters
    • Integration with AgentService.updateStatus
    • Support for status transitions and validation
    • Status change notifications and logging
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check memory and task service integrations
```

### Phase 4: Project and Analysis Tools
```
IMPLEMENT_PROJECT_TOOLS:
  - ANALYZE_PROJECT_TOOL:
    • Zod schema for project analysis parameters
    • Integration with project file system access
    • Code analysis and structure understanding
    • Result formatting for AI consumption
  
  - READ_FILE_TOOL:
    • Zod schema for file reading parameters
    • Security validation for file access permissions
    • Support for different file types and encoding
    • Content preprocessing and formatting
  
  - WRITE_FILE_TOOL:
    • Zod schema for file writing parameters
    • Comprehensive security validation
    • Backup and versioning support
    • Content validation and sanitization
  
  - SEARCH_CODE_TOOL:
    • Zod schema for code search parameters
    • Integration with code search capabilities
    • Support for pattern matching and context
    • Result relevance and formatting
  
  - VALIDATE: npm test
  - IF_FAIL: Add comprehensive test cases for file operations
```

### Phase 5: Tool Security and Management
```
IMPLEMENT_TOOL_MANAGEMENT:
  - PERMISSION_VALIDATION:
    • Validate agent permissions for tool usage
    • Check user ownership and access rights
    • Implement resource-specific permissions
    • Support for dynamic permission evaluation
  
  - TOOL_USAGE_LOGGING:
    • Log all tool executions with parameters
    • Track tool performance and success rates
    • Monitor for suspicious or excessive usage
    • Support for audit trail and debugging
  
  - ERROR_HANDLING:
    • Comprehensive error handling for all tools
    • Meaningful error messages for AI consumption
    • Error categorization and recovery suggestions
    • Integration with agent error recovery systems
  
  - TOOL_REGISTRATION:
    • Dynamic tool registration system
    • Tool availability based on agent configuration
    • Support for custom tools and extensions
    • Tool versioning and compatibility management
  
  - VALIDATE: npm test
  - IF_FAIL: Add security and management test coverage
```

## Validation Checkpoints

### Checkpoint 1: Tool Definition
```
VALIDATE_TOOL_DEFINITION:
  - TEST_TOOL_SCHEMAS:
    • Verify Zod schemas accept valid parameters
    • Test parameter validation with invalid inputs
    • Check schema descriptions for AI understanding
    • Validate required vs optional parameters
  
  - TEST_TOOL_REGISTRATION:
    • Register tools successfully
    • Verify tool discovery and enumeration
    • Test tool categorization and filtering
```

### Checkpoint 2: Communication Tools
```
VALIDATE_COMMUNICATION_TOOLS:
  - TEST_MESSAGE_TOOLS:
    • Send message to valid conversation
    • Test message validation and formatting
    • Verify permission checks
    • Test error handling for invalid conversations
  
  - TEST_CONVERSATION_TOOLS:
    • Create new conversation successfully
    • Join existing conversation with permissions
    • Search messages with proper filtering
```

### Checkpoint 3: Task and Memory Tools
```
VALIDATE_TASK_MEMORY_TOOLS:
  - TEST_TASK_TOOLS:
    • Create task with valid parameters
    • Test task scheduling and priority
    • Verify task queue integration
  
  - TEST_MEMORY_TOOLS:
    • Store memory with validation
    • Retrieve memories with filtering
    • Test memory search functionality
    • Verify agent status updates
```

### Checkpoint 4: Project Tools
```
VALIDATE_PROJECT_TOOLS:
  - TEST_FILE_OPERATIONS:
    • Read file with proper permissions
    • Write file with security validation
    • Test file access restrictions
  
  - TEST_ANALYSIS_TOOLS:
    • Analyze project structure
    • Search code with pattern matching
    • Verify result formatting
```

### Checkpoint 5: Integration Testing
```
VALIDATE_INTEGRATION:
  - START: npm run dev
  - TEST_WITH_AI_SDK:
    • Register tools with AI SDK generateText
    • Execute tools through AI model calls
    • Verify tool parameter validation
    • Test tool chaining and complex workflows
    • Monitor tool performance and reliability
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example tool definitions
const sendMessageTool = tool({
  description: 'Send a message to a conversation',
  parameters: z.object({
    conversationId: z.string().uuid().describe('The conversation ID'),
    content: z.string().min(1).max(4000).describe('The message content'),
    attachments: z.array(z.string()).optional().describe('Optional file attachments')
  }),
  execute: async ({ conversationId, content, attachments = [] }) => {
    // Validate permissions
    await validateConversationAccess(conversationId, agentId);
    
    // Create message
    const message = await MessageService.create({
      conversationId,
      content,
      authorId: agent.userId,
      attachments
    });
    
    return {
      success: true,
      messageId: message.id,
      timestamp: message.createdAt
    };
  }
});

// Example tool execution result
const toolResult: ToolResult = {
  success: true,
  data: {
    messageId: "msg-123-uuid",
    timestamp: new Date(),
    conversationId: "conv-456-uuid"
  },
  error: null,
  metadata: {
    toolName: "sendMessage",
    executionTime: 234,
    agentId: "agent-789-uuid"
  }
};

// Example tool registry
const agentTools = {
  communication: [sendMessageTool, createConversationTool],
  memory: [storeMemoryTool, retrieveMemoriesTool],
  tasks: [createTaskTool, updateStatusTool],
  project: [analyzeProjectTool, readFileTool, writeFileTool]
};
```

### Common Scenarios
1. **Natural Conversation**: Agent sends messages using sendMessage tool
2. **Code Review**: Agent analyzes files and provides feedback via tools
3. **Task Management**: Agent creates follow-up tasks for complex workflows
4. **Learning Integration**: Agent stores learnings from user interactions
5. **Project Analysis**: Agent examines project structure and provides insights

### Business Rules & Constraints
- **Permission Validation**: All tools must validate agent permissions
- **Parameter Validation**: Zod schemas must comprehensively validate inputs
- **Audit Trail**: All tool executions must be logged for accountability
- **Resource Limits**: Tools must respect system resource constraints
- **Error Handling**: Tools must provide meaningful error messages

### Edge Cases & Error Scenarios
- **Invalid Parameters**: Handle malformed or invalid tool parameters
- **Permission Denied**: Graceful handling of insufficient permissions
- **Service Unavailable**: Handle downstream service failures
- **Resource Conflicts**: Handle concurrent access to shared resources
- **Tool Execution Timeout**: Handle long-running tool operations

## Troubleshooting Guide

### Common Issues by Technology

#### Tool Definition Issues
```
PROBLEM: Zod schema validation failures
SOLUTION: 
  - Verify schema matches expected parameter types
  - Check required vs optional parameter definitions
  - Ensure descriptions are clear for AI understanding
  - Test schema with various input combinations

PROBLEM: Tool registration failures
SOLUTION:
  - Check tool name uniqueness and naming conventions
  - Verify tool function signatures match AI SDK requirements
  - Ensure proper error handling in tool execution
  - Validate tool dependencies and service availability
```

#### Tool Execution Issues
```
PROBLEM: Permission validation failures
SOLUTION:
  - Verify agent has necessary permissions for tool usage
  - Check user ownership of resources being accessed
  - Implement proper permission inheritance and delegation
  - Add debugging for permission evaluation logic

PROBLEM: Service integration failures
SOLUTION:
  - Verify service layer methods exist and are accessible
  - Check service method signatures and parameter types
  - Ensure proper error handling in service calls
  - Test service integration with mock data
```

#### AI SDK Integration Issues
```
PROBLEM: Tools not called by AI model
SOLUTION:
  - Verify tool descriptions are clear and specific
  - Check parameter schemas provide enough context
  - Ensure tools are properly registered with generateText
  - Review AI model's tool calling capabilities

PROBLEM: Tool parameter parsing errors
SOLUTION:
  - Validate Zod schema compatibility with AI SDK
  - Check parameter type conversions and coercion
  - Ensure proper JSON serialization of complex types
  - Test with various AI model outputs
```

### Debug Commands
```bash
# Tool system testing
npm test agent-tools.test.ts         # Specific tool tests
npm run type-check --verbose         # Detailed type errors

# Tool execution debugging
export TOOL_DEBUG=1                  # Enable tool debug logging
npm run dev                          # Start with debug mode

# Tool usage monitoring
sqlite3 project-wiz.db "SELECT toolName, COUNT(*), AVG(executionTime) FROM tool_usage_logs GROUP BY toolName"

# AI SDK tool debugging
export AI_DEBUG=1                    # Enable AI SDK debug logging
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] `TASK-004`: Agent service for agent operations
- [ ] `TASK-005`: Memory service for memory tools
- [ ] `TASK-006`: Task queue service for task tools
- [ ] `TASK-007`: Agent worker for tool integration
- [ ] `src/main/conversations/message.service.ts`: Message tools
- [ ] AI SDK with tool calling support

### Required Patterns/Conventions
- [ ] AI SDK tool definition patterns with Zod
- [ ] Service layer integration patterns
- [ ] Permission validation patterns
- [ ] Error handling and logging patterns
- [ ] Tool result formatting patterns

### Environment Setup
- [ ] All previous agent system tasks completed
- [ ] AI SDK dependencies installed and configured
- [ ] Service layers operational and tested
- [ ] Permission system configured
- [ ] Logging and monitoring tools available

---

## Task Completion Checklist

- [ ] Agent tools defined with comprehensive Zod schemas
- [ ] Communication tools (send message, create conversation, search)
- [ ] Task and memory tools (create task, store/retrieve memory)
- [ ] Project analysis tools (read/write files, analyze code)
- [ ] Tool security and permission validation system
- [ ] Tool registration and discovery system
- [ ] Integration with AI SDK tool calling system
- [ ] Tool usage logging and monitoring capabilities
- [ ] Error handling and recovery for all tools
- [ ] Unit tests created and passing for all tool operations
- [ ] Integration tests verify AI SDK tool execution
- [ ] Permission and security testing completed
- [ ] Performance testing validates tool execution speed
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without warnings

**Final Validation**: Run `npm test && npm run dev` and verify agents can successfully use all tools through AI SDK integration with proper parameter validation and error handling.