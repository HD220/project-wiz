# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-001
title: Create LLM Provider - MVP Implementation
description: Implement basic LLM provider creation with complete backend→frontend flow
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 2 hours
dependencies: []
tech_stack: [Electron, React, TypeScript, SQLite, Drizzle ORM, Zod]
domain_context: Agent System - LLM Provider Management
project_type: desktop
feature_level: mvp
delivers_value: User can add their own LLM API credentials to use AI agents
```

## Primary Goal

**Enable users to create and store LLM provider configurations with encrypted API keys so they can use AI agents with their own credentials**

### Success Criteria
- [ ] User can create an LLM provider with name, type, and API key
- [ ] API keys are encrypted before storage in database
- [ ] Provider data persists in SQLite database
- [ ] UI provides feedback on successful creation
- [ ] No TypeScript or linting errors

## Complete Context

### Project Architecture Context
```
project-wiz/
├── src/
│   ├── main/                    # Backend (Electron main process)
│   │   ├── agents/              # Agent bounded context (NEW)
│   │   │   └── llm-providers/   # LLM provider subdomain
│   │   ├── database/            # Database connection and setup
│   │   ├── types.ts             # Global types (IpcResponse)
│   │   └── main.ts              # Handler registration
│   └── renderer/                # Frontend (React)
│       ├── app/                 # TanStack Router pages
│       ├── components/          # Shared components
│       └── store/               # Zustand state management
├── drizzle.config.ts            # Drizzle ORM configuration
└── package.json                 # Scripts and dependencies
```

### Technology-Specific Context
```yaml
database:
  type: SQLite
  orm_framework: Drizzle ORM
  schema_location: src/main/**/*.schema.ts
  migration_command: npm run db:generate && npm run db:migrate

backend:
  framework: Electron (main process)
  language: TypeScript
  api_pattern: IPC handlers
  auth_method: Local session

frontend:
  framework: React 19
  state_management: Zustand
  routing: TanStack Router
  styling: Tailwind CSS + Shadcn/ui

testing:
  unit_framework: Vitest
  test_command: npm test

build_tools:
  package_manager: npm
  bundler: Vite
  linter: ESLint
  formatter: Prettier
```

### Existing Code Patterns
```typescript
// Pattern 1: Drizzle Schema Definition with Type Inference
// Example from users.schema.ts - define custom types and use inference
export type Theme = "dark" | "light" | "system";

export const usersTable = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  theme: text("theme").$type<Theme>().notNull().default("system"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// Use type inference - don't recreate types manually
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;

// Pattern 2: Service Layer with Static Methods
// Example from auth.service.ts - services return data directly
export class AuthService {
  static async create(input: InsertUser): Promise<SelectUser> {
    const db = getDatabase();
    
    const [user] = await db
      .insert(usersTable)
      .values(input)
      .returning();
      
    if (!user) {
      throw new Error("Failed to create user");
    }
    
    return user; // Return data directly, handler wraps in IpcResponse
  }
}

// Pattern 3: IPC Handler Pattern
// Example from auth.handlers.ts - handlers do try/catch
export function setupAuthHandlers(): void {
  ipcMain.handle(
    "auth:login",
    async (_, credentials: LoginCredentials): Promise<IpcResponse> => {
      try {
        const result = await AuthService.login(credentials);
        return { success: true, data: result };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Login failed",
        };
      }
    },
  );
}
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: kebab-case (e.g., llm-providers.schema.ts)
  variables: camelCase
  constants: SCREAMING_SNAKE_CASE
  classes: PascalCase
  functions: camelCase
  database_columns: snake_case

import_organization:
  - Node.js built-ins first
  - External libraries
  - Internal imports using @/ aliases
  - Relative imports last (but avoid - use aliases)

code_organization:
  - Single responsibility per file
  - Co-locate related files by bounded context
  - Services are static classes
  - Handlers wrap service calls with error handling

error_handling:
  pattern: Services throw errors, handlers catch and wrap in IpcResponse
  logging: Using custom logger from @/main/utils/logger
