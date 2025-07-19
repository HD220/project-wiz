# Task: Create Agent IPC Handlers

## Meta Information

```yaml
id: TASK-009
title: Create Agent IPC Handlers for Frontend Integration
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 3 hours
dependencies: [TASK-003, TASK-004, TASK-005, TASK-006]
tech_stack: [TypeScript, Electron IPC, Drizzle ORM]
domain_context: agents/handlers
project_type: desktop
```

## Primary Goal

**Create IPC handlers for agent system operations that expose agent management, conversation capabilities, and task processing to the frontend following established project patterns**

### Success Criteria
- [ ] Agent IPC handlers following existing project handler patterns
- [ ] Provider IPC handlers for LLM credential management
- [ ] Error handling consistent with project IpcResponse pattern
- [ ] Handler registration in main.ts following established patterns
- [ ] Type-safe communication between main and renderer processes
- [ ] Integration with existing authentication and permission systems

## Complete Context

### Project Architecture Context
```
src/main/
├── agents/                         # CURRENT DOMAIN
│   ├── agent.handlers.ts           # THIS TASK - Agent IPC handlers
│   ├── agent.service.ts            # DEPENDENCY - Agent operations
│   ├── memory.service.ts           # DEPENDENCY - Memory operations
│   └── task-queue.service.ts       # DEPENDENCY - Task operations
├── llm/                            # CURRENT DOMAIN
│   ├── provider.handlers.ts        # THIS TASK - Provider IPC handlers
│   └── provider.service.ts         # DEPENDENCY - Provider operations
├── user/                           # PATTERN REFERENCE
│   └── authentication/
│       └── auth.handlers.ts        # Handler pattern reference
├── main.ts                         # Handler registration
└── types.ts                        # IpcResponse interface
```

### Technology-Specific Context
```yaml
ipc_communication:
  framework: Electron IPC (ipcMain.handle/ipcRenderer.invoke)
  pattern: Handlers wrap service calls in try/catch with IpcResponse
  types: Type-safe with shared interfaces
  authentication: Integration with existing auth system

database:
  type: SQLite
  orm_framework: Drizzle ORM
  access: Through service layer only
  transactions: Service layer handles atomicity

backend:
  framework: Electron Main Process
  language: TypeScript
  api_pattern: Services return data, handlers wrap IPC
  auth_method: Simple in-memory session validation

testing:
  unit_framework: Vitest
  test_command: npm test
  integration: Test with real IPC communication
  
build_tools:
  package_manager: npm
  linter: ESLint
  formatter: Prettier
  type_checker: TypeScript
```

