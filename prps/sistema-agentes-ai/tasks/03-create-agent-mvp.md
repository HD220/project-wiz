# Universal Task Template - Pattern-Based Implementation Guide

> Auto-contained tasks with complete context and patterns for LLM implementation across any project/repository

## Meta Information

```yaml
id: TASK-003
title: Create Agent - MVP Implementation
description: Implement basic AI agent creation linking to user system and LLM providers
source_document: prps/sistema-agentes-ai/README.md
priority: high
estimated_effort: 3 hours
dependencies: [TASK-001, TASK-002]
tech_stack: [Electron, React, TypeScript, SQLite, Drizzle ORM, Zod]
domain_context: Agent System - Core Agent Management
project_type: desktop
feature_level: mvp
delivers_value: User can create AI agents with personality and connect them to LLM providers
```

## Primary Goal

**Enable users to create AI agents as virtual team members with distinct personalities, roles, and LLM provider configurations**

### Success Criteria
- [ ] User can create agents with name, role, and personality
- [ ] Agent links to existing LLM provider
- [ ] Agent creates corresponding user entry (type="agent")
- [ ] Agent data persists in database with proper relationships
- [ ] Form validates required fields and provider selection
- [ ] Success feedback confirms agent creation

## Complete Context

### Project Architecture Context
```
project-wiz/
├── src/
│   ├── main/                    # Backend (Electron main process)
│   │   ├── agents/              # Agent bounded context
│   │   │   ├── agents.schema.ts # NEW - Core agent schema
│   │   │   ├── agent.service.ts # NEW - Agent business logic
│   │   │   ├── agent.handlers.ts # NEW - IPC handlers
│   │   │   ├── agent.types.ts   # NEW - Domain types
│   │   │   └── llm-providers/   # From TASK-001, TASK-002
│   │   ├── user/                # Existing user system
│   │   │   └── users.schema.ts  # Already supports type="agent"
│   │   └── main.ts              # Handler registration
│   └── renderer/                # Frontend (React)
│       ├── app/                 # TanStack Router pages
│       ├── components/          # Shared components
│       └── store/               # Zustand state management
```

### Technology-Specific Context
```yaml
database:
  type: SQLite
  orm_framework: Drizzle ORM
  schema_location: src/main/**/*.schema.ts
  migration_command: npm run db:generate && npm run db:migrate
  foreign_keys: usersTable, llmProvidersTable

backend:
  framework: Electron (main process)
  language: TypeScript
  pattern: Service classes with static methods
  ipc_pattern: Handlers wrap service calls with IpcResponse

frontend:
  framework: React 19
  state_management: Zustand with persist
  form_library: react-hook-form + Zod validation
  ui_library: Shadcn/ui components
  styling: Tailwind CSS
```

### Existing Code Patterns
```typescript
// Pattern 1: User Integration for Agents
// From users.schema.ts - agents are users with type="agent"
export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email"),
  avatar: text("avatar"),
  type: text("type").$type<"human" | "agent">().notNull().default("human"),
  // ... other fields
});

// Pattern 2: Foreign Key References
// From existing schemas - proper table relationships
export const agentsTable = sqliteTable("agents", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => usersTable.id),
  providerId: text("provider_id").notNull().references(() => llmProvidersTable.id),
  // ... other fields
});

// Pattern 3: Service Layer with Transactions
// Create both user and agent entries in single transaction
export class AgentService {
  static async create(input: CreateAgentInput): Promise<SelectAgent> {
    const db = getDatabase();
    
    return await db.transaction(async (tx) => {
      // Create user entry first
      const [user] = await tx.insert(usersTable).values({
        name: input.name,
        type: "agent",
        avatar: input.avatar,
      }).returning();
      
      // Then create agent entry
      const [agent] = await tx.insert(agentsTable).values({
        userId: user.id,
        ...input,
      }).returning();
      
      return agent;
    });
  }
}
```