```

### Validation Commands
```bash
npm run type-check       # TypeScript type checking
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting
npm run quality:check    # All checks combined
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate       # Apply migrations
npm test                 # Run Vitest tests
```

## Implementation Steps

### Phase 1: Database Schema Creation
```
CREATE src/main/agents/llm-providers/llm-providers.schema.ts:
  - FOLLOW_PATTERN: src/main/user/users.schema.ts
  - DESIGN_SCHEMA:
    • Define ProviderType as union type: "openai" | "deepseek" | "anthropic"
    • Create llmProvidersTable with fields:
      - id: text with UUID default
      - userId: text with foreign key to users
      - name: text (user-defined name)
      - type: text with ProviderType
      - apiKey: text (will store encrypted)
      - baseUrl: text nullable (for custom endpoints)
      - isDefault: boolean (integer mode)
      - isActive: boolean (integer mode)
      - timestamps: createdAt, updatedAt
    • Export type inferences: SelectLlmProvider, InsertLlmProvider
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check imports and type definitions

UPDATE src/main/database/index.ts:
  - IMPORT: llmProvidersTable from new schema file
  - PURPOSE: Enable migration auto-detection
  
GENERATE_MIGRATION:
  - RUN: npm run db:generate
  - REVIEW: Check generated SQL in migrations folder
  - APPLY: npm run db:migrate
```

### Phase 2: Service Layer Implementation
```
CREATE src/main/agents/llm-providers/llm-provider.service.ts:
  - FOLLOW_PATTERN: src/main/user/authentication/auth.service.ts
  - IMPLEMENT_SERVICE:
    • Import crypto from Node.js for encryption
    • Import getDatabase from @/main/database/connection
    • Create LlmProviderService class with static methods:
      
      - encryptApiKey(apiKey: string): string
        * Use crypto.createCipheriv with AES-256-GCM
        * Generate IV for each encryption
        * Return base64 encoded encrypted data
      
      - decryptApiKey(encrypted: string): string
        * Reverse the encryption process
        * Handle decryption errors gracefully
      
      - async create(input: CreateProviderInput): Promise<SelectLlmProvider>
        * Validate input with Zod schema
        * Encrypt API key before storage
        * Insert into database with returning()
        * Return created provider (without decrypted key)
      
      - async findByUserId(userId: string): Promise<SelectLlmProvider[]>
        * Query providers for given user
        * Return array of providers (API keys remain encrypted)
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check service method signatures and imports

CREATE src/main/agents/llm-providers/llm-provider.types.ts:
  - DEFINE_TYPES:
    • Import schema types
    • Create CreateProviderInput type:
      * Omit<InsertLlmProvider, "id" | "createdAt" | "updatedAt">
      * Ensure apiKey is plain text in input (will be encrypted)
    • Create validation schema with Zod
```

### Phase 3: IPC Handler Integration
```
CREATE src/main/agents/llm-providers/llm-provider.handlers.ts:
  - FOLLOW_PATTERN: src/main/user/authentication/auth.handlers.ts
  - IMPLEMENT_HANDLERS:
    • Import ipcMain from electron
    • Import LlmProviderService
    • Import IpcResponse type from @/main/types
    
    • Create setupLlmProviderHandlers() function:
      - "llm-providers:create" handler:
        * Accept CreateProviderInput parameter
        * Try/catch wrapping service call
        * Return IpcResponse with success/error
      
      - "llm-providers:list" handler:
        * Accept userId parameter
        * Call service findByUserId
        * Return array of providers in IpcResponse
  
  - VALIDATE: npm run lint
  - IF_FAIL: Fix any linting issues

UPDATE src/main/main.ts:
  - FIND: Handler registration section
  - ADD: Import and call setupLlmProviderHandlers()
  - PLACEMENT: After existing handler setups
  - VALIDATE: npm run type-check
