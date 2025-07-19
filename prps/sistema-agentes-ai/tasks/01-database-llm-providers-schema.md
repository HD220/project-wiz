# Task: Create LLM Provider Database Schema

## Meta Information

```yaml
id: TASK-001
title: Create LLM Provider Database Schema
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 2 hours
dependencies: []
tech_stack: [TypeScript, Drizzle ORM, SQLite, Zod]
domain_context: llm/providers
project_type: desktop
```

## Primary Goal

**Create the database schema for storing user LLM provider credentials with encrypted API key storage following existing project patterns**

### Success Criteria
- [ ] LLM providers schema created with proper types and validation
- [ ] Foreign key relationships established to users table
- [ ] Drizzle type inference working correctly
- [ ] Database migration generated and applied successfully
- [ ] All validation commands pass without errors

## Complete Context

### Project Architecture Context
```
src/main/
├── llm/                    # NEW - LLM provider system  
│   ├── providers.schema.ts # Schema definitions for providers
│   ├── provider.service.ts # Service layer (next task)
│   └── provider.handlers.ts # IPC handlers (future task)
├── user/                   # EXISTING - User system
│   ├── authentication/
│   │   └── auth.service.ts # Pattern reference for services
│   └── users.schema.ts     # Reference for schema patterns
├── database/
│   ├── connection.ts       # Database connection utility
│   ├── index.ts            # Schema imports for migrations
│   └── migrations/         # Auto-generated migrations
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
  linter: ESLint
  formatter: Prettier
  type_checker: TypeScript
```

### Existing Code Patterns
```typescript
// Pattern 1: Schema Definition with Drizzle ORM
// Example from users.schema.ts - Use type inference and custom types
export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  type: text("type").$type<"human" | "agent">().notNull().default("human"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// Pattern 2: Foreign Key References
// Example: Always reference other tables explicitly
.references(() => usersTable.id)

// Pattern 3: Custom Types with Union Types
// Example: Use union types for enums instead of database enums
type: text("type").$type<"openai" | "deepseek" | "anthropic">().notNull()
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: kebab-case
  variables: camelCase
  constants: SCREAMING_SNAKE_CASE
  classes: PascalCase
  functions: camelCase

import_organization:
  - Node.js built-ins first
  - External libraries (drizzle-orm, etc)
  - Internal modules with @/ alias
  - Relative imports last

code_organization:
  - Co-locate schema files with domain boundaries
  - Export types using Drizzle type inference
  - Use crypto.randomUUID() for primary keys
  - Follow sql`CURRENT_TIMESTAMP` pattern for timestamps
```

### Validation Commands
```bash
npm run type-check      # TypeScript type checking
npm run lint           # ESLint checks
npm run format         # Prettier formatting
npm run db:generate    # Generate migration from schema changes
npm run db:migrate     # Apply migrations to database
npm test              # Run all tests
```

## Implementation Steps

### Phase 1: Schema Design
```
CREATE src/main/llm/providers.schema.ts:
  - FOLLOW_PATTERN: src/main/user/users.schema.ts
  - DESIGN_SCHEMA:
    • Use consistent table naming convention (llm_providers)
    • Apply standard field types: text() for strings, integer() for timestamps
    • Include proper foreign key references to usersTable
    • Use union types for provider enumeration
    • Follow timestamp pattern with mode: "timestamp"
    • Use crypto.randomUUID() for ID generation
    • Include encrypted API key storage field
    • Add boolean fields for isDefault and isActive states
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check import statements and type definitions
```

### Phase 2: Database Integration
```
UPDATE src/main/database/index.ts:
  - ADD: Import providers.schema.ts for migration detection
  - EXPORT: All tables for Drizzle Kit to detect schema changes
  
  - VALIDATE: npm run db:generate
  - IF_FAIL: Check schema syntax and import paths
```

### Phase 3: Migration Generation
```
GENERATE_MIGRATION:
  - RUN: npm run db:generate
  - EXPECT: New migration file created in src/main/database/migrations/
  - REVIEW: Generated SQL for table creation and indexes
  
APPLY_MIGRATION:
  - RUN: npm run db:migrate
  - EXPECT: Migration applied successfully to database
  - VERIFY: Table exists with correct structure
```

## Validation Checkpoints

### Checkpoint 1: Schema Definition
```
VALIDATE_SCHEMA:
  - RUN: npm run type-check
  - EXPECT: No TypeScript errors in schema file
  - CHECK: All imports resolved correctly
  - CHECK: Type inference working for SelectLlmProvider and InsertLlmProvider
```

