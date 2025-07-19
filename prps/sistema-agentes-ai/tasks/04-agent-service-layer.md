# Task: Create Agent Service Layer

## Meta Information

```yaml
id: TASK-004
title: Create Agent Service Layer with User Integration
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 4 hours
dependencies: [TASK-001, TASK-002, TASK-003]
tech_stack: [TypeScript, Drizzle ORM, SQLite, AI SDK]
domain_context: agents/service
project_type: desktop
```

## Primary Goal

**Create a comprehensive service layer for agent lifecycle management that integrates with the existing user system, following established service patterns for database operations and business logic**

### Success Criteria
- [ ] AgentService class with full CRUD operations implemented
- [ ] Agent-user relationship properly managed (agents are special users)
- [ ] Service follows existing project patterns from AuthService
- [ ] Agent status management and lifecycle operations
- [ ] Integration with LLM provider system for agent model configuration
- [ ] Error handling consistent with project conventions
- [ ] All service methods return data directly (handlers will wrap IPC)

## Complete Context

### Project Architecture Context
```
src/main/
├── agents/                         # CURRENT DOMAIN
│   ├── agents.schema.ts            # DEPENDENCY - Schema definitions
│   ├── memory.schema.ts            # DEPENDENCY - Memory schema
│   ├── tasks.schema.ts             # DEPENDENCY - Task schema
│   ├── agent.service.ts            # THIS TASK - Service implementation
│   └── agent.handlers.ts           # FUTURE - IPC handlers
├── user/                           # INTEGRATION TARGET
│   ├── users.schema.ts             # Agents use type="agent" in users table
│   └── authentication/
│       └── auth.service.ts         # Pattern source for service structure
├── llm/                            # DEPENDENCY
│   ├── providers.schema.ts         # Provider relationship
│   └── provider.service.ts         # DEPENDENCY - Provider operations
├── conversations/                  # INTEGRATION
│   ├── conversation.service.ts     # Agent participation in conversations
│   └── messages.schema.ts          # Agent message authoring
```

### Technology-Specific Context
```yaml
database:
  type: SQLite
  orm_framework: Drizzle ORM
  schema_location: src/main/agents/*.schema.ts
  migration_command: npm run db:migrate

backend:
  framework: Electron Main Process
  language: TypeScript
  api_pattern: Service layer returns data, handlers wrap IPC
  auth_method: Simple in-memory session

integration:
  user_system: Agents are users with type="agent"
  conversation_system: Agents participate as conversation members
  llm_system: Agents use provider credentials for model access

testing:
  unit_framework: Vitest
  test_command: npm test
  
build_tools:
  package_manager: npm
  linter: ESLint
  formatter: Prettier
  type_checker: TypeScript
```