```

### Phase 4: Frontend Implementation
```
UPDATE src/renderer/preload.ts:
  - FIND: contextBridge.exposeInMainWorld section
  - ADD: llmProviders object with methods:
    • create: (input) => ipcRenderer.invoke("llm-providers:create", input)
    • list: (userId) => ipcRenderer.invoke("llm-providers:list", userId)
  - FOLLOW: Existing API exposure pattern

UPDATE src/renderer/window.d.ts:
  - ADD: Type definitions for window.api.llmProviders
  - INCLUDE: Method signatures matching preload.ts
  - ENSURE: Types align with backend expectations

CREATE src/renderer/store/llm-provider-store.ts:
  - FOLLOW_PATTERN: src/renderer/store/auth-store.ts (if exists)
  - IMPLEMENT_STORE:
    • Use Zustand with TypeScript
    • Define state interface:
      - providers: SelectLlmProvider[]
      - isLoading: boolean
      - error: string | null
    
    • Implement actions:
      - createProvider: async (input) => 
        * Set loading state
        * Call window.api.llmProviders.create
        * Update providers list on success
        * Handle errors with user-friendly messages
      
      - loadProviders: async (userId) =>
        * Fetch user's providers
        * Update state with results

CREATE src/renderer/components/llm-provider-form.tsx:
  - USE: Shadcn/ui components (Form, Input, Select, Button)
  - IMPLEMENT_FORM:
    • Provider name input (text)
    • Provider type select (OpenAI, DeepSeek, Anthropic)
    • API key input (password type)
    • Optional base URL input
    • Submit button with loading state
    
    • Form validation with react-hook-form + Zod
    • Error display using Alert component
    • Success feedback with toast or alert
    
    • On submit:
      - Call store.createProvider
      - Show success message
      - Reset form
      - Handle errors gracefully

CREATE src/renderer/app/settings/llm-providers.tsx:
  - IMPLEMENT_PAGE:
    • Use TanStack Router page exports
    • Display LlmProviderForm component
    • Show list of existing providers (without API keys)
    • Basic layout with title and description
```

### Phase 5: Validation & Testing
```
MANUAL_TESTING:
  - START: npm run dev
  - NAVIGATE: To LLM providers settings page
  - TEST: Create provider with valid data
    • Enter "My OpenAI" as name
    • Select "OpenAI" as type
    • Enter test API key
    • Submit form
  - VERIFY: Success message appears
  - CHECK: Database contains encrypted API key
  
TYPE_CHECKING:
  - RUN: npm run type-check
  - EXPECT: No errors
  - IF_ERRORS: Fix type mismatches
  
LINTING:
  - RUN: npm run lint
  - EXPECT: No errors
  - IF_ERRORS: Apply auto-fixes

DATABASE_VERIFICATION:
  - RUN: npm run db:studio (if available)
  - CHECK: llm_providers table exists
  - VERIFY: API key is encrypted (not readable)
  - CONFIRM: Foreign key to users table works
```

## Validation Checkpoints

### Checkpoint 1: Database Schema
```
VALIDATE_SCHEMA:
  - RUN: npm run db:generate
  - EXPECT: Migration file created successfully
  - RUN: npm run db:migrate  
  - EXPECT: Migration applied without errors
  - CHECK: Table exists in database
```

### Checkpoint 2: Backend Services
```
VALIDATE_BACKEND:
  - RUN: npm run type-check
  - EXPECT: No TypeScript errors
  - TEST: Service methods with manual testing
  - VERIFY: Encryption/decryption works correctly
```

### Checkpoint 3: IPC Integration
```
VALIDATE_IPC:
  - RUN: npm run dev
  - OPEN: Electron DevTools console
  - TEST: window.api.llmProviders.create({ ... })
  - EXPECT: Successful response with created provider
```

### Checkpoint 4: Frontend Flow
```
VALIDATE_FRONTEND:
  - NAVIGATE: To provider creation form
  - FILL: All required fields
  - SUBMIT: Form
  - EXPECT: Success feedback
  - VERIFY: Provider appears in list
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example provider creation input
const exampleProviderInput = {
  userId: "current-user-id", // From auth context
  name: "My OpenAI Account",
  type: "openai" as const,
  apiKey: "sk-proj-...", // User's actual API key
  baseUrl: null, // Optional custom endpoint
  isDefault: true,
  isActive: true,
};

