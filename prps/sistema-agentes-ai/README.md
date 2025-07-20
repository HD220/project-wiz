# Sistema de Agentes de IA Humanizados - PRP

## Goal

Implementar o sistema central de agentes humanizados do Project Wiz, criando "pessoas virtuais" autônomas que colaboram no desenvolvimento de software através de conversas naturais, auto-gestão de tarefas e interação orgânica com usuários e outros agentes.

## Why

- **Core Value Proposition**: O sistema de agentes é o diferencial principal do Project Wiz, transformando-o de um simples chat em uma "fábrica autônoma de software"
- **Business Impact**: Permite colaboração humano-AI natural onde agentes funcionam como colegas virtuais especializados
- **User Experience**: Usuários trabalham com assistentes que gerenciam proativamente recursos e contratam especialistas conforme necessário
- **Platform Evolution**: Estabelece a fundação para uma plataforma de desenvolvimento colaborativo escalável

## What

### Core Functionality

- **Agentes como Pessoas Virtuais**: Entidades com identidade, personalidade, backstory e objetivos próprios
- **Sistema de Contratação Inteligente**: Assistente pessoal analisa necessidades e contrata especialistas
- **Auto-gestão de Tarefas**: Agentes criam e gerenciam suas próprias filas de trabalho
- **Colaboração Natural**: Conversas em DMs e canais como qualquer membro da equipe
- **Memória Persistente**: Contexto de longo prazo e aprendizado contínuo

### Success Criteria

- [ ] Assistente pessoal analisa projetos e sugere contratação de agentes especializados
- [ ] Sistema gera 3 candidatos com personas únicas para seleção
- [ ] Agentes conversam naturalmente e criam suas próprias tarefas
- [ ] Processamento em background 24/7 das filas de tarefas
- [ ] Sistema de memória mantém contexto de conversas de longa duração
- [ ] Roteamento inteligente direciona mensagens para agentes apropriados
- [ ] Agentes colaboram entre si para resolver problemas complexos

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Core AI SDK Documentation
- url: https://sdk.vercel.ai/docs/ai-sdk-core/generating-text
  why: Primary library for LLM integration, generateText for Electron main process
  critical: Use generateText instead of streamText in Electron to avoid IPC complexity

- url: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
  why: Agent tool calling capabilities for performing actions
  critical: Tool system is core to agent autonomy

- file: prps/00-miscellaneous/ai-docs/vercel-ai-sdk-guide.md
  why: Project-specific AI SDK patterns and Electron integration
  critical: Non-streaming patterns for main process, tool calling examples

- file: prps/00-miscellaneous/ai-docs/queue-patterns-implementation.md
  why: Task queue implementations for agent background processing
  critical: Priority queues, persistent queues, worker patterns

- file: prps/00-miscellaneous/ai-docs/electron-worker-threads-guide.md
  why: Background processing patterns for 24/7 agent operation
  critical: Worker pool patterns, nodeIntegrationInWorker configuration

# MUST READ - Existing Codebase Patterns
- file: src/main/user/authentication/auth.service.ts
  why: Service layer patterns, database operations, error handling
  critical: Follow established service patterns and IPC handler structure

- file: src/main/conversations/conversation.service.ts
  why: Conversation management patterns that agents will extend
  critical: Participant management, database query patterns

- file: src/main/conversations/messages.schema.ts
  why: Existing message schema with LLM support
  critical: llmMessagesTable with role, toolCalls, metadata fields already exists

- file: src/main/user/users.schema.ts
  why: User table already has type field with "human" | "agent" support
  critical: Agent users can reuse existing user infrastructure

- docfile: CLAUDE.md
  why: Project conventions, database patterns, service layer requirements
  critical: Path aliases, Drizzle patterns, IPC communication rules