### Existing Code Patterns
```typescript
// Pattern 1: Service Class Structure (from AuthService)
export class AuthService {
  static async create(input: CreateInput): Promise<SelectType> {
    const db = getDatabase();
    
    // Business logic and validation
    const [result] = await db.insert(table).values(input).returning();
    
    if (!result) {
      throw new Error("Failed to create");
    }
    
    return result; // Return data directly
  }
}

// Pattern 2: User Creation (from AuthService.register)
const [user] = await db
  .insert(usersTable)
  .values({
    name: input.name,
    avatar: input.avatar,
    type: "human", // For agents: type: "agent"
  })
  .returning();

// Pattern 3: Complex Queries with Joins
const [result] = await db
  .select({
    user: usersTable,
    agent: agentsTable,
  })
  .from(agentsTable)
  .innerJoin(usersTable, eq(agentsTable.userId, usersTable.id))
  .where(eq(agentsTable.id, agentId))
  .limit(1);

// Pattern 4: Error Handling
if (!existingRecord) {
  throw new Error("Descriptive error message");
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

import_organization:
  - Node.js built-ins
  - External libraries (drizzle-orm)
  - Internal modules with @/ alias (@/main/database/connection)
  - Relative imports for same domain

error_handling:
  pattern: Throw errors with descriptive messages
  logging: Use existing logger utility if available
  validation: Service layer validates input and business rules
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

### Phase 1: Service Foundation
```
CREATE src/main/agents/agent.service.ts:
  - FOLLOW_PATTERN: src/main/user/authentication/auth.service.ts
  - SETUP_IMPORTS:
    • Import Drizzle ORM utilities (eq, and, or)
    • Import getDatabase from @/main/database/connection
    • Import schema types from agents, users, and providers schemas
    • Import logger and error utilities if available
  
  - DEFINE_INTERFACES:
    • CreateAgentInput (extends InsertAgent but includes user fields)
    • UpdateAgentInput (Partial with id)
    • AgentWithUser (joined agent and user data)
    • AgentWithProvider (includes provider configuration)
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check import paths and type definitions
```

### Phase 2: Agent Creation Logic
```
IMPLEMENT_CREATE_METHOD:
  - AGENT_CREATION_WORKFLOW:
    • Validate input data (name, role, backstory, etc.)
    • Verify provider exists and belongs to user
    • Create user entry with type="agent"
    • Create agent entry linked to user
    • Set initial status and configuration
    • Handle default agent setup if first agent
  
  - DATABASE_TRANSACTION:
    • Use transaction for user + agent creation
    • Ensure referential integrity
    • Handle rollback on failure
    • Return complete agent data
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check transaction patterns and error handling
```

### Phase 3: Agent Retrieval Operations
```
IMPLEMENT_READ_METHODS:
  - FIND_BY_ID:
    • Get agent by ID with user data
    • Join agent and user tables
    • Include provider configuration if needed
    • Handle not found cases
  
  - FIND_BY_USER_ID:
    • Get agent associated with user ID
    • Handle agents that are also users (type="agent")
    • Return null if no agent found for user
  
  - LIST_USER_AGENTS:
    • Get all agents owned by a user
    • Include status and basic configuration
    • Support filtering and pagination
    • Order by creation date or status
  
  - GET_AGENT_WITH_PROVIDER:
    • Get agent with decrypted provider credentials
    • Use ProviderService.getDecrypted method
    • Handle provider access permissions
    • Return ready-to-use agent configuration
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check join patterns and method signatures
```

### Phase 4: Agent Updates and Status Management
```
IMPLEMENT_UPDATE_METHODS:
  - UPDATE_AGENT:
    • Update agent configuration fields
    • Handle model configuration changes
    • Update provider associations
    • Maintain audit trail with updatedAt
  
  - UPDATE_STATUS:
    • Change agent status (available, busy, absent, offline)
    • Validate status transitions
    • Handle status-dependent business logic
    • Notify related systems if needed
  
  - UPDATE_CONFIGURATION:
    • Update model configuration JSON
    • Validate configuration structure
    • Handle provider credential changes
    • Test configuration if possible
  
  - VALIDATE: npm test
  - IF_FAIL: Add test cases and fix update logic
```

### Phase 5: Integration and Business Logic
```
IMPLEMENT_BUSINESS_LOGIC:
  - AGENT_VALIDATION:
    • Validate agent name uniqueness per user
    • Verify provider access permissions
    • Validate model configuration format
    • Check backstory and goal requirements
  
  - STATUS_MANAGEMENT:
    • Implement agent lifecycle states
    • Handle status-based access control
    • Manage agent availability for tasks
    • Support graceful agent shutdown
  
  - PROVIDER_INTEGRATION:
    • Validate provider compatibility
    • Handle provider credential rotation
    • Support multiple providers per agent
    • Implement provider fallback logic
  
  - USER_INTEGRATION:
    • Ensure agent-user relationship integrity
    • Handle user deletion cascades
    • Support agent transfer between users
    • Maintain conversation participation
  
  - VALIDATE: npm test
  - IF_FAIL: Add comprehensive test coverage