### Existing Code Patterns
```typescript
// Pattern 1: IPC Handler Structure (from auth.handlers.ts)
export function setupAuthHandlers(): void {
  ipcMain.handle(
    "auth:login",
    async (_, credentials: LoginCredentials): Promise<IpcResponse> => {
      try {
        const user = await AuthService.login(credentials);
        return { success: true, data: user };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    }
  );
}

// Pattern 2: IpcResponse Interface (from types.ts)
export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pattern 3: Handler Registration (from main.ts)
import { setupAuthHandlers } from "@/main/user/authentication/auth.handlers";

function initializeHandlers() {
  setupAuthHandlers();
  // Add more handler setups here
}

// Pattern 4: Error Handling
try {
  const result = await Service.method(input);
  return { success: true, data: result };
} catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Operation failed",
  };
}
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: kebab-case
  handlers: "domain:action" format (e.g., "agent:create")
  variables: camelCase
  constants: SCREAMING_SNAKE_CASE
  interfaces: PascalCase

import_organization:
  - Node.js built-ins (ipcMain from electron)
  - External libraries
  - Internal modules with @/ alias
  - Relative imports for same domain

error_handling:
  pattern: Try/catch with IpcResponse wrapper
  logging: Use existing logger utility
  validation: Validate input in handlers before service calls
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

### Phase 1: Agent Handler Foundation
```
CREATE src/main/agents/agent.handlers.ts:
  - FOLLOW_PATTERN: src/main/user/authentication/auth.handlers.ts
  - SETUP_IMPORTS:
    • Import ipcMain from electron
    • Import IpcResponse from @/main/types
    • Import service dependencies (AgentService, MemoryService, etc.)
    • Import logger for error tracking
  
  - DEFINE_INTERFACES:
    • CreateAgentRequest (extends CreateAgentInput)
    • UpdateAgentRequest (agent ID and update data)
    • AgentListRequest (user ID and filtering options)
    • ChatWithAgentRequest (agent ID and message content)
  
  - CREATE_SETUP_FUNCTION:
    • setupAgentHandlers(): void function
    • Follow established registration pattern
    • Include comprehensive error handling
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check import paths and interface definitions
```

### Phase 2: Agent Management Handlers
```
IMPLEMENT_AGENT_MANAGEMENT:
  - AGENT_CREATE_HANDLER:
    • Handle "agent:create" IPC call
    • Validate input parameters
    • Call AgentService.create with proper error handling
    • Return created agent data in IpcResponse format
  
  - AGENT_LIST_HANDLER:
    • Handle "agent:list" IPC call
    • Get user's agents with filtering and pagination
    • Return agent list with status and configuration
    • Support different list views (active, all, by status)
  
  - AGENT_UPDATE_HANDLER:
    • Handle "agent:update" IPC call
    • Validate update permissions and parameters
    • Call AgentService.update with proper validation
    • Return updated agent data
  
  - AGENT_DELETE_HANDLER:
    • Handle "agent:delete" IPC call
    • Validate deletion permissions
    • Handle cascade deletion (tasks, memories)
    • Return deletion confirmation
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check service integrations and type safety
```

### Phase 3: Agent Interaction Handlers
```
IMPLEMENT_AGENT_INTERACTION:
  - CHAT_WITH_AGENT_HANDLER:
    • Handle "agent:chat" IPC call
    • Validate conversation permissions
    • Queue message for agent processing
    • Return immediate acknowledgment with task ID
  
  - GET_AGENT_STATUS_HANDLER:
    • Handle "agent:status" IPC call
    • Return current agent status and activity
    • Include processing statistics and health info
    • Support real-time status monitoring
  
  - GET_AGENT_MEMORIES_HANDLER:
    • Handle "agent:memories" IPC call
    • Retrieve agent memories with filtering
    • Apply privacy and permission filters
    • Return formatted memory data
  
  - UPDATE_AGENT_STATUS_HANDLER:
    • Handle "agent:updateStatus" IPC call
    • Validate status transitions
    • Update agent availability and configuration
    • Notify related systems of status changes
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check interaction patterns and validation
```

### Phase 4: Provider Management Handlers
```
CREATE src/main/llm/provider.handlers.ts:
  - SETUP_PROVIDER_HANDLERS:
    • Follow same pattern as agent handlers
    • Import ProviderService and related types
    • Implement comprehensive error handling
  
  - PROVIDER_CREATE_HANDLER:
    • Handle "provider:create" IPC call
    • Validate API key and provider configuration
    • Encrypt API key before storage
    • Return provider data (without decrypted key)
  
  - PROVIDER_LIST_HANDLER:
    • Handle "provider:list" IPC call
    • Return user's providers without API keys
    • Include provider status and configuration
    • Support filtering by type and status
  
  - PROVIDER_UPDATE_HANDLER:
    • Handle "provider:update" IPC call
    • Handle API key updates with re-encryption
    • Validate provider configuration changes
    • Update default provider settings
  
  - PROVIDER_DELETE_HANDLER:
    • Handle "provider:delete" IPC call
    • Check for agent dependencies
    • Handle default provider reassignment
    • Return deletion confirmation
  
  - TEST_PROVIDER_HANDLER:
    • Handle "provider:test" IPC call
    • Test provider connectivity and authentication
    • Return connection status and capabilities
    • Validate API key without storing
  
  - VALIDATE: npm test
  - IF_FAIL: Add test cases for provider operations
