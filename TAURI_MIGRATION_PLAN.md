# Project Wiz - Tauri Migration Plan

## Executive Summary

This document outlines the complete strategy for reimplementing Project Wiz using Tauri 2.0, migrating from Electron to a more performant, secure, and lightweight desktop framework with a Rust backend.

---

## 1. CURRENT SYSTEM ANALYSIS

### 1.1 System Overview

**Project Wiz** is a desktop application that automates software development using AI agents. It provides:
- **Multi-LLM Support**: OpenAI, Anthropic, DeepSeek, Google providers
- **AI Agents**: Customizable autonomous agents with roles, backstories, and goals
- **Project Management**: Git integration, channels, team collaboration
- **Direct Messaging**: Agent-to-agent and user-to-agent communication
- **Local-First Architecture**: SQLite database with encrypted API keys

### 1.2 Current Technology Stack (Electron)

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19, TanStack Router, TanStack Query | UI and state management |
| **Styling** | Tailwind CSS 4, shadcn/ui (Radix UI) | Component styling |
| **Desktop** | Electron 35, Node.js | Desktop platform |
| **Database** | SQLite (better-sqlite3), Drizzle ORM | Local persistence |
| **AI/LLM** | Vercel AI SDK | Multi-provider abstraction |
| **i18n** | LinguiJS | English/Portuguese support |
| **Validation** | Zod | Runtime type validation |

### 1.3 Core Database Schema

**Main Entities:**
1. **users** - Human users and AI agents (polymorphic)
2. **agents** - AI agent configurations (extends users)
3. **llm_providers** - LLM provider configurations with encrypted API keys
4. **projects** - Software projects with Git integration
5. **project_channels** - Project-based communication channels
6. **direct_messages** - Private conversations
7. **direct_message_participants** - DM participant relationships
8. **messages** - Polymorphic messages (channel or DM)
9. **accounts** - User authentication credentials
10. **user_sessions** - Active user sessions
11. **user_preferences** - User settings
12. **memory** - Agent conversation memory (for RAG)
13. **job** - Background job queue

**Key Patterns:**
- Soft deletion via `deactivatedAt` timestamps
- Composite primary keys for multi-tenant data
- Polymorphic relationships (messages can be in channels or DMs)
- Timestamp fields using `timestamp_ms` mode
- Performance indexes on foreign keys and query fields

### 1.4 IPC Architecture (Electron)

**Current IPC Pattern:**
```
src/main/ipc/{domain}/{action}/invoke.ts
```

**Domains:**
- agent (create, list, get, update, activate, inactivate)
- auth (login, logout, get-session)
- channel (create, list, archive, unarchive)
- conversation (create, list)
- dm (create, list, archive, send-message)
- llm-provider (create, list, get, update, delete)
- profile (create, get, update)
- project (create, list, get, update, archive)
- user (create, list, get, update)
- window (minimize, maximize, close)

**IPC Handler Pattern:**
```typescript
createIPCHandler({
  inputSchema: ZodSchema,
  outputSchema: ZodSchema,
  handler: async (input) => {
    const user = requireAuth();
    // Business logic
    return result;
  }
})
```

### 1.5 UI Architecture

**Route Structure (TanStack Router):**
```
/_authenticated
  /project/$projectId
    /channel/$channelId
  /user
    /agents (list, new, $agentId/edit)
    /dm/$conversationId
    /settings
      /llm-providers/$providerId
```

**Feature Modules:**
- agent (components, hooks, actions, utils)
- auth (components, hooks, utils)
- chat (components, hooks)
- conversation (components, hooks, utils)
- dashboard (components)
- project (components, hooks)
- user (components, hooks)

**UI Components:**
- shadcn/ui for base components (immutable)
- Custom feature components
- Tailwind CSS for styling
- LinguiJS for i18n

---

## 2. SYSTEM OBJECTIVES & REQUIREMENTS

### 2.1 Core Objectives

1. **Maintain Feature Parity**: All existing functionality must be preserved
2. **Improve Performance**: Faster startup, lower memory usage, better responsiveness
3. **Enhance Security**: Rust-backed security model, better secrets management
4. **Reduce Bundle Size**: Smaller binaries compared to Electron
5. **Simplify Architecture**: Cleaner separation of concerns
6. **Preserve UX**: No disruption to user workflows

