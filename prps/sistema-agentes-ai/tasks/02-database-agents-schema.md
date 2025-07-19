# Task: Create Agent Database Schema

## Meta Information

```yaml
id: TASK-002
title: Create Agent Database Schema and Components
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 3 hours
dependencies: [TASK-001]
tech_stack: [TypeScript, Drizzle ORM, SQLite, Zod]
domain_context: agents/database
project_type: desktop
```

## Primary Goal

**Create comprehensive database schemas for agents, their memories, and task queue system, establishing the foundation for AI agent persistence and background processing**

### Success Criteria
- [ ] Agents schema created with personality and configuration fields
- [ ] Agent memories schema for context storage and retrieval
- [ ] Agent tasks schema for background job queue processing
- [ ] All schemas follow existing project patterns and conventions
- [ ] Foreign key relationships properly established
- [ ] Database migration generated and applied successfully
- [ ] Type inference working for all schema exports

## Complete Context

### Project Architecture Context
```
src/main/
├── agents/                     # NEW - Agent system schemas
│   ├── agents.schema.ts        # Core agent data and configuration
│   ├── memory.schema.ts        # Agent memory and context storage
│   ├── tasks.schema.ts         # Background task queue system
│   └── agent.service.ts        # Service layer (future task)
├── llm/                        # DEPENDENCY - LLM provider system
│   └── providers.schema.ts     # Required for agent-provider relationships
├── user/                       # EXISTING - User system integration
│   └── users.schema.ts         # Agents are special users with type="agent"
├── conversations/              # EXISTING - Message system integration
│   └── messages.schema.ts      # LLM messages already support tool calls
```

### Technology-Specific Context
```yaml
database:
  type: SQLite
  orm_framework: Drizzle ORM
  schema_location: src/main/**/*.schema.ts
  migration_command: npm run db:generate && npm run db:migrate

backend:
  framework: Electron Main Process
  language: TypeScript
  api_pattern: IPC communication
  auth_method: Simple in-memory session

testing:
  unit_framework: Vitest
  test_command: npm test
  
build_tools:
  package_manager: npm
  bundler: Vite
  linter: ESLint
  formatter: Prettier
  type_checker: TypeScript
```

### Existing Code Patterns
```typescript
// Pattern 1: Schema Definition with Custom Types
// From users.schema.ts - Use union types for enums
export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: text("type").$type<"human" | "agent">().notNull().default("human"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Pattern 2: Foreign Key References
// Explicit references to other tables
.references(() => usersTable.id)

// Pattern 3: JSON Storage for Configuration
// Store complex configuration as JSON text
modelConfig: text("model_config").notNull(), // JSON string

// Pattern 4: Type Inference Export
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type UpdateUser = Partial<InsertUser> & { id: string };
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: kebab-case
  tables: snake_case
  variables: camelCase
  constants: SCREAMING_SNAKE_CASE
  types: PascalCase

import_organization:
  - Node.js built-ins (sql from drizzle-orm)
  - External libraries (drizzle-orm/sqlite-core)
  - Internal modules with @/ alias
  - Relative imports for same domain

code_organization:
  - Group related schemas in domain directories
  - Co-locate types with schema definitions
  - Use descriptive field names
  - Apply consistent timestamp patterns
```

### Validation Commands
```bash
npm run type-check      # TypeScript type checking
npm run lint           # ESLint checks
npm run format         # Prettier formatting
npm run db:generate    # Generate migration from schema changes
npm run db:migrate     # Apply migrations to database
npm test              # Run all tests
npm run quality:check  # Full quality validation
```

## Implementation Steps

### Phase 1: Core Agent Schema
```
CREATE src/main/agents/agents.schema.ts:
  - FOLLOW_PATTERN: src/main/user/users.schema.ts
  - DESIGN_SCHEMA:
    • Include agent identification and configuration
    • Reference existing usersTable for agent user relationship
    • Reference llmProvidersTable for LLM configuration
    • Store personality data (backstory, goal, role)
    • Include status tracking for agent availability
    • Store model configuration as JSON for flexibility
    • Apply standard timestamp and ID patterns
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check import statements and type definitions
```