### Project-Specific Conventions
```yaml
naming_conventions:
  files: kebab-case (agents.schema.ts, agent.service.ts)
  database_tables: snake_case (agent_configs, user_agents)
  types: PascalCase (AgentRole, AgentStatus)
  enums: string unions ("developer" | "assistant")

database_patterns:
  - Always use UUID for primary keys
  - Include createdAt and updatedAt timestamps
  - Use foreign keys for relationships
  - Store JSON as text fields with proper typing

form_patterns:
  - react-hook-form with Zod schema validation
  - Shadcn/ui form components
  - Proper error handling and display
  - Loading states during submission
```

### Validation Commands
```bash
npm run type-check       # TypeScript validation
npm run lint             # ESLint checks
npm run db:generate      # Generate migrations
npm run db:migrate       # Apply migrations
npm run quality:check    # All quality checks
```

## Implementation Steps

### Phase 1: Database Schema Creation
```
CREATE src/main/agents/agents.schema.ts:
  - DESIGN_SCHEMA:
    • Import required Drizzle modules and dependencies
    • Import usersTable and llmProvidersTable for foreign keys
    
    • Define AgentStatus type: "active" | "inactive" | "busy"
    
    • Create agentsTable:
      - id: text, primaryKey, UUID default
      - userId: text, foreign key to usersTable.id
      - providerId: text, foreign key to llmProvidersTable.id
      - name: text, not null (duplicates user.name for convenience)
      - role: text, not null (e.g., "Frontend Developer", "Code Reviewer")
      - backstory: text, not null (personality and background)
      - goal: text, not null (current objectives)
      - systemPrompt: text, not null (LLM system instructions)
      - status: AgentStatus, default "inactive"
      - modelConfig: text, not null (JSON: temperature, max_tokens, etc.)
      - createdAt: timestamp with default
      - updatedAt: timestamp with default
    
    • Export type inferences:
      - SelectAgent = typeof agentsTable.$inferSelect
      - InsertAgent = typeof agentsTable.$inferInsert
      - UpdateAgent = Partial<InsertAgent> & { id: string }
  
  - VALIDATE: npm run type-check
  - IF_FAIL: Check imports and foreign key references

UPDATE src/main/database/index.ts:
  - ADD: Import agentsTable from agents.schema.ts
  - PURPOSE: Enable Drizzle migration auto-detection

GENERATE_MIGRATION:
  - RUN: npm run db:generate
  - REVIEW: Generated SQL for proper foreign keys
  - APPLY: npm run db:migrate
  - VERIFY: Tables created with relationships
```

### Phase 2: Domain Types and Validation
```
CREATE src/main/agents/agent.types.ts:
  - DEFINE_TYPES:
    • Import schema types and Zod
    • Import LLM provider types
    
    • Create CreateAgentInput interface:
      - name: string
      - role: string  
      - backstory: string
      - goal: string
      - providerId: string (must exist in llmProvidersTable)
      - modelConfig?: ModelConfig (optional, with defaults)
      - avatar?: string (optional avatar for user)
    
    • Create ModelConfig interface:
      - model: string (e.g., "gpt-4o-mini", "deepseek-chat")
      - temperature: number (0-2)
      - maxTokens: number
      - topP?: number (optional)
    
    • Create Zod validation schemas:
      - createAgentSchema: Validates input
      - modelConfigSchema: Validates model configuration
    
    • Create response types:
      - AgentWithProvider: SelectAgent & { provider: SelectLlmProvider }
      - AgentSummary: Pick<SelectAgent, "id" | "name" | "role" | "status">
  
  - VALIDATE: Zod schemas work with TypeScript
```