```

### Phase 5: Handler Registration and Integration
```
UPDATE src/main/main.ts:
  - IMPORT_HANDLER_SETUPS:
    • Import setupAgentHandlers from agents/agent.handlers
    • Import setupProviderHandlers from llm/provider.handlers
    • Follow existing import patterns
  
  - REGISTER_HANDLERS:
    • Call setupAgentHandlers() in initialization
    • Call setupProviderHandlers() in initialization
    • Ensure proper order of handler registration
    • Add error handling for handler setup failures
  
  - VALIDATE_REGISTRATION:
    • Verify all handlers are properly registered
    • Test handler availability after setup
    • Check for handler naming conflicts
    • Ensure graceful degradation on failures
  
  - VALIDATE: npm run dev
  - IF_FAIL: Check handler registration and IPC communication
```

## Validation Checkpoints

### Checkpoint 1: Handler Setup
```
VALIDATE_HANDLER_SETUP:
  - TEST_HANDLER_REGISTRATION:
    • Verify setupAgentHandlers() runs without errors
    • Check setupProviderHandlers() registration
    • Test handler naming and conflict resolution
    • Validate error handling in setup functions
  
  - TEST_IPC_COMMUNICATION:
    • Test basic IPC calls to handlers
    • Verify IpcResponse format consistency
    • Check error handling and validation
```

### Checkpoint 2: Agent Handlers
```
VALIDATE_AGENT_HANDLERS:
  - TEST_AGENT_MANAGEMENT:
    • Create agent through IPC handler
    • List agents with proper filtering
    • Update agent configuration
    • Delete agent with proper cleanup
  
  - TEST_AGENT_INTERACTION:
    • Chat with agent through handler
    • Get agent status and memories
    • Update agent status
    • Verify permission validation
```

### Checkpoint 3: Provider Handlers
```
VALIDATE_PROVIDER_HANDLERS:
  - TEST_PROVIDER_MANAGEMENT:
    • Create provider with API key encryption
    • List providers without exposing keys
    • Update provider configuration
    • Delete provider with dependency checks
  
  - TEST_PROVIDER_OPERATIONS:
    • Test provider connectivity
    • Validate API key functionality
    • Handle provider errors gracefully
```

### Checkpoint 4: Error Handling
```
VALIDATE_ERROR_HANDLING:
  - TEST_INVALID_INPUTS:
    • Send malformed requests to handlers
    • Test with missing required parameters
    • Verify proper error messages
    • Check error logging and tracking
  
  - TEST_SERVICE_FAILURES:
    • Simulate service layer failures
    • Test database connection issues
    • Verify graceful error handling
```

### Checkpoint 5: Integration Testing
```
VALIDATE_INTEGRATION:
  - START: npm run dev
  - TEST_FRONTEND_COMMUNICATION:
    • Test all handlers from renderer process
    • Verify type safety across IPC boundary
    • Test concurrent handler execution
    • Monitor performance and reliability
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example agent creation request
const createAgentRequest: CreateAgentRequest = {
  name: "Sarah the Frontend Developer",
  role: "Frontend Developer", 
  backstory: "Expert React developer with 8 years of experience...",
  goal: "Build exceptional user interfaces and mentor developers",
  modelConfig: {
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 2000
  },
  providerId: "provider-123-uuid"
};