### 2.2 Functional Requirements

#### Authentication & Authorization
- ✓ User login/logout with bcrypt password hashing
- ✓ Session management with token-based auth
- ✓ Role-based access control (future-ready)

#### Agent Management
- ✓ Create, read, update, activate/inactivate agents
- ✓ Configure agent roles, backstories, goals
- ✓ Link agents to LLM providers
- ✓ Model configuration (temperature, max tokens, top-p)

#### LLM Provider Management
- ✓ Support OpenAI, Anthropic, DeepSeek, Google, custom providers
- ✓ Encrypted API key storage
- ✓ Default provider selection
- ✓ Base URL configuration for custom providers

#### Project Management
- ✓ Create, update, archive projects
- ✓ Git repository integration
- ✓ Local path management
- ✓ Project channels for team communication

#### Messaging System
- ✓ Channel-based messaging (project context)
- ✓ Direct messages (1-on-1 or group)
- ✓ Real-time message streaming from AI agents
- ✓ Message history and archiving

#### AI Integration
- ✓ Streaming LLM responses
- ✓ Context-aware conversations
- ✓ Memory/RAG for long-term context
- ✓ Multi-provider failover

### 2.3 Non-Functional Requirements

- **Performance**: Sub-100ms IPC response times, < 3s startup
- **Security**: Encrypted credentials, secure IPC, no code injection
- **Reliability**: Graceful error handling, database integrity
- **Usability**: Responsive UI, keyboard shortcuts, accessibility
- **Maintainability**: Clear code structure, comprehensive types
- **Testability**: Unit, integration, and E2E tests

---

## 3. TAURI ARCHITECTURE STRATEGY

### 3.1 Why Tauri?

**Advantages over Electron:**
1. **Smaller Bundle Size**: ~10-20MB vs ~100-200MB
2. **Better Performance**: Rust backend, native WebView
3. **Enhanced Security**: Rust memory safety, capability-based security
4. **Lower Resource Usage**: No bundled Chromium, system WebView
5. **Modern Architecture**: Built for 2025+ with mobile support

**Trade-offs:**
- More complex initial setup (Rust learning curve)
- Different plugin ecosystem
- Platform-specific WebView differences
- No Node.js runtime (must port to Rust)

### 3.2 Proposed Architecture

```
version2-tauri/
├── src/                          # Frontend (React)
│   ├── app/                      # TanStack Router routes
│   ├── features/                 # Feature modules
│   ├── components/               # Shared components
│   ├── hooks/                    # React hooks
│   ├── lib/                      # Frontend utilities
│   └── locales/                  # i18n translations
│
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs              # App entry point
│   │   ├── lib.rs               # Core library
│   │   ├── commands/            # Tauri commands (IPC handlers)
│   │   │   ├── agent.rs
│   │   │   ├── auth.rs
│   │   │   ├── channel.rs
│   │   │   ├── llm_provider.rs
│   │   │   ├── project.rs
│   │   │   └── ...
│   │   ├── models/              # Database models (SQLx)
│   │   │   ├── user.rs
│   │   │   ├── agent.rs
│   │   │   └── ...
│   │   ├── services/            # Business logic
│   │   │   ├── auth_service.rs
│   │   │   ├── llm_service.rs
│   │   │   └── ...
│   │   ├── db/                  # Database layer
│   │   │   ├── connection.rs
│   │   │   └── migrations/
│   │   └── utils/               # Utilities
│   ├── Cargo.toml               # Rust dependencies
│   ├── tauri.conf.json          # Tauri configuration
│   └── capabilities/            # Security capabilities
│
├── package.json                  # Frontend dependencies
├── vite.config.ts               # Vite configuration
└── tsconfig.json                # TypeScript configuration
```

### 3.3 Technology Stack (Tauri)

| Layer | Technology | Purpose | Rationale |
|-------|------------|---------|-----------|
| **Frontend** | React 19, TanStack Router, TanStack Query | UI | ✓ Keep existing |
| **Styling** | Tailwind CSS 4, shadcn/ui | Components | ✓ Keep existing |
| **Desktop** | Tauri 2.0 | Desktop platform | ★ Migration target |
| **Backend** | Rust 1.80+ | Business logic | ★ New - replaces Node.js |
| **Database** | SQLite + SQLx (Rust) | Persistence | ★ New - replaces better-sqlite3 |
| **AI/LLM** | async-openai, anthropic-sdk-rust | LLM integration | ★ New - Rust equivalents |
| **i18n** | LinguiJS | Translations | ✓ Keep existing |
| **Validation** | Zod (frontend) + serde (backend) | Type safety | ★ Hybrid approach |
| **IPC** | Tauri Commands | Frontend-backend | ★ New - replaces Electron IPC |