### Checkpoint 2: Migration Generation
```
VALIDATE_MIGRATION:
  - RUN: npm run db:generate
  - EXPECT: Migration file created without errors
  - CHECK: SQL includes CREATE TABLE statement
  - CHECK: Foreign key constraints properly defined
  - CHECK: Indexes created for performance
```

### Checkpoint 3: Database Application
```
VALIDATE_DATABASE:
  - RUN: npm run db:migrate
  - EXPECT: Migration applied successfully
  - RUN: npm run db:studio
  - CHECK: llm_providers table visible in database studio
  - CHECK: Table structure matches schema definition
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example provider configuration
const exampleProviderInput: InsertLlmProvider = {
  userId: "user-123",
  name: "My OpenAI Provider", 
  type: "openai",
  apiKey: "encrypted-api-key-value", // Will be encrypted by service layer
  baseUrl: "https://api.openai.com/v1", // Optional custom endpoint
  isDefault: true,
  isActive: true
};

// Expected provider output after creation
const expectedProviderOutput: SelectLlmProvider = {
  id: "provider-456",
  ...exampleProviderInput,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Common Scenarios
1. **User's First Provider**: User sets up their primary OpenAI provider
2. **Multiple Providers**: User configures OpenAI, DeepSeek, and Anthropic providers
3. **Custom Endpoints**: User configures provider with custom baseUrl
4. **Provider Management**: User deactivates/reactivates providers

### Business Rules & Constraints
- **Single Default**: Only one provider per user can be marked as default
- **Unique Names**: Provider names must be unique per user
- **Required Fields**: userId, name, type, and apiKey are mandatory
- **Valid Types**: Only supported provider types allowed

### Edge Cases & Error Scenarios
- **Invalid Provider Type**: Schema validates against known provider types
- **Missing User**: Foreign key constraint prevents orphaned providers
- **Duplicate Names**: Database constraints or service layer prevents duplicates
- **Empty API Key**: Validation ensures API key is provided

## Troubleshooting Guide

### Common Issues by Technology

#### Schema Definition Issues
```
PROBLEM: Type inference not working
SOLUTION: 
  - Check export statement uses typeof table.$inferSelect pattern
  - Verify import of sqliteTable and column types
  - Ensure proper TypeScript configuration

PROBLEM: Foreign key reference errors
SOLUTION:
  - Verify usersTable import path is correct
  - Check references() syntax: .references(() => usersTable.id)
  - Ensure referenced table exists in same schema context
```

#### Migration Issues
```
PROBLEM: Migration generation fails
SOLUTION:
  - Check schema file is imported in database/index.ts
  - Verify drizzle.config.ts includes correct schema paths
  - Ensure no syntax errors in schema definition

PROBLEM: Migration application fails
SOLUTION:
  - Check database file permissions and location
  - Verify no conflicting table names exist
  - Review generated SQL for syntax errors
```

### Debug Commands
```bash
# Schema validation
npm run type-check --verbose      # Detailed TypeScript errors
npm run db:generate --verbose     # Detailed migration generation

# Database debugging  
npm run db:studio                 # Visual database inspection
sqlite3 project-wiz.db ".schema"  # Direct schema inspection
```

## Dependencies & Prerequisites

### Required Files/Components
- [ ] `src/main/user/users.schema.ts`: Required for foreign key reference
- [ ] `src/main/database/connection.ts`: Database connection utility
- [ ] `src/main/database/index.ts`: Schema export aggregation

### Required Patterns/Conventions
- [ ] Drizzle ORM table definition patterns
- [ ] TypeScript type inference from schema
- [ ] UUID generation for primary keys
- [ ] Timestamp handling with SQLite integer mode

### Environment Setup
- [ ] Database file exists (project-wiz.db)
- [ ] Drizzle Kit configuration properly set
- [ ] Node.js crypto module available
- [ ] SQLite database accessible

---

## Task Completion Checklist

- [ ] LLM providers schema file created with all required fields
- [ ] Type definitions exported using Drizzle inference
- [ ] Foreign key relationships properly established
- [ ] Schema imported in database index for migration detection
- [ ] Migration generated and reviewed for correctness
- [ ] Migration applied successfully to database
- [ ] TypeScript compilation passes without errors
- [ ] Linting passes without warnings
- [ ] Database table structure verified in studio
- [ ] Schema follows project naming and structure conventions

**Final Validation**: Run `npm run type-check && npm run db:generate && npm run db:migrate` and ensure all steps complete successfully.