```

### Current Codebase Tree

```bash
src/main/
├── conversations/          # Existing conversation system
│   ├── conversation.service.ts
│   ├── conversations.schema.ts
│   ├── message.service.ts
│   └── messages.schema.ts
├── user/                   # Existing user system
│   ├── authentication/
│   │   ├── auth.service.ts
│   │   └── accounts.schema.ts
│   ├── profile/
│   │   └── user-preferences.schema.ts
│   └── users.schema.ts     # Already has type: "human" | "agent"
├── project/                # Existing project system
│   ├── project.service.ts
│   └── projects.schema.ts
├── database/
│   ├── connection.ts
│   └── migrations/
└── main.ts                 # Handler registration
```

### Desired Codebase Tree

```bash
src/main/
├── agents/                 # NEW - Agent system
│   ├── agents.schema.ts    # Agent data models
│   ├── agent.service.ts    # Agent lifecycle management
│   ├── agent.handlers.ts   # IPC handlers
│   ├── agent-worker.ts     # Background processing
│   ├── agent-tools.ts      # Tool definitions
│   ├── memory.schema.ts    # Agent memory system
│   ├── memory.service.ts   # Memory management
│   ├── tasks.schema.ts     # Task queue system
│   ├── task-queue.service.ts # Task processing
│   └── hiring.service.ts   # Agent hiring system
├── llm/                    # NEW - LLM Provider system
│   ├── providers.schema.ts # User LLM credentials
│   ├── provider.service.ts # Provider management
│   └── provider.handlers.ts # IPC handlers
```

### Known Gotchas & Library Quirks

```typescript
// CRITICAL: AI SDK in Electron main process
// Use generateText, NOT streamText - streaming across IPC is complex
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// CRITICAL: Users table already supports agents
// usersTable.type: "human" | "agent" - reuse existing infrastructure

// CRITICAL: Worker threads in Electron
// Must set nodeIntegrationInWorker: true in BrowserWindow config
// Workers cannot access Electron APIs, only Node.js APIs

// CRITICAL: Database patterns
// Always use db.select().from().where() pattern, not db.query
// Use type inference: typeof table.$inferSelect, don't recreate types

// CRITICAL: Tool calls JSON storage
// llmMessagesTable.toolCalls already exists as text field for JSON

// CRITICAL: LLM Provider Credentials
// Users configure their own API keys via UI, stored encrypted in database
// Never use environment variables for user credentials
// Retrieve credentials from database when creating agent models

// CRITICAL: IPC Response pattern
// Services return data directly, handlers wrap in { success, data, error }
export interface IpcResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// llm/providers.schema.ts - User LLM provider credentials
export type ProviderType = "openai" | "deepseek" | "anthropic" | "mistral";