### 3.4 Database Strategy

**Migration Approach:**
1. **Keep SQLite** - proven, embeddable, excellent for desktop
2. **Use SQLx** - Rust async SQL toolkit with compile-time query checking
3. **Preserve Schema** - maintain exact same database structure
4. **Migration Path** - existing DBs should work with minimal migration

**SQLx vs Diesel:**
- SQLx: More flexible, async-first, compile-time verification
- Diesel: More ORM-like, compile-time type safety
- **Choice: SQLx** - better for Tauri's async architecture

**Database Layer Pattern:**
```rust
// models/user.rs
#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub name: String,
    pub avatar: Option<String>,
    pub user_type: String,
    pub status: String,
    pub deactivated_at: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

// db/connection.rs
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new(path: &str) -> Result<Self> {
        let pool = SqlitePool::connect(path).await?;
        Ok(Self { pool })
    }
}

// commands/user.rs
#[tauri::command]
async fn get_user(
    id: String,
    state: tauri::State<'_, Database>
) -> Result<User, String> {
    sqlx::query_as::<_, User>("SELECT * FROM users WHERE id = ?")
        .bind(id)
        .fetch_one(&state.pool)
        .await
        .map_err(|e| e.to_string())
}
```

### 3.5 IPC Strategy (Tauri Commands)

**Command Pattern:**
```rust
// commands/agent.rs
#[derive(Debug, Deserialize)]
pub struct CreateAgentInput {
    name: String,
    role: String,
    backstory: String,
    goal: String,
    provider_id: String,
    model_config: ModelConfig,
}

#[derive(Debug, Serialize)]
pub struct AgentOutput {
    id: String,
    name: String,
    // ... other fields
}

#[tauri::command]
pub async fn create_agent(
    input: CreateAgentInput,
    state: tauri::State<'_, AppState>,
) -> Result<AgentOutput, String> {
    // 1. Authenticate
    let user = state.require_auth()?;

    // 2. Validate
    // (serde handles basic validation)

    // 3. Execute
    let agent = state.db.create_agent(
        user.id,
        input.name,
        // ...
    ).await?;

    // 4. Emit event
    state.event_bus.emit("agent:created", &agent.id);

    Ok(agent.into())
}
```

**Frontend Usage:**
```typescript
import { invoke } from '@tauri-apps/api/core'

const agent = await invoke<AgentOutput>('create_agent', {
  input: {
    name: 'Code Reviewer',
    role: 'Software Engineer',
    backstory: '...',
    goal: '...',
    providerId: '...',
    modelConfig: { ... }
  }
})
```

### 3.6 Authentication Strategy

**Session Management:**
```rust
// State management with Mutex
pub struct AppState {
    pub db: Database,
    pub sessions: Arc<Mutex<HashMap<String, Session>>>,
}

// Session validation
pub fn require_auth(state: &AppState) -> Result<User, AuthError> {
    let sessions = state.sessions.lock().unwrap();
    // Validate session from request context
    // Return authenticated user or error
}

// Command with auth
#[tauri::command]
pub async fn protected_command(
    state: tauri::State<'_, AppState>,
) -> Result<Data, String> {
    let user = require_auth(&state)?;
    // ... command logic
}
```

### 3.7 LLM Integration Strategy

**Rust LLM Libraries:**
```rust
// Cargo.toml
async-openai = "0.24"
anthropic-sdk = "0.1"

// services/llm_service.rs
pub async fn stream_completion(
    provider: &LlmProvider,
    messages: Vec<Message>,
) -> impl Stream<Item = Result<String>> {
    match provider.provider_type {
        "openai" => stream_openai(provider, messages).await,
        "anthropic" => stream_anthropic(provider, messages).await,
        // ...
    }
}
```

**Streaming to Frontend:**
```rust
#[tauri::command]
pub async fn chat_stream(
    message: String,
    channel: tauri::ipc::Channel,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    let stream = state.llm.stream_completion(...).await;

    for await chunk in stream {
        channel.send(chunk?)?;
    }

    Ok(())
}
```