### Phase 3: Service Layer Implementation
```
CREATE src/main/agents/agent.service.ts:
  - FOLLOW_PATTERN: auth.service.ts structure
  - IMPLEMENT_SERVICE:
    • Import dependencies: getDatabase, schemas, types, crypto
    
    • Create AgentService class with static methods:
    
      - async create(input: CreateAgentInput): Promise<SelectAgent>
        * Validate input with Zod schema
        * Verify providerId exists in database
        * Generate default system prompt based on role and backstory
        * Use database transaction for atomicity:
          - Create user entry with type="agent"
          - Create agent entry with generated systemPrompt
        * Return created agent
        * Throw descriptive errors for failures
      
      - async findById(id: string): Promise<SelectAgent | null>
        * Query agent by ID
        * Return agent or null if not found
      
      - async findByUserId(userId: string): Promise<SelectAgent | null>
        * Query agent by associated user ID
        * Return agent or null
      
      - async findByOwner(ownerId: string): Promise<SelectAgent[]>
        * Query all agents created by specific user
        * Join with users table to get full info
        * Return array of agents
      
      - generateSystemPrompt(role: string, backstory: string, goal: string): string
        * Create comprehensive system prompt for LLM
        * Include role, personality, objectives
        * Follow established prompt engineering patterns
        * Example: "You are a {role}. {backstory}. Your current goal is {goal}. Always be helpful and professional."
      
      - async updateStatus(id: string, status: AgentStatus): Promise<void>
        * Update agent status (active/inactive/busy)
        * Include updatedAt timestamp
  
  - ERROR_HANDLING:
    • Provider not found: "LLM provider {id} not found"
    • Agent creation failure: "Failed to create agent"
    • Database errors: Log and rethrow with user-friendly messages
  
  - VALIDATE: npm run type-check
```

### Phase 4: IPC Handler Layer
```
CREATE src/main/agents/agent.handlers.ts:
  - FOLLOW_PATTERN: auth.handlers.ts structure
  - IMPLEMENT_HANDLERS:
    • Import ipcMain, AgentService, types, IpcResponse
    
    • Create setupAgentHandlers() function:
    
      - "agents:create" handler:
        * Accept CreateAgentInput parameter
        * Get current user ID from session/context
        * Add ownerId to input for tracking
        * Try/catch wrapping AgentService.create()
        * Return IpcResponse with success/error
        * Example:
          ```typescript
          ipcMain.handle("agents:create", async (_, input: CreateAgentInput): Promise<IpcResponse> => {
            try {
              const agent = await AgentService.create(input);
              return { success: true, data: agent };
            } catch (error) {
              return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to create agent",
              };
            }
          });
          ```
      
      - "agents:list" handler:
        * Accept optional ownerId parameter
        * Call AgentService.findByOwner()
        * Return array of agents
      
      - "agents:get" handler:
        * Accept agent ID parameter
        * Call AgentService.findById()
        * Return agent or error if not found
  
  - VALIDATE: Handler registration pattern
  - ENSURE: Proper error messages for all scenarios

UPDATE src/main/main.ts:
  - FIND: Handler registration section
  - ADD: Import and call setupAgentHandlers()
  - PLACE: After LLM provider handlers
  - VALIDATE: npm run type-check
```

### Phase 5: Frontend Store Implementation
```
CREATE src/renderer/store/agent-store.ts:
  - FOLLOW_PATTERN: llm-provider-store.ts structure
  - IMPLEMENT_STORE:
    • Import Zustand, persist, and types
    
    • Define AgentState interface:
      - agents: SelectAgent[]
      - currentAgent: SelectAgent | null
      - isLoading: boolean
      - error: string | null
      - isCreating: boolean
    
    • Implement store actions:
      - createAgent: async (input: CreateAgentInput) => {
          set({ isCreating: true, error: null });
          try {
            const result = await window.api.agents.create(input);
            if (result.success) {
              // Add to local state or refresh list
              set((state) => ({
                agents: [...state.agents, result.data],
                isCreating: false,
              }));
              return result.data;
            } else {
              throw new Error(result.error);
            }
          } catch (error) {
            set({ error: error.message, isCreating: false });
            throw error;
          }
        }
      
      - loadAgents: async () => {
          set({ isLoading: true, error: null });
          try {
            const result = await window.api.agents.list();
            set({ agents: result.data, isLoading: false });
          } catch (error) {
            set({ error: error.message, isLoading: false });
          }
        }
      
      - selectAgent: (agent: SelectAgent) => {
          set({ currentAgent: agent });
        }
      
      - clearError: () => set({ error: null })
    
    • Configure persistence for agents list
```