// Expected stored data (with encrypted key)
const expectedStoredProvider = {
  id: "generated-uuid",
  userId: "current-user-id",
  name: "My OpenAI Account", 
  type: "openai",
  apiKey: "encrypted-base64-string", // Not readable
  baseUrl: null,
  isDefault: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

### Common Scenarios
1. **First-time Setup**: User adds their first LLM provider to start using AI agents
2. **Multiple Providers**: User adds both OpenAI and DeepSeek for different use cases
3. **API Key Update**: User needs to update an expired API key (future enhancement)
4. **Provider Switching**: User marks different provider as default (future enhancement)

### Edge Cases & Error Scenarios
- **Invalid API Key Format**: Show validation error before submission
- **Duplicate Provider Names**: Allow (users might have multiple accounts)
- **Empty API Key**: Validation prevents submission
- **Network Issues**: Show clear error message if database operation fails
- **Encryption Failure**: Log error and show generic message to user

## Troubleshooting Guide

### Common Issues

#### Migration Issues
```
PROBLEM: Migration fails with foreign key error
SOLUTION: 
  - Ensure users table exists first
  - Check that userId references correct column
  - Verify migration order in _journal.json

PROBLEM: Table already exists error
SOLUTION:
  - Check migrations folder for duplicates
  - Run npm run db:migrate with --force if needed
  - Clear migrations and regenerate if necessary
```

#### Encryption Issues
```
PROBLEM: Encryption key not found
SOLUTION:
  - Create .env file with ENCRYPTION_KEY
  - Use crypto.randomBytes(32) to generate key
  - Ensure key is loaded in main process

PROBLEM: Decryption fails for existing data
SOLUTION:
  - Check if encryption method changed
  - Verify base64 encoding/decoding
  - Handle legacy unencrypted data gracefully
```

#### Frontend Issues
```
PROBLEM: window.api.llmProviders is undefined
SOLUTION:
  - Check preload.ts exports
  - Verify contextBridge configuration
  - Ensure renderer process has access

PROBLEM: Form validation not working
SOLUTION:
  - Check Zod schema matches form fields
  - Verify react-hook-form integration
  - Ensure validation errors are displayed
```

### Debug Commands
```bash
# Check if handler is registered
npm run dev
# In DevTools: window.api.llmProviders

# Verify database schema
npm run db:studio

# Test encryption manually
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Check TypeScript types
npm run type-check -- --listFiles | grep llm-provider
```

## Dependencies & Prerequisites

### Required Files/Components
- [x] Existing users table with authentication
- [x] Database connection setup
- [x] IPC handler registration system
- [x] Zustand store configuration
- [x] Shadcn/ui components installed

### Required Patterns/Conventions
- [x] Drizzle ORM schema patterns established
- [x] Service layer pattern with static methods
- [x] IPC response wrapper pattern
- [x] Frontend form patterns with Shadcn/ui

### Environment Setup
- [x] Node.js crypto module available
- [ ] ENCRYPTION_KEY in environment (optional - can use default)
- [x] SQLite database initialized
- [x] Electron IPC bridge configured

---

## Task Completion Checklist

- [ ] Database schema created with proper types and constraints
- [ ] Migration generated and applied successfully
- [ ] Service layer implements secure encryption
- [ ] IPC handlers properly registered and working
- [ ] Frontend form validates and submits data
- [ ] API keys are encrypted in database
- [ ] User receives clear feedback on success/error
- [ ] No TypeScript or linting errors
- [ ] Manual testing confirms end-to-end flow works
- [ ] Code follows all project conventions

**Final Validation**: Run `npm run quality:check` and ensure all automated checks pass.

**Delivers**: After completing this task, users can add their LLM provider credentials through a secure form, and the system stores them encrypted in the database, ready for use by AI agents.