### 3.8 Security Model

**Tauri Capabilities:**
```json
// capabilities/default.json
{
  "identifier": "default",
  "permissions": [
    "core:default",
    "shell:allow-execute",
    "fs:allow-read",
    "fs:allow-write"
  ],
  "platforms": ["windows", "linux", "macOS"]
}
```

**API Key Encryption:**
```rust
use ring::aead::{Aad, LessSafeKey, Nonce, UnboundKey, AES_256_GCM};

pub fn encrypt_api_key(key: &str, master_key: &[u8]) -> Vec<u8> {
    // Use OS keyring or secure enclave when possible
    // Fallback to encrypted storage with user password
}
```

---

## 4. IMPLEMENTATION PHASES

### Phase 0: Project Setup & Foundation (Week 1)

**Goals:**
- Initialize Tauri project structure
- Set up development environment
- Configure build tooling

**Tasks:**
1. Create `version2-tauri` directory
2. Initialize Tauri app: `npm create tauri-app@latest`
3. Configure Vite + React + TypeScript
4. Set up Tailwind CSS and shadcn/ui
5. Configure TanStack Router
6. Set up Rust workspace structure
7. Configure SQLx and database
8. Set up testing infrastructure

**Deliverables:**
- Working Tauri app shell
- Database connection established
- Basic IPC communication working
- Hello World command

**Validation:**
- App starts successfully
- Can invoke Rust command from React
- Can query SQLite database
- TypeScript types working

---

### Phase 1: Core Infrastructure (Week 2)

**Goals:**
- Authentication system
- Database models and migrations
- Core IPC commands
- State management

**Tasks:**
1. **Database Layer:**
   - Port all Drizzle schemas to SQLx migrations
   - Create Rust models for all entities
   - Implement database connection pool
   - Set up migration system

2. **Authentication:**
   - Implement user authentication (login/logout)
   - Session management in Rust
   - Password hashing with bcrypt
   - Session middleware for commands

3. **State Management:**
   - Global AppState with Database, Sessions
   - Thread-safe state with Arc<Mutex<>>
   - State injection in commands

4. **Core Commands:**
   - `auth:login`
   - `auth:logout`
   - `auth:get_session`
   - `user:get`
   - `user:list`

**Deliverables:**
- Complete database schema in SQLx
- Working authentication flow
- 5+ core commands implemented
- Frontend can authenticate users

**Validation:**
- Can create user and login
- Sessions persist correctly
- Protected commands reject unauthenticated requests
- Database queries are type-safe

---

### Phase 2: Agent Management (Week 3)

**Goals:**
- LLM provider CRUD
- Agent CRUD operations
- Model configuration
- Basic AI integration

**Tasks:**
1. **LLM Providers:**
   - Implement provider CRUD commands
   - API key encryption/decryption
   - Provider type validation
   - Default provider management

2. **Agents:**
   - Agent CRUD commands
   - Link agents to providers
   - Model config serialization
   - Agent activation/deactivation

3. **Frontend:**
   - Port agent feature module
   - Agent list and card components
   - Agent form with validation
   - Provider selection UI

4. **LLM Integration:**
   - Basic OpenAI integration
   - Basic Anthropic integration
   - Text completion endpoint
   - Error handling

**Deliverables:**
- LLM provider management working
- Can create and configure agents
- Basic AI completion working
- Agent UI fully functional

**Validation:**
- Can add OpenAI/Anthropic provider
- Can create agent with provider
- Can get completion from agent
- API keys stored encrypted

---

### Phase 3: Project & Channel Management (Week 4)

**Goals:**
- Project CRUD
- Channel CRUD
- Project-channel relationships
- Git integration basics

**Tasks:**
1. **Projects:**
   - Project CRUD commands
   - Git URL and local path management
   - Project archiving
   - Owner management

2. **Channels:**
   - Channel CRUD commands
   - Project-channel linking
   - Channel archiving
   - Participant management

3. **Frontend:**
   - Port project feature module
   - Project list and detail views
   - Channel sidebar
   - Project creation wizard

4. **Git Integration:**
   - Simple git2-rs integration
   - Repository status checking
   - Branch detection