```

## Validation Checkpoints

### Checkpoint 1: Service Structure
```
VALIDATE_SERVICE_STRUCTURE:
  - RUN: npm run type-check
  - EXPECT: No TypeScript errors in service file
  - CHECK: All imports resolved correctly
  - CHECK: Service class follows established patterns
  - CHECK: Method signatures match interface definitions
```

### Checkpoint 2: Agent Creation
```
VALIDATE_AGENT_CREATION:
  - TEST_CREATE_WORKFLOW:
    • Create agent with valid input
    • Verify user entry created with type="agent"
    • Verify agent entry linked correctly
    • Test transaction rollback on failure
  
  - TEST_VALIDATION:
    • Test with invalid provider ID
    • Test with missing required fields
    • Test duplicate agent name handling
```

### Checkpoint 3: Agent Retrieval
```
VALIDATE_AGENT_RETRIEVAL:
  - TEST_FIND_OPERATIONS:
    • Find agent by ID with user data
    • Find agent by user ID
    • List user's agents with pagination
    • Get agent with provider credentials
  
  - TEST_NOT_FOUND_CASES:
    • Handle non-existent agent IDs gracefully
    • Return null for missing agents
    • Validate error messages are descriptive
```

### Checkpoint 4: Agent Updates
```
VALIDATE_AGENT_UPDATES:
  - TEST_UPDATE_OPERATIONS:
    • Update agent configuration
    • Change agent status
    • Update model configuration
    • Test concurrent update handling
  
  - TEST_BUSINESS_RULES:
    • Validate status transitions
    • Test provider relationship updates
    • Verify audit trail maintenance
```

### Checkpoint 5: Integration Testing
```
VALIDATE_INTEGRATION:
  - START: npm run dev
  - TEST_FULL_WORKFLOW:
    • Create user with provider
    • Create agent for user
    • Update agent configuration
    • Test agent-provider relationship
    • Verify conversation participation capability
    • Test agent deletion and cleanup
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example agent creation input
const createAgentInput: CreateAgentInput = {
  ownerUserId: "user-123-uuid", // User who owns the agent
  name: "Sarah the Frontend Developer",
  role: "Frontend Developer",
  backstory: "Expert React developer with 8 years of experience building modern web applications. Passionate about clean code, user experience, and component architecture.",
  goal: "Build exceptional user interfaces and mentor other developers",
  avatar: "https://example.com/avatars/sarah.png",
  modelConfig: JSON.stringify({
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: "You are Sarah, a helpful frontend developer..."
  }),
  providerId: "provider-456-uuid"
};

// Example agent update input
const updateAgentInput: UpdateAgentInput = {
  id: "agent-789-uuid",
  goal: "Build exceptional user interfaces and lead the frontend team",
  status: "busy",
  modelConfig: JSON.stringify({
    model: "gpt-4o",
    temperature: 0.8,
    maxTokens: 3000
  })
};

// Example agent with user data
const agentWithUser: AgentWithUser = {
  id: "agent-789-uuid",
  userId: "agent-user-123-uuid",
  name: "Sarah the Frontend Developer",
  role: "Frontend Developer",
  status: "available",
  user: {
    id: "agent-user-123-uuid",
    name: "Sarah the Frontend Developer",
    type: "agent",
    avatar: "https://example.com/avatars/sarah.png"
  }
};
```

### Common Scenarios
1. **Agent Hiring**: User hires new specialized agent through assistant
2. **Agent Onboarding**: New agent gets initial configuration and introduction
3. **Status Management**: Agent changes status during task processing
4. **Configuration Updates**: User modifies agent behavior and capabilities
5. **Agent Collaboration**: Multiple agents work together on projects

### Business Rules & Constraints
- **User Ownership**: Agents must belong to valid users
- **Provider Access**: Agents can only use their owner's providers
- **Unique Names**: Agent names must be unique per owner
- **Status Consistency**: Agent status must be valid and consistent
- **Configuration Validity**: Model configuration must be valid JSON

### Edge Cases & Error Scenarios
- **Invalid Provider**: Agent creation with non-existent provider ID
- **User Deletion**: Handle agent cleanup when user is deleted
- **Provider Removal**: Handle agent updates when provider is removed
- **Concurrent Updates**: Multiple status changes happening simultaneously
- **Configuration Errors**: Invalid model configuration JSON

## Troubleshooting Guide

### Common Issues by Technology

#### Database Relationship Issues
```
PROBLEM: Foreign key constraint violations
SOLUTION: 
  - Verify user exists before creating agent
  - Check provider ownership permissions
  - Ensure proper transaction handling
  - Validate all relationship integrity