export const llmProvidersTable = sqliteTable("llm_providers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  name: text("name").notNull(), // User-defined name
  type: text("type").$type<ProviderType>().notNull(),
  apiKey: text("api_key").notNull(), // Encrypted API key
  baseUrl: text("base_url"), // For custom endpoints
  isDefault: integer("is_default", { mode: "boolean" })
    .notNull()
    .default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// agents.schema.ts - Core agent data
export type AgentStatus = "available" | "busy" | "absent" | "offline";

export const agentsTable = sqliteTable("agents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id), // Links to users table
  name: text("name").notNull(), // Human-readable name
  role: text("role").notNull(), // "Personal Assistant", "Frontend Developer", etc.
  backstory: text("backstory").notNull(), // Rich background story
  goal: text("goal").notNull(), // Current goal
  status: text("status").$type<AgentStatus>().notNull().default("available"),
  modelConfig: text("model_config").notNull(), // JSON: model, temperature, etc.
  providerId: text("provider_id")
    .notNull()
    .references(() => llmProvidersTable.id), // LLM provider to use
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// memory.schema.ts - Agent memory system
export const agentMemoriesTable = sqliteTable("agent_memories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id")
    .notNull()
    .references(() => agentsTable.id),
  type: text("type")
    .$type<"conversation" | "learning" | "goal" | "context">()
    .notNull(),
  content: text("content").notNull(),
  importance: integer("importance").notNull().default(1), // 1-10 scale
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

// tasks.schema.ts - Agent task queue
export type TaskStatus = "pending" | "processing" | "completed" | "failed";
export type TaskPriority = 1 | 2 | 3 | 4 | 5; // 5 = highest

export const agentTasksTable = sqliteTable("agent_tasks", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id")
    .notNull()
    .references(() => agentsTable.id),
  data: text("data").notNull(), // JSON task payload
  priority: integer("priority").$type<TaskPriority>().notNull().default(1),
  status: text("status").$type<TaskStatus>().notNull().default("pending"),
  scheduledFor: integer("scheduled_for", { mode: "timestamp" }), // For delayed tasks
  result: text("result"), // JSON result after completion
  error: text("error"), // Error message if failed
  retries: integer("retries").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  startedAt: integer("started_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
```

### List of Tasks to Complete

```yaml
Task 1: "Create LLM Provider Database Schema"
CREATE src/main/llm/providers.schema.ts:
  - CREATE llmProvidersTable with encrypted API key storage
  - FOLLOW existing schema patterns from users.schema.ts
  - USE Drizzle type inference patterns
  - REFERENCE usersTable for foreign keys

Task 2: "Create Agent Database Schema"
CREATE src/main/agents/agents.schema.ts:
  - CREATE agentsTable, agentMemoriesTable, agentTasksTable
  - FOLLOW existing schema patterns from users.schema.ts and conversations.schema.ts
  - USE Drizzle type inference patterns
  - REFERENCE usersTable and llmProvidersTable for foreign keys

Task 3: "Generate Database Migration"
RUN npm run db:generate:
  - ENSURE providers.schema.ts and agents.schema.ts are imported in database/index.ts
  - REVIEW generated migration SQL for correctness
  - APPLY migration with npm run db:migrate

Task 4: "Create LLM Provider Service Layer"
CREATE src/main/llm/provider.service.ts:
  - IMPLEMENT ProviderService.create(), findByUserId(), encrypt/decrypt methods
  - USE crypto.encrypt for API key encryption
  - FOLLOW patterns from auth.service.ts
  - INCLUDE provider validation and testing

Task 5: "Create Agent Service Layer"
CREATE src/main/agents/agent.service.ts:
  - MIRROR patterns from auth.service.ts and conversation.service.ts
  - IMPLEMENT AgentService.create(), findById(), updateStatus(), etc.
  - FOLLOW error handling patterns from existing services
  - USE getDatabase() pattern from connection.ts

Task 4: "Create Memory Management System"
CREATE src/main/agents/memory.service.ts:
  - IMPLEMENT MemoryService.store(), retrieve(), search()
  - USE vector-like search by importance and recency
  - FOLLOW database query patterns from existing services

Task 5: "Create Task Queue System"
CREATE src/main/agents/task-queue.service.ts:
  - IMPLEMENT TaskQueueService.enqueue(), dequeue(), process()
  - USE priority queue patterns from ai-docs/queue-patterns-implementation.md
  - INTEGRATE with persistent database storage
  - FOLLOW rate limiting patterns for API calls

Task 6: "Create Agent Worker Process"
CREATE src/main/agents/agent-worker.ts:
  - IMPLEMENT AgentWorker class with processTask() method
  - USE AI SDK generateText for LLM interactions
  - INTEGRATE tool calling capabilities
  - FOLLOW worker thread patterns from ai-docs/electron-worker-threads-guide.md

Task 7: "Create Agent Tools System"
CREATE src/main/agents/agent-tools.ts:
  - DEFINE tool schemas using Zod validation
  - IMPLEMENT tools: sendMessage, createTask, analyzeProject, manageFiles
  - USE existing service layers (ConversationService, ProjectService)
  - FOLLOW AI SDK tool calling patterns

Task 8: "Create Hiring/Recruitment System"
CREATE src/main/agents/hiring.service.ts:
  - IMPLEMENT HiringService.generateCandidates(), selectAgent()
  - USE LLM to generate diverse agent personas
  - INTEGRATE with AgentService for agent creation
  - FOLLOW business logic patterns from existing services

Task 9: "Create IPC Handlers"
CREATE src/main/agents/agent.handlers.ts:
  - IMPLEMENT handlers for agent:create, agent:list, agent:chat, etc.
  - USE IpcResponse pattern from existing handlers
  - REGISTER handlers in main.ts setupAgentHandlers()
  - FOLLOW error handling patterns from auth.handlers.ts

Task 10: "Create Background Processing System"
MODIFY src/main/main.ts:
  - ADD AgentWorkerPool initialization
  - SETUP 24/7 background task processing
  - IMPLEMENT graceful shutdown for workers
  - USE worker pool patterns from ai-docs documentation

Task 11: "Integrate with Existing Systems"
MODIFY existing services:
  - UPDATE ConversationService to support agent participants
  - UPDATE MessageService to handle agent-authored messages
  - ENSURE agent users work with existing authentication flow
  - MAINTAIN backward compatibility

Task 12: "Create Personal Assistant Agent"
IMPLEMENT default personal assistant:
  - CREATE standard assistant agent on user registration
  - IMPLEMENT project analysis and agent hiring suggestions
  - SETUP proactive monitoring and recommendations
  - USE established agent patterns from previous tasks
```

### Per Task Pseudocode

```typescript
// Task 1: providers.schema.ts
export const llmProvidersTable = sqliteTable("llm_providers", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  name: text("name").notNull(),
  type: text("type").$type<ProviderType>().notNull(),
  apiKey: text("api_key").notNull(), // Encrypted
  // ... more fields as specified above
});

export type SelectLlmProvider = typeof llmProvidersTable.$inferSelect;
export type InsertLlmProvider = typeof llmProvidersTable.$inferInsert;

// Task 2: agents.schema.ts
export const agentsTable = sqliteTable("agents", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  name: text("name").notNull(),
  role: text("role").notNull(),
  backstory: text("backstory").notNull(),
  // ... more fields as specified above
});

export type SelectAgent = typeof agentsTable.$inferSelect;
export type InsertAgent = typeof agentsTable.$inferInsert;
export type UpdateAgent = Partial<InsertAgent> & { id: string };

// Task 4: provider.service.ts
export class ProviderService {
  static async create(input: CreateProviderInput): Promise<SelectLlmProvider> {
    const db = getDatabase();

    // PATTERN: Encrypt API key before storage
    const encryptedApiKey = await this.encryptApiKey(input.apiKey);

    const [provider] = await db
      .insert(llmProvidersTable)
      .values({
        ...input,
        apiKey: encryptedApiKey,
      })
      .returning();

    return provider;
  }

  static async getDecryptedProvider(
    providerId: string,
  ): Promise<DecryptedProvider> {
    const db = getDatabase();
    const [provider] = await db
      .select()
      .from(llmProvidersTable)
      .where(eq(llmProvidersTable.id, providerId))
      .limit(1);

    if (!provider) throw new Error("Provider not found");

    // PATTERN: Decrypt API key for use
    const decryptedApiKey = await this.decryptApiKey(provider.apiKey);
    return { ...provider, apiKey: decryptedApiKey };
  }
}

// Task 5: agent.service.ts
export class AgentService {
  static async create(input: CreateAgentInput): Promise<SelectAgent> {
    const db = getDatabase();

    // PATTERN: First create user entry (agents are users with type="agent")
    const [user] = await db
      .insert(usersTable)
      .values({
        name: input.name,
        avatar: input.avatar,
        type: "agent",
      })
      .returning();

    // PATTERN: Then create agent-specific data
    const [agent] = await db
      .insert(agentsTable)
      .values({
        userId: user.id,
        ...input,
      })
      .returning();

    return agent; // Return data directly, handler will wrap in IpcResponse
  }

  static async findByUserId(userId: string): Promise<SelectAgent | null> {
    const db = getDatabase();

    const [agent] = await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.userId, userId))
      .limit(1);

    return agent || null;
  }
}