**Deliverables:**
- Project management working
- Channels linked to projects
- Project UI complete
- Basic Git info displayed

**Validation:**
- Can create project with Git repo
- Can create channels in project
- Can navigate project → channel
- Git status shows correctly

---

### Phase 4: Messaging System (Week 5)

**Goals:**
- Message CRUD
- Channel messages
- Direct messages
- Real-time updates

**Tasks:**
1. **Messages:**
   - Message CRUD commands
   - Polymorphic message handling (channel/DM)
   - Message pagination
   - Message archiving

2. **Direct Messages:**
   - DM conversation CRUD
   - Participant management
   - DM message sending
   - Conversation list

3. **Frontend:**
   - Port chat feature module
   - Message list with virtualization
   - Message input area
   - DM conversation UI

4. **Real-time:**
   - Event emission from backend
   - Frontend event listeners
   - Optimistic updates

**Deliverables:**
- Channel messaging working
- Direct messaging working
- Message history loading
- Real-time message updates

**Validation:**
- Can send message in channel
- Can create DM conversation
- Messages appear in real-time
- Message history paginated

---

### Phase 5: AI Chat Integration (Week 6)

**Goals:**
- Streaming AI responses
- Multi-provider support
- Context management
- Memory/RAG basics

**Tasks:**
1. **Streaming:**
   - Implement streaming commands with Channel
   - OpenAI streaming
   - Anthropic streaming
   - DeepSeek/Google streaming

2. **Chat Commands:**
   - `chat:send_message` with streaming
   - Context window management
   - System prompts
   - Agent persona injection

3. **Frontend:**
   - Streaming message rendering
   - Markdown rendering
   - Code highlighting
   - Copy/regenerate buttons

4. **Memory (Basic):**
   - Conversation summarization
   - Context compression
   - Memory storage schema

**Deliverables:**
- Streaming AI responses working
- Multi-provider chat functional
- Rich message rendering
- Basic conversation memory

**Validation:**
- Agent responds to messages
- Streaming works smoothly
- Can switch between providers
- Context maintained in conversation

---

### Phase 6: Advanced Features & Polish (Week 7-8)

**Goals:**
- Background jobs
- File operations
- Advanced Git features
- Performance optimization
- UI polish

**Tasks:**
1. **Background Jobs:**
   - Job queue implementation
   - Long-running task handling
   - Progress reporting
   - Job cancellation

2. **File Operations:**
   - File upload/download
   - Project file browsing
   - Code snippet extraction

3. **Git Advanced:**
   - Commit history
   - Diff viewing
   - Branch switching
   - Conflict detection

4. **Performance:**
   - Database query optimization
   - Frontend code splitting
   - Lazy loading routes
   - Memory profiling

5. **UI Polish:**
   - Loading states
   - Error boundaries
   - Toast notifications
   - Keyboard shortcuts

**Deliverables:**
- All advanced features working
- Optimized performance
- Polished UI/UX
- Comprehensive error handling

**Validation:**
- Long tasks run in background
- Can browse project files
- Git operations work correctly
- App feels fast and responsive

---

### Phase 7: Testing & Documentation (Week 9)

**Goals:**
- Comprehensive test coverage
- Documentation
- Migration guide
- Deployment preparation

**Tasks:**
1. **Testing:**
   - Rust unit tests for all commands
   - Integration tests for workflows
   - Frontend component tests
   - E2E tests with Tauri CLI

2. **Documentation:**
   - Architecture documentation
   - API documentation (Rust)
   - Component documentation (Storybook?)
   - User guide updates

3. **Migration:**
   - Database migration script
   - Settings migration
   - Data import/export
   - Migration guide for users

4. **Deployment:**
   - Build configuration
   - Code signing
   - Auto-update setup
   - Release workflow

**Deliverables:**
- 80%+ test coverage
- Complete documentation
- Migration tools
- Release-ready build

**Validation:**
- All tests passing
- Can migrate from v1 to v2
- Build produces working binary
- Auto-update works

---

## 5. VALIDATION STRATEGY

### 5.1 Validation Checkpoints

**After Each Phase:**
1. All phase tasks completed
2. Unit tests written and passing
3. Integration tests passing
4. No TypeScript errors
5. No Rust compiler warnings
6. Manual testing completed
7. Performance benchmarks met

### 5.2 Quality Metrics