PROBLEM: Transaction rollback failures
SOLUTION:
  - Implement proper transaction boundaries
  - Check database connection stability
  - Verify rollback logic on errors
  - Use try/catch blocks correctly
```

#### Service Integration Issues
```
PROBLEM: Provider service integration failures
SOLUTION:
  - Verify ProviderService.getDecrypted method exists
  - Check provider access permissions
  - Handle provider credential errors gracefully
  - Implement provider fallback mechanisms

PROBLEM: User system integration issues
SOLUTION:
  - Ensure users table supports type="agent"
  - Verify user creation patterns
  - Check conversation system compatibility
  - Test agent as conversation participant
```

#### Configuration and Validation Issues
```
PROBLEM: Model configuration validation errors
SOLUTION:
  - Implement JSON schema validation
  - Provide clear validation error messages
  - Support multiple model configuration formats
  - Validate provider compatibility

PROBLEM: Agent status management issues
SOLUTION:
  - Define clear status state machine
  - Implement status transition validation
  - Handle concurrent status changes
  - Provide status change notifications
```

### Debug Commands
```bash
# Service testing
npm test agent.service.test.ts       # Specific service tests
npm run type-check --verbose         # Detailed type errors

# Database debugging
npm run db:studio                    # Visual agent inspection
sqlite3 project-wiz.db "SELECT a.name, a.status, u.type FROM agents a JOIN users u ON a.userId = u.id"

# Integration testing
npm run dev                          # Start development environment
node -e "const {AgentService} = require('./src/main/agents/agent.service'); console.log('Service loaded')"
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] `TASK-001`: LLM providers schema and service
- [ ] `TASK-002`: Agent schemas (agents, memory, tasks)
- [ ] `TASK-003`: Provider service with encryption
- [ ] `src/main/user/users.schema.ts`: User table with agent support
- [ ] `src/main/database/connection.ts`: Database connection utility

### Required Patterns/Conventions
- [ ] Service class with static methods pattern
- [ ] Database transactions for multi-table operations
- [ ] User system integration patterns
- [ ] Provider system integration patterns
- [ ] Error handling with descriptive messages

### Environment Setup
- [ ] Database with all required tables (users, agents, llm_providers)
- [ ] Provider service operational with encryption
- [ ] Testing framework configured for async database operations
- [ ] User authentication system available for testing

---

## Task Completion Checklist

- [ ] AgentService class created with comprehensive CRUD operations
- [ ] Agent-user relationship properly implemented (agents as special users)
- [ ] Service follows existing AuthService and ConversationService patterns
- [ ] Agent status management and lifecycle operations working
- [ ] Integration with LLM provider system completed
- [ ] Database operations use established Drizzle query patterns
- [ ] Error handling consistent with project conventions
- [ ] Unit tests created and passing for all service methods
- [ ] Integration tests verify agent-user-provider relationships
- [ ] Transaction handling ensures data consistency
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without warnings
- [ ] Agent creation, updates, and deletion working end-to-end

**Final Validation**: Run `npm test && npm run type-check` and verify all agent service operations work correctly with proper user and provider integration.