// Task 6: agent-worker.ts
export class AgentWorker {
  private model: any;
  private tools: Record<string, Tool>;

  constructor(
    private agent: SelectAgent,
    private provider: DecryptedProvider,
  ) {
    // PATTERN: Use AI SDK with user's provider credentials
    this.model = this.createModelFromProvider(provider);
    this.tools = createAgentTools(agent.id);
  }

  private createModelFromProvider(provider: DecryptedProvider) {
    switch (provider.type) {
      case "openai":
        return openai(provider.model || "gpt-4o-mini", {
          apiKey: provider.apiKey,
          baseURL: provider.baseUrl,
        });
      case "deepseek":
        return deepseek(provider.model || "deepseek-chat", {
          apiKey: provider.apiKey,
          baseURL: provider.baseUrl,
        });
      default:
        throw new Error(`Unsupported provider: ${provider.type}`);
    }
  }

  async processTask(task: SelectAgentTask): Promise<any> {
    // PATTERN: Get agent context and memories
    const memories = await MemoryService.getRecentMemories(this.agent.id);
    const context = this.buildContext(memories, task);

    // PATTERN: Use generateText with tools
    const { text, toolCalls } = await generateText({
      model: this.model,
      system: this.agent.systemPrompt,
      prompt: this.buildPrompt(context, task),
      tools: this.tools,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // PATTERN: Store result and update memory
    await MemoryService.store(this.agent.id, "conversation", text);
    return { response: text, toolCalls };
  }
}

// Task 9: agent.handlers.ts
export function setupAgentHandlers(): void {
  ipcMain.handle(
    "agent:create",
    async (_, input: CreateAgentInput): Promise<IpcResponse> => {
      try {
        const agent = await AgentService.create(input);
        return { success: true, data: agent };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Failed to create agent",
        };
      }
    },
  );

  // PATTERN: Follow same structure for all handlers
  ipcMain.handle("agent:chat", async (_, agentId: string, message: string) => {
    // Implementation follows same try/catch pattern
  });
}
```

### Integration Points

```yaml
DATABASE:
  - migration: "Add llm_providers, agents, agent_memories, agent_tasks tables with proper indexes"
  - pattern: "Import providers.schema.ts and agents.schema.ts in database/index.ts for migration detection"
  - connection: "@/main/database/connection getDatabase() pattern"

EXISTING_SCHEMAS:
  - users: "usersTable.type already supports 'agent', reuse user infrastructure"
  - conversations: "conversationParticipantsTable supports agent participants"
  - messages: "llmMessagesTable already has toolCalls and metadata fields"

ENCRYPTION:
  - pattern: "Use Node.js built-in crypto for API key encryption"
  - storage: "Store encrypted API keys in llm_providers table"
  - security: "Never log or expose decrypted API keys"

MAIN_PROCESS:
  - register: "setupAgentHandlers() in main.ts"
  - workers: "Initialize AgentWorkerPool after database connection"
  - shutdown: "Graceful worker shutdown in app 'before-quit' event"

AI_SDK:
  - pattern: "Use generateText in main process, never streamText"
  - tools: "Define tools with Zod schemas and execute functions"
  - errors: "Handle AI_APICallError for rate limits and auth failures"
```

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                    # ESLint checks
npm run type-check              # TypeScript type checking
npm run format                  # Prettier formatting

# Expected: No errors. Common agent-specific issues:
# - Missing imports for AI SDK types
# - Zod schema validation errors in tool definitions
# - Worker thread type errors (use proper TypeScript node types)
```

### Level 2: Unit Tests

```typescript
// CREATE src/main/agents/__tests__/agent.service.test.ts
import { AgentService } from "../agent.service";
import { getDatabase } from "@/main/database/connection";

describe("AgentService", () => {
  beforeEach(async () => {
    // Setup test database
    const db = getDatabase();
    await db.delete(agentsTable);
    await db.delete(usersTable);
  });

  test("creates agent with user entry", async () => {
    // First create a provider
    const providerInput: CreateProviderInput = {
      userId: "test-user-id",
      name: "My OpenAI",
      type: "openai",
      apiKey: "test-api-key",
      isDefault: true,
    };
    const provider = await ProviderService.create(providerInput);

    const input: CreateAgentInput = {
      name: "Test Agent",
      role: "Developer",
      backstory: "A helpful coding assistant",
      goal: "Write clean code",
      modelConfig: JSON.stringify({ model: "gpt-4o-mini", temperature: 0.7 }),
      providerId: provider.id,
    };

    const agent = await AgentService.create(input);

    expect(agent.name).toBe("Test Agent");
    expect(agent.userId).toBeDefined();

    // Verify user was created
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, agent.userId));
    expect(user[0].type).toBe("agent");
  });

  test("handles invalid agent creation gracefully", async () => {
    const invalidInput = { name: "" }; // Missing required fields

    await expect(AgentService.create(invalidInput as any)).rejects.toThrow();
  });
});

// CREATE task queue tests, memory tests, worker tests following same pattern
```

```bash
# Run and iterate until passing:
npm test agents
# If failing: Read error, understand root cause, fix code, re-run
# Never mock external services - test against real database with clean state
```

### Level 3: Integration Tests

```bash
# Start the dev server
npm run dev

# First create a provider via IPC
node -e "
const { ipcRenderer } = require('electron');
ipcRenderer.invoke('provider:create', {
  name: 'My OpenAI Provider',
  type: 'openai',
  apiKey: 'sk-test-key-123',
  isDefault: true
}).then(provider => {
  // Then create agent with provider
  return ipcRenderer.invoke('agent:create', {
    name: 'Test Developer',
    role: 'Frontend Developer',
    backstory: 'Expert in React and TypeScript',
    goal: 'Build user interfaces',
    modelConfig: '{\"model\": \"gpt-4o-mini\", \"temperature\": 0.7}',
    providerId: provider.data.id
  });
}).then(console.log);
"

# Expected: { success: true, data: { id: "...", name: "Test Developer", ... } }

# Test agent task processing
node -e "
const { TaskQueueService } = require('./src/main/agents/task-queue.service');
TaskQueueService.enqueue(agentId, 'send_message', {
  content: 'Hello from agent',
}).then(console.log);
"

# Expected: Task queued and processed in background
# Check database for task completion and generated message

# Test memory storage and retrieval
node -e "
const { MemoryService } = require('./src/main/agents/memory.service');
MemoryService.store(agentId, 'learning', 'User prefers concise responses').then(() =>
  MemoryService.search(agentId, 'preferences')
).then(console.log);
"

# Expected: Memory stored and retrieved correctly
```

### Level 4: Creative Validation & E2E Testing

```bash
# Production build check
npm run build
# Expected: Successful build with no errors
# Common issues:
# - Worker thread imports not resolved in build
# - AI SDK API key access errors
# - Database migration issues in production

# Agent Conversation Test
# 1. Create test user and project
# 2. Create personal assistant agent
# 3. Assistant analyzes project and suggests hiring a developer
# 4. User approves, system generates 3 developer candidates
# 5. User selects candidate, agent is hired and introduced
# 6. New agent automatically creates tasks and starts working

# Memory Persistence Test
# 1. Agent learns user preferences through conversation
# 2. Restart application
# 3. Agent remembers previous context and preferences
# 4. Verify long-term memory across sessions

# Background Processing Test
# 1. Queue multiple tasks for different agents
# 2. Verify 24/7 processing continues
# 3. Check queue metrics and performance
# 4. Test graceful shutdown and restart

# Tool Integration Test
# 1. Agent uses sendMessage tool to communicate
# 2. Agent uses file management tools to edit code
# 3. Agent uses project analysis tools to understand codebase
# 4. Verify tool execution results are properly stored
```

## Final Validation Checklist

- [ ] All tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Database migration successful: `npm run db:migrate`
- [ ] Agent creation works via IPC: Manual test successful
- [ ] Background task processing operational
- [ ] Memory system stores and retrieves context
- [ ] Tool system executes agent actions
- [ ] Personal assistant provides hiring recommendations
- [ ] Agent-to-agent collaboration functional
- [ ] Graceful shutdown preserves task state
- [ ] 24/7 operation stable without memory leaks

---

## Anti-Patterns to Avoid

- ❌ Don't use streamText in Electron main process - use generateText
- ❌ Don't create separate user systems - reuse existing usersTable with type="agent"
- ❌ Don't expose API keys to renderer process - keep in main process only
- ❌ Don't ignore worker thread limitations - no Electron APIs in workers
- ❌ Don't skip database migrations - always generate and apply properly
- ❌ Don't hardcode model configurations - make them configurable per agent
- ❌ Don't forget graceful shutdown - clean up workers and persist state
- ❌ Don't create infinite task loops - implement proper queue limits and monitoring