### Phase 6: Frontend Form Implementation
```
UPDATE src/renderer/preload.ts:
  - ADD: Agent API exposure
    • agents object with methods:
      - create: (input) => ipcRenderer.invoke("agents:create", input)
      - list: () => ipcRenderer.invoke("agents:list")
      - get: (id) => ipcRenderer.invoke("agents:get", id)

UPDATE src/renderer/window.d.ts:
  - ADD: Type definitions for window.api.agents
  - ENSURE: Types match backend expectations

CREATE src/renderer/components/agent-form.tsx:
  - IMPLEMENT: Agent creation form
    • Import react-hook-form, Zod resolver, Shadcn/ui components
    • Import agent store and LLM provider store
    
    • Form fields:
      - name: Text input, required
      - role: Text input with suggestions (Frontend Developer, etc.)
      - backstory: Textarea for personality description
      - goal: Textarea for current objectives
      - providerId: Select from available LLM providers
      - modelConfig: Advanced section (temperature, maxTokens)
      - avatar: Optional file upload or URL input
    
    • Form validation:
      - Use Zod schema from agent.types.ts
      - Validate provider selection
      - Ensure required fields are filled
      - Validate model configuration values
    
    • Form submission:
      - Call store.createAgent with form data
      - Show loading state during creation
      - Display success message
      - Reset form on success
      - Handle and display errors
    
    • Example structure:
      ```tsx
      export function AgentForm() {
        const { createAgent, isCreating, error } = useAgentStore();
        const { providers } = useLlmProviderStore();
        
        const form = useForm<CreateAgentInput>({
          resolver: zodResolver(createAgentSchema),
          defaultValues: {
            name: "",
            role: "",
            backstory: "",
            goal: "",
            providerId: "",
            modelConfig: {
              temperature: 0.7,
              maxTokens: 2000,
            },
          },
        });
        
        const onSubmit = async (data: CreateAgentInput) => {
          try {
            await createAgent(data);
            form.reset();
            // Show success toast
          } catch (error) {
            // Error handled by store
          }
        };
        
        return (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {/* Form fields */}
            </form>
          </Form>
        );
      }
      ```

CREATE src/renderer/app/agents/new.tsx:
  - IMPLEMENT: Agent creation page
    • Page layout with title and description
    • AgentForm component
    • Navigation breadcrumbs
    • Link back to agents list
```

## Validation Checkpoints

### Checkpoint 1: Database Layer
```
VALIDATE_DATABASE:
  - RUN: npm run db:migrate
  - EXPECT: agents table created with foreign keys
  - TEST: Insert test agent manually
  - VERIFY: User entry created automatically
```

### Checkpoint 2: Service Layer
```
VALIDATE_SERVICE:
  - TEST: AgentService.create with valid input
  - VERIFY: Both user and agent records created
  - CHECK: System prompt generation works
  - TEST: Error handling for invalid provider
```

### Checkpoint 3: IPC Integration
```
VALIDATE_IPC:
  - START: npm run dev
  - TEST: window.api.agents.create in DevTools
  - VERIFY: Handler returns proper IpcResponse
  - CHECK: Error cases return error messages
```

### Checkpoint 4: Frontend Flow
```
VALIDATE_FRONTEND:
  - NAVIGATE: To agent creation form
  - FILL: All required fields
  - SELECT: LLM provider from dropdown
  - SUBMIT: Form
  - VERIFY: Success message and agent created
```

## Use Cases & Examples

### Example Data/Input
```typescript
// Example agent creation input
const exampleAgentInput: CreateAgentInput = {
  name: "Alex Frontend",
  role: "Frontend Developer",
  backstory: "Experienced React developer with expertise in TypeScript, modern CSS, and user experience design. Passionate about clean, maintainable code and pixel-perfect implementations.",
  goal: "Help build beautiful, accessible user interfaces and improve frontend development workflows",
  providerId: "provider-uuid-from-list", // Selected LLM provider
  modelConfig: {
    model: "gpt-4o-mini",
    temperature: 0.7,
    maxTokens: 2000,
  },
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
};

// Generated system prompt example
const generatedSystemPrompt = `You are a Frontend Developer. Experienced React developer with expertise in TypeScript, modern CSS, and user experience design. Passionate about clean, maintainable code and pixel-perfect implementations. Your current goal is Help build beautiful, accessible user interfaces and improve frontend development workflows. Always be helpful, professional, and focus on best practices in frontend development.`;
```