### Phase 2: Memory System Schema
```
CREATE src/main/agents/memory.schema.ts:
  - DESIGN_MEMORY_SYSTEM:
    • Reference agentsTable for memory ownership
    • Include memory type classification (conversation, learning, goal, context)
    • Store content as text for flexible memory types
    • Include importance scoring for memory prioritization
    • Apply standard timestamp patterns for memory age
    • Support memory search and retrieval patterns
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Verify foreign key references and type definitions
```

### Phase 3: Task Queue Schema
```
CREATE src/main/agents/tasks.schema.ts:
  - DESIGN_TASK_SYSTEM:
    • Reference agentsTable for task ownership
    • Store task data as JSON for flexible task types
    • Include priority levels for task processing order
    • Track task status through processing lifecycle
    • Support scheduled/delayed task execution
    • Include retry mechanism with counter
    • Store results and error information
    • Track timing for performance monitoring
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check union type definitions and JSON field patterns
```

### Phase 4: Database Integration
```
EXECUTE: npm run db:generate
  - ENSURE: All tables exported for migration detection
  - FOLLOW: Existing import patterns
  
  - IF_FAIL: Check import paths and export statements
```

### Phase 5: Migration Application
```
GENERATE_AND_APPLY_MIGRATION:
  - RUN: npm run db:generate
  - REVIEW: Generated migration SQL for correctness
  - CHECK: Foreign key constraints properly defined
  - CHECK: Indexes created for performance optimization
  
  - RUN: npm run db:migrate
  - VERIFY: All tables created successfully
  - CHECK: Database schema matches design
```

## Validation Checkpoints

### Checkpoint 1: Schema Syntax
```
VALIDATE_SCHEMA_SYNTAX:
  - RUN: npm run type-check
  - EXPECT: No TypeScript errors in any schema file
  - CHECK: All imports resolved correctly
  - CHECK: Union types properly defined
  - CHECK: Foreign key references valid
```

### Checkpoint 2: Type Inference
```
VALIDATE_TYPE_INFERENCE:
  - CHECK: SelectAgent, InsertAgent, UpdateAgent types available
  - CHECK: SelectAgentMemory, InsertAgentMemory types available  
  - CHECK: SelectAgentTask, InsertAgentTask types available
  - VERIFY: Types include all defined fields with correct nullability
```

### Checkpoint 3: Migration Generation
```
VALIDATE_MIGRATION:
  - RUN: npm run db:generate
  - EXPECT: Single migration file with all three tables
  - CHECK: CREATE TABLE statements for agents, agent_memories, agent_tasks
  - CHECK: Foreign key constraints properly defined
  - CHECK: Indexes created for performance critical fields
```

### Checkpoint 4: Database Structure
```
VALIDATE_DATABASE:
  - RUN: npm run db:migrate
  - RUN: npm run db:studio
  - CHECK: All three tables visible in database studio
  - CHECK: Table relationships display correctly
  - CHECK: Field types match schema definitions
  - VERIFY: Foreign key constraints enforced
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example agent configuration
const exampleAgentInput: InsertAgent = {
  userId: "user-123-uuid", // Links to users table entry
  name: "Sarah",
  role: "Frontend Developer",
  backstory: "Expert React developer with 8 years of experience building modern web applications. Passionate about clean code, user experience, and component architecture.",
  goal: "Build exceptional user interfaces and mentor other developers",
  status: "available",
  modelConfig: JSON.stringify({
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 2000
  }),
  providerId: "provider-456-uuid"
};

// Example memory entry
const exampleMemoryInput: InsertAgentMemory = {
  agentId: "agent-789-uuid",
  type: "learning",
  content: "User prefers TypeScript over JavaScript and likes concise code comments",
  importance: 8 // High importance for user preferences
};

// Example task entry
const exampleTaskInput: InsertAgentTask = {
  agentId: "agent-789-uuid",
  data: JSON.stringify({
    type: "send_message",
    payload: {
      conversationId: "conv-123",
      content: "I've reviewed the code and have some suggestions..."
    }
  }),
  priority: 3,
  status: "pending"
};
```