**Code Quality:**
- Zero compiler errors/warnings
- Clippy (Rust linter) passing
- ESLint passing
- TypeScript strict mode
- Code coverage > 80%

**Performance:**
- Startup time < 3s
- IPC latency < 100ms
- Database queries < 50ms
- Memory usage < 200MB
- Binary size < 20MB

**Security:**
- No hardcoded secrets
- API keys encrypted
- SQL injection prevented (SQLx)
- XSS prevented (React escaping)
- CSRF tokens for state-changing ops

### 5.3 Risk Mitigation

**Identified Risks:**
1. **Rust Learning Curve** - Mitigate with training, pair programming
2. **Platform Differences** - Test on Windows/Mac/Linux early
3. **Migration Complexity** - Incremental approach, feature flags
4. **Performance Issues** - Profile early, optimize continuously
5. **Breaking Changes** - Comprehensive testing, beta period

---

## 6. DECISION LOG

### 6.1 Key Decisions

| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| Tauri over Electron | Smaller size, better performance, Rust security | Stay with Electron, Try Neutralino |
| SQLx over Diesel | Async-first, more flexible | Diesel (too ORM-heavy), SeaORM |
| Keep React/TanStack | Proven stack, no frontend rewrite needed | Try Yew (Rust), Try Solid.js |
| Preserve DB Schema | Minimize migration complexity | Redesign schema |
| Async Commands | Better for streaming, IO-bound work | Sync commands |

### 6.2 Open Questions

- [ ] How to handle offline mode?
- [ ] Should we add mobile support (iOS/Android)?
- [ ] What's the update strategy for existing users?
- [ ] How to handle plugin system (if needed)?

---

## 7. SUCCESS CRITERIA

### 7.1 MVP Success

- All Phase 1-5 features working
- Can authenticate and manage agents
- Can chat with AI agents
- Can manage projects and channels
- Performance better than Electron version

### 7.2 Production Ready

- All features from Electron version ported
- Test coverage > 80%
- Documentation complete
- Migration path validated
- Build artifacts ready
- Auto-update functional

### 7.3 User Acceptance

- Existing users can migrate seamlessly
- No loss of data or settings
- UI/UX feels familiar
- Performance improvement noticeable
- Stability better or equal

---

## 8. NEXT STEPS

1. **Review this plan** with stakeholders
2. **Validate technical approach** with Tauri experts
3. **Set up project tracking** (GitHub Projects, Jira, etc.)
4. **Allocate resources** (developers, time, budget)
5. **Begin Phase 0** - Project setup

---

## APPENDIX A: Command Mapping

### Electron IPC → Tauri Commands

| Electron IPC | Tauri Command | Status |
|-------------|---------------|--------|
| `agent:create` | `create_agent` | Plan |
| `agent:list` | `list_agents` | Plan |
| `agent:get` | `get_agent` | Plan |
| `agent:update` | `update_agent` | Plan |
| `agent:activate` | `activate_agent` | Plan |
| `agent:inactivate` | `inactivate_agent` | Plan |
| `auth:login` | `login` | Plan |
| `auth:logout` | `logout` | Plan |
| `auth:get-session` | `get_session` | Plan |
| `channel:create` | `create_channel` | Plan |
| `channel:list` | `list_channels` | Plan |
| `llm-provider:create` | `create_llm_provider` | Plan |
| `llm-provider:list` | `list_llm_providers` | Plan |
| `project:create` | `create_project` | Plan |
| `project:list` | `list_projects` | Plan |

---

## APPENDIX B: Dependencies

### Rust Crates (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2.0", features = ["shell-open"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }
sqlx = { version = "0.7", features = ["runtime-tokio-native-tls", "sqlite"] }
bcrypt = "0.15"
uuid = { version = "1.0", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
async-openai = "0.24"
anthropic-sdk = "0.1"
thiserror = "1.0"
anyhow = "1.0"
ring = "0.17" # For encryption
git2 = "0.19" # For Git integration
```

### Frontend (package.json)

```json
{
  "dependencies": {
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-shell": "^2.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-router": "^1.115.0",
    "@tanstack/react-query": "^5.83.0",
    "tailwindcss": "^4.0.0",
    "zod": "^3.25.0",
    "@lingui/react": "^5.2.0"
  }
}
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-07
**Author:** Claude Code
**Status:** DRAFT - Awaiting Approval