### Common Scenarios
1. **Developer Agent**: User creates a coding assistant specialized in their tech stack
2. **Code Reviewer**: Agent focused on code quality and best practices
3. **Project Manager**: Agent that helps with task organization and project planning
4. **Design Assistant**: Agent specialized in UI/UX feedback and suggestions

### Edge Cases & Error Scenarios
- **Invalid Provider**: Provider ID doesn't exist or is inactive
- **Duplicate Names**: Allow multiple agents with same name (add UUID to distinguish)
- **Empty Fields**: Form validation prevents submission
- **Long Backstory**: Validate reasonable length limits
- **Model Config**: Validate temperature (0-2) and maxTokens (positive integer)

## Troubleshooting Guide

### Common Issues

#### Database Foreign Key Errors
```
PROBLEM: Foreign key constraint fails on agent creation
SOLUTION:
  - Verify providerId exists in llm_providers table
  - Check user creation happens first in transaction
  - Ensure foreign key references are correct

PROBLEM: Migration fails with constraint errors  
SOLUTION:
  - Drop and recreate database in development
  - Check existing data conflicts with new constraints
  - Review migration file for syntax errors
```

#### Service Layer Issues
```
PROBLEM: Agent creation fails silently
SOLUTION:
  - Check transaction rollback on errors
  - Verify both user and agent inserts succeed
  - Add logging to identify failure point
  - Test with minimal valid input

PROBLEM: System prompt generation fails
SOLUTION:
  - Check string concatenation and escaping
  - Verify all required fields are provided
  - Test prompt generation function isolation
```

#### Frontend Integration Issues
```
PROBLEM: Provider dropdown is empty
SOLUTION:
  - Verify LLM provider store loads data
  - Check provider list API returns data
  - Ensure form component subscribes to store
  - Load providers on component mount

PROBLEM: Form validation not working
SOLUTION:
  - Check Zod schema matches form fields
  - Verify react-hook-form integration
  - Test validation schema independently
  - Check error display components
```

### Debug Commands
```bash
# Test database constraints
npm run db:studio
# Manual insert test

# Test service methods
npm run dev
# Console: AgentService.create(testInput)

# Check form validation
# Console: createAgentSchema.parse(formData)

# Verify store state
# Console: useAgentStore.getState()
```

## Dependencies & Prerequisites

### Required Files/Components
- [x] LLM providers system (TASK-001, TASK-002)
- [x] Existing users table with type field
- [x] Database connection and migration system
- [x] IPC handler registration pattern
- [x] Shadcn/ui form components
- [x] react-hook-form + Zod validation setup

### Required Patterns/Conventions
- [x] Service layer with static methods
- [x] IPC response wrapper pattern
- [x] Database transaction patterns
- [x] Form validation with Zod
- [x] Zustand store patterns

### Environment Setup
- [x] Development database ready
- [x] At least one LLM provider configured
- [x] Frontend development server
- [x] Authentication context for user ID

---

## Task Completion Checklist

- [ ] Database schema created with proper relationships
- [ ] Agent service implements creation with user integration
- [ ] IPC handlers registered and working
- [ ] Frontend form validates and submits data
- [ ] Agent links to selected LLM provider
- [ ] System prompt generates from agent data
- [ ] Success/error feedback works properly
- [ ] All TypeScript types are correct
- [ ] No linting or compilation errors
- [ ] Manual testing confirms end-to-end flow

**Final Validation**: Run `npm run quality:check` and ensure all automated checks pass.

**Delivers**: After completing this task, users can create AI agents with distinct personalities and roles, properly linked to their LLM providers and ready for future chat and task execution features.