### Common Scenarios
1. **Agent Creation**: New agent hired with full personality profile
2. **Memory Storage**: Agent learns user preferences and project context
3. **Task Processing**: Background task queue processes agent workload
4. **Status Management**: Agent status updates during processing

### Business Rules & Constraints
- **Agent-User Relationship**: Every agent must have corresponding user entry
- **Provider Requirement**: Every agent must have valid LLM provider
- **Memory Ownership**: Memories belong to specific agents only
- **Task Lifecycle**: Tasks progress through pending → processing → completed/failed
- **Priority Processing**: Higher priority tasks processed first

### Edge Cases & Error Scenarios
- **Invalid Agent Status**: Schema validates against known status values
- **Missing Provider**: Foreign key constraint prevents invalid provider references
- **Orphaned Tasks**: Cascade deletion if agent is removed
- **Memory Overflow**: Consider memory cleanup strategies for long-running agents

## Troubleshooting Guide

### Common Issues by Technology

#### Schema Definition Issues
```
PROBLEM: Foreign key reference errors
SOLUTION: 
  - Verify all referenced tables are imported
  - Check .references(() => tableName.columnName) syntax
  - Ensure referenced table exists in same schema context

PROBLEM: Union type validation errors
SOLUTION:
  - Check .$type<"value1" | "value2">() syntax
  - Verify all union values are properly quoted strings
  - Ensure TypeScript version supports template literal types
```

#### Migration Issues
```
PROBLEM: Migration generation fails with missing tables
SOLUTION:
  - Check all schema files imported in database/index.ts
  - Verify export statements include all table definitions
  - Ensure drizzle.config.ts includes correct schema paths

PROBLEM: Foreign key constraint errors during migration
SOLUTION:
  - Verify referenced tables created before dependent tables
  - Check foreign key field types match referenced field types
  - Review migration order in generated SQL
```

#### JSON Field Issues
```
PROBLEM: JSON parsing errors in model configuration
SOLUTION:
  - Validate JSON structure before storing
  - Use JSON.stringify() for consistent serialization
  - Include error handling for JSON.parse() operations
  - Consider Zod schema validation for JSON content
```

### Debug Commands
```bash
# Schema validation
npm run type-check --verbose      # Detailed TypeScript errors
npm run db:generate --verbose     # Detailed migration generation

# Database debugging  
npm run db:studio                 # Visual database inspection
sqlite3 project-wiz.db ".schema agent*"  # Agent table schemas
sqlite3 project-wiz.db "PRAGMA foreign_key_list(agents);"  # FK constraints
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] `TASK-001`: LLM providers schema must exist first
- [ ] `src/main/user/users.schema.ts`: Required for agent-user relationship
- [ ] `src/main/database/connection.ts`: Database connection utility
- [ ] `src/main/database/index.ts`: Schema export aggregation

### Required Patterns/Conventions
- [ ] Drizzle ORM table definition patterns
- [ ] TypeScript union type definitions
- [ ] JSON field storage patterns
- [ ] Foreign key relationship patterns
- [ ] Timestamp handling with SQLite integer mode

### Environment Setup
- [ ] LLM providers table exists from previous task
- [ ] Database connection properly configured
- [ ] Drizzle Kit configuration includes schema paths
- [ ] TypeScript configured for proper type inference

---

## Task Completion Checklist

- [ ] Agent schema created with personality and configuration fields
- [ ] Memory schema created with type classification and importance
- [ ] Task schema created with priority queue and status tracking
- [ ] All schemas follow established project patterns
- [ ] Type inference exports working for all schemas
- [ ] Foreign key relationships properly established
- [ ] Schema files imported in database index
- [ ] Migration generated with all three tables
- [ ] Migration applied successfully to database
- [ ] Database tables verified in studio interface
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without warnings
- [ ] All validation checkpoints completed successfully

**Final Validation**: Run `npm run quality:check && npm run db:studio` and verify all agent tables exist with proper structure and relationships.