// Example IPC handler response
const createAgentResponse: IpcResponse<SelectAgent> = {
  success: true,
  data: {
    id: "agent-456-uuid",
    userId: "agent-user-789-uuid",
    name: "Sarah the Frontend Developer",
    role: "Frontend Developer",
    status: "available",
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

// Example chat request
const chatRequest: ChatWithAgentRequest = {
  agentId: "agent-456-uuid",
  content: "Can you help me implement a dark mode toggle?",
  conversationId: "conv-789-uuid"
};

// Example provider test request
const testProviderRequest = {
  type: "openai" as const,
  apiKey: "sk-test-key-123",
  baseUrl: "https://api.openai.com/v1"
};
```

### Common Scenarios
1. **Agent Creation**: Frontend creates new agent through IPC
2. **Agent Interaction**: User chats with agent via IPC handlers
3. **Provider Management**: User manages LLM credentials securely
4. **Status Monitoring**: Frontend monitors agent status and activity
5. **Error Handling**: Graceful handling of various failure scenarios

### Business Rules & Constraints
- **Authentication Required**: All handlers must validate user authentication
- **Permission Validation**: Handlers must check user permissions for operations
- **Data Sanitization**: Input validation and output sanitization required
- **Error Consistency**: All errors must follow IpcResponse pattern
- **Audit Trail**: All operations must be logged for accountability

### Edge Cases & Error Scenarios
- **Invalid Agent ID**: Handle requests for non-existent agents
- **Permission Denied**: Handle unauthorized access attempts
- **Service Unavailable**: Handle backend service failures
- **Invalid Provider**: Handle malformed provider configurations
- **Concurrent Operations**: Handle multiple simultaneous requests

## Troubleshooting Guide

### Common Issues by Technology

#### IPC Communication Issues
```
PROBLEM: Handler not responding to IPC calls
SOLUTION: 
  - Verify handler is properly registered in main.ts
  - Check handler naming matches frontend calls
  - Ensure ipcMain.handle is used correctly
  - Validate handler function signatures

PROBLEM: Type errors across IPC boundary
SOLUTION:
  - Verify shared interfaces between main and renderer
  - Check IpcResponse type consistency
  - Ensure proper TypeScript configuration
  - Validate parameter type serialization
```

#### Handler Execution Issues
```
PROBLEM: Handlers throwing unhandled errors
SOLUTION:
  - Add comprehensive try/catch blocks
  - Implement proper error logging
  - Return consistent IpcResponse format
  - Handle service layer exceptions gracefully

PROBLEM: Authentication/permission failures
SOLUTION:
  - Verify user authentication state
  - Check permission validation logic
  - Implement proper error messages
  - Add debugging for permission issues
```

#### Service Integration Issues
```
PROBLEM: Service calls failing in handlers
SOLUTION:
  - Verify service layer is properly initialized
  - Check database connection availability
  - Validate service method signatures
  - Add error handling for service failures

PROBLEM: Data validation failures
SOLUTION:
  - Implement input validation in handlers
  - Add parameter sanitization
  - Provide clear validation error messages
  - Test with various input combinations
```

### Debug Commands
```bash
# Handler testing
npm test agent.handlers.test.ts      # Specific handler tests
npm run type-check --verbose         # Detailed type errors

# IPC debugging
# Add debug logging in handlers for troubleshooting
console.log('Handler called:', handlerName, parameters);

# Integration testing
npm run dev                          # Start with all handlers registered
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] `TASK-003`: Provider service for provider handlers
- [ ] `TASK-004`: Agent service for agent handlers
- [ ] `TASK-005`: Memory service for memory handlers
- [ ] `TASK-006`: Task queue service for task handlers
- [ ] `src/main/types.ts`: IpcResponse interface
- [ ] `src/main/user/authentication/auth.handlers.ts`: Pattern reference

### Required Patterns/Conventions
- [ ] IPC handler setup function pattern
- [ ] IpcResponse error handling pattern
- [ ] Service layer integration pattern
- [ ] Handler registration in main.ts pattern
- [ ] Type-safe IPC communication pattern

### Environment Setup
- [ ] All previous service layer tasks completed
- [ ] Electron IPC system properly configured
- [ ] Authentication system operational
- [ ] Testing framework configured for IPC testing
- [ ] Main process and renderer process communication working

---

## Task Completion Checklist

- [ ] Agent IPC handlers created following established patterns
- [ ] Provider IPC handlers with secure credential management
- [ ] All handlers use consistent IpcResponse error handling
- [ ] Handler registration properly implemented in main.ts
- [ ] Type-safe communication between main and renderer processes
- [ ] Integration with authentication and permission systems
- [ ] Comprehensive input validation and sanitization
- [ ] Error handling covers all failure scenarios
- [ ] Unit tests created and passing for all handlers
- [ ] Integration tests verify IPC communication
- [ ] Security testing validates permission enforcement
- [ ] Performance testing ensures responsive handler execution
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without warnings

**Final Validation**: Run `npm test && npm run dev` and verify all agent and provider operations work correctly through IPC handlers with proper error handling and type safety.