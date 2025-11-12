# Project Wiz V2 - Tauri Redesign (Best Practices)

> **Philosophy**: Clean slate reimagination using Tauri 2.0 + Rust + Vite + React best practices
> **Location**: `version2-tauri/` (new project, not a migration)

---

## 1. CORE PRINCIPLES

### 1.1 Design Philosophy

1. **Simplicity First** - Start with minimal viable features, expand gradually
2. **Type Safety Everywhere** - Rust compile-time + TypeScript strict mode
3. **Async by Default** - All I/O operations async (SQLx, LLM APIs)
4. **Idiomatic Rust** - Use Result<T, E>, Option<T>, proper error handling
5. **Modern React Patterns** - Hooks, Server Components concepts, Suspense

### 1.2 Technology Choices (Justified)

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend Build** | Vite | Fastest HMR, native ESM, optimized builds |
| **UI Framework** | React 19 | Latest features, mature ecosystem |
| **Routing** | TanStack Router | Type-safe, file-based, great DX |
| **State (Frontend)** | Zustand | Minimal, no boilerplate, perfect for Tauri |
| **Styling** | Tailwind v4 | Utility-first, small bundle, theme support |
| **Components** | shadcn/ui (Radix) | Accessible, customizable, no lock-in |
| **Backend** | Rust 1.80+ | Memory safe, fast, excellent async |
| **Database** | SQLx (async) | Compile-time checked, async-first |
| **LLM** | reqwest + streaming | Full control, any provider, efficient |
| **Errors** | thiserror + anyhow | Domain errors + app error propagation |
| **State (Backend)** | tokio::sync::RwLock | Async-friendly, better than std Mutex |
| **i18n** | fluent-rs | Native Rust i18n, better than JS-only |

---

## 2. DATABASE REDESIGN

### 2.1 Simplified Schema

**Core Entities (6 tables):**

```sql
-- 1. Users (includes agents via enum)
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE,              -- NULL for agents
    password_hash TEXT,              -- NULL for agents
    name TEXT NOT NULL,
    avatar_url TEXT,
    user_type TEXT NOT NULL CHECK(user_type IN ('human', 'agent')),
    status TEXT NOT NULL DEFAULT 'offline' CHECK(status IN ('online', 'away', 'busy', 'offline')),
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    deleted_at INTEGER
);

-- 2. Agent Configs (1:1 with agent users)
CREATE TABLE agent_configs (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    llm_provider_id TEXT NOT NULL REFERENCES llm_providers(id) ON DELETE RESTRICT,
    role TEXT NOT NULL,
    backstory TEXT NOT NULL,
    goal TEXT NOT NULL,
    model TEXT NOT NULL,
    temperature REAL NOT NULL DEFAULT 0.7,
    max_tokens INTEGER NOT NULL DEFAULT 2048,
    top_p REAL DEFAULT 1.0
);

-- 3. LLM Providers
CREATE TABLE llm_providers (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    provider_type TEXT NOT NULL CHECK(provider_type IN ('openai', 'anthropic', 'google', 'deepseek', 'custom')),
    api_key_encrypted BLOB NOT NULL,
    base_url TEXT,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    deleted_at INTEGER
);

-- 4. Projects
CREATE TABLE projects (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    avatar_url TEXT,
    git_url TEXT,
    git_branch TEXT DEFAULT 'main',
    local_path TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    archived_at INTEGER,
    deleted_at INTEGER
);

-- 5. Conversations (unified channels + DMs)
CREATE TABLE conversations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,  -- NULL for DMs
    conversation_type TEXT NOT NULL CHECK(conversation_type IN ('channel', 'dm')),
    name TEXT,  -- Auto-generated for DMs from participants
    description TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    archived_at INTEGER,
    deleted_at INTEGER
);

-- 6. Messages (simplified)
CREATE TABLE messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata TEXT,  -- JSON: {tokens_used, model, etc}
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    edited_at INTEGER,
    deleted_at INTEGER
);

-- Junction table for conversation participants
CREATE TABLE conversation_participants (
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    PRIMARY KEY (conversation_id, user_id)
);

-- Sessions (temporary, not persisted)
CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
```

**Key Design Improvements:**

1. **Unified Conversations** - No separate tables for channels vs DMs
2. **Flat Agent Config** - No JSON serialization, direct columns
3. **Simplified Messages** - Polymorphic via conversation_id only
4. **Better IDs** - Lowercase hex, consistent format
5. **Soft Delete Everywhere** - `deleted_at` instead of separate flag
6. **Minimal Metadata** - Only what's needed, JSON for flexibility

### 2.2 SQLx Models Pattern

```rust
// src-tauri/src/db/models.rs

use sqlx::FromRow;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: Option<String>,
    pub password_hash: Option<String>,
    pub name: String,
    pub avatar_url: Option<String>,
    pub user_type: UserType,
    pub status: UserStatus,
    pub created_at: i64,
    pub updated_at: i64,
    pub deleted_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "lowercase")]
pub enum UserType {
    Human,
    Agent,
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type)]
#[sqlx(rename_all = "lowercase")]
pub enum UserStatus {
    Online,
    Away,
    Busy,
    Offline,
}

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct AgentConfig {
    pub user_id: String,
    pub llm_provider_id: String,
    pub role: String,
    pub backstory: String,
    pub goal: String,
    pub model: String,
    pub temperature: f64,
    pub max_tokens: i64,
    pub top_p: Option<f64>,
}

// Full agent view (join user + agent_config)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    #[serde(flatten)]
    pub user: User,
    #[serde(flatten)]
    pub config: AgentConfig,
}
```

---

## 3. BACKEND ARCHITECTURE

### 3.1 Project Structure

```
src-tauri/
├── src/
│   ├── main.rs                 # Entry point
│   ├── lib.rs                  # Public API
│   │
│   ├── commands/               # Tauri commands (IPC)
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   ├── agents.rs
│   │   ├── providers.rs
│   │   ├── projects.rs
│   │   ├── conversations.rs
│   │   └── messages.rs
│   │
│   ├── db/                     # Database layer
│   │   ├── mod.rs
│   │   ├── connection.rs       # Pool management
│   │   ├── models.rs           # SQLx models
│   │   └── repositories/       # Data access
│   │       ├── mod.rs
│   │       ├── users.rs
│   │       ├── agents.rs
│   │       ├── providers.rs
│   │       └── ...
│   │
│   ├── services/               # Business logic
│   │   ├── mod.rs
│   │   ├── auth.rs
│   │   ├── llm.rs
│   │   └── crypto.rs
│   │
│   ├── state/                  # App state
│   │   ├── mod.rs
│   │   └── app_state.rs
│   │
│   ├── errors/                 # Error types
│   │   ├── mod.rs
│   │   └── app_error.rs
│   │
│   └── utils/
│       ├── mod.rs
│       └── id.rs
│
├── migrations/                 # SQLx migrations
│   ├── 001_init.sql
│   └── ...
│
├── Cargo.toml
├── tauri.conf.json
└── capabilities/
    └── default.json
```

### 3.2 State Management (Modern Pattern)

```rust
// src-tauri/src/state/app_state.rs

use sqlx::SqlitePool;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::collections::HashMap;

#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub sessions: Arc<RwLock<SessionStore>>,
    pub config: Arc<AppConfig>,
}

pub struct SessionStore {
    sessions: HashMap<String, Session>,
}

pub struct Session {
    pub user_id: String,
    pub expires_at: i64,
}

#[derive(Clone)]
pub struct AppConfig {
    pub master_key: Vec<u8>,  // For encryption
}

impl AppState {
    pub async fn new(db_path: &str, master_key: Vec<u8>) -> Result<Self, sqlx::Error> {
        let db = SqlitePool::connect(db_path).await?;

        Ok(Self {
            db,
            sessions: Arc::new(RwLock::new(SessionStore {
                sessions: HashMap::new(),
            })),
            config: Arc::new(AppConfig { master_key }),
        })
    }

    pub async fn get_current_user(&self, token: &str) -> Option<String> {
        let sessions = self.sessions.read().await;
        sessions.sessions.get(token).map(|s| s.user_id.clone())
    }
}
```

### 3.3 Error Handling (Idiomatic)

```rust
// src-tauri/src/errors/app_error.rs

use thiserror::Error;
use serde::Serialize;

#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Not authenticated")]
    Unauthorized,

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("LLM provider error: {0}")]
    LlmProvider(String),

    #[error("Encryption error")]
    Encryption,
}

// Serialize for frontend
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("AppError", 2)?;
        state.serialize_field("message", &self.to_string())?;
        state.serialize_field("kind", &self.error_kind())?;
        state.end()
    }
}

impl AppError {
    fn error_kind(&self) -> &str {
        match self {
            Self::Database(_) => "database",
            Self::Unauthorized => "unauthorized",
            Self::NotFound(_) => "not_found",
            Self::Validation(_) => "validation",
            Self::LlmProvider(_) => "llm_provider",
            Self::Encryption => "encryption",
        }
    }
}

pub type AppResult<T> = Result<T, AppError>;
```

### 3.4 Command Pattern (Modern)

```rust
// src-tauri/src/commands/agents.rs

use tauri::State;
use crate::{
    state::AppState,
    errors::{AppError, AppResult},
    db::repositories::agents::AgentRepository,
};

#[derive(Debug, serde::Deserialize)]
pub struct CreateAgentInput {
    name: String,
    role: String,
    backstory: String,
    goal: String,
    provider_id: String,
    model: String,
    temperature: f64,
    max_tokens: i64,
}

#[tauri::command]
pub async fn create_agent(
    input: CreateAgentInput,
    state: State<'_, AppState>,
) -> AppResult<Agent> {
    // 1. Authenticate
    let user_id = state
        .get_current_user(&get_auth_token()?)  // From context
        .await
        .ok_or(AppError::Unauthorized)?;

    // 2. Validate input
    validate_agent_input(&input)?;

    // 3. Create agent user
    let agent_user = AgentRepository::create_user(
        &state.db,
        &input.name,
        UserType::Agent,
    ).await?;

    // 4. Create agent config
    let agent_config = AgentRepository::create_config(
        &state.db,
        &agent_user.id,
        &input.provider_id,
        &input.role,
        &input.backstory,
        &input.goal,
        &input.model,
        input.temperature,
        input.max_tokens,
    ).await?;

    // 5. Return combined view
    Ok(Agent {
        user: agent_user,
        config: agent_config,
    })
}

#[tauri::command]
pub async fn list_agents(
    state: State<'_, AppState>,
) -> AppResult<Vec<Agent>> {
    let user_id = state
        .get_current_user(&get_auth_token()?)
        .await
        .ok_or(AppError::Unauthorized)?;

    AgentRepository::list_by_owner(&state.db, &user_id).await
}

// Helper functions
fn get_auth_token() -> AppResult<String> {
    // Extract from Tauri context/headers
    // For now, simplified
    Ok("mock-token".to_string())
}

fn validate_agent_input(input: &CreateAgentInput) -> AppResult<()> {
    if input.name.is_empty() {
        return Err(AppError::Validation("Name is required".into()));
    }
    if input.temperature < 0.0 || input.temperature > 2.0 {
        return Err(AppError::Validation("Temperature must be 0-2".into()));
    }
    Ok(())
}
```

### 3.5 Repository Pattern (Clean)

```rust
// src-tauri/src/db/repositories/agents.rs

use sqlx::{SqlitePool, query_as};
use crate::{
    db::models::{User, AgentConfig, Agent, UserType},
    errors::AppResult,
};

pub struct AgentRepository;

impl AgentRepository {
    pub async fn create_user(
        pool: &SqlitePool,
        name: &str,
        user_type: UserType,
    ) -> AppResult<User> {
        let user = query_as::<_, User>(
            "INSERT INTO users (name, user_type) VALUES (?, ?) RETURNING *"
        )
        .bind(name)
        .bind(user_type)
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    pub async fn create_config(
        pool: &SqlitePool,
        user_id: &str,
        provider_id: &str,
        role: &str,
        backstory: &str,
        goal: &str,
        model: &str,
        temperature: f64,
        max_tokens: i64,
    ) -> AppResult<AgentConfig> {
        let config = query_as::<_, AgentConfig>(
            r#"
            INSERT INTO agent_configs
            (user_id, llm_provider_id, role, backstory, goal, model, temperature, max_tokens)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            "#
        )
        .bind(user_id)
        .bind(provider_id)
        .bind(role)
        .bind(backstory)
        .bind(goal)
        .bind(model)
        .bind(temperature)
        .bind(max_tokens)
        .fetch_one(pool)
        .await?;

        Ok(config)
    }

    pub async fn list_by_owner(
        pool: &SqlitePool,
        owner_id: &str,
    ) -> AppResult<Vec<Agent>> {
        let agents = query_as::<_, Agent>(
            r#"
            SELECT
                u.*,
                ac.*
            FROM users u
            INNER JOIN agent_configs ac ON u.id = ac.user_id
            WHERE u.user_type = 'agent'
              AND u.deleted_at IS NULL
            ORDER BY u.created_at DESC
            "#
        )
        .fetch_all(pool)
        .await?;

        Ok(agents)
    }
}
```

---

## 4. FRONTEND ARCHITECTURE

### 4.1 Project Structure

```
src/
├── app/                        # Routes (TanStack Router)
│   ├── __root.tsx
│   ├── index.tsx
│   ├── auth/
│   │   └── login.tsx
│   └── (app)/                  # Authenticated routes
│       ├── _layout.tsx
│       ├── agents/
│       │   ├── index.tsx
│       │   ├── new.tsx
│       │   └── [id]/
│       │       └── edit.tsx
│       ├── projects/
│       └── conversations/
│
├── features/                   # Feature modules
│   ├── agents/
│   │   ├── api.ts             # Tauri invocations
│   │   ├── store.ts           # Zustand store
│   │   ├── types.ts
│   │   └── components/
│   │       ├── agent-form.tsx
│   │       ├── agent-card.tsx
│   │       └── agent-list.tsx
│   │
│   ├── auth/
│   └── chat/
│
├── components/                 # Shared components
│   └── ui/                     # shadcn/ui (DO NOT EDIT)
│
├── lib/                        # Utilities
│   ├── tauri.ts               # Tauri helpers
│   └── utils.ts
│
└── styles/
    └── globals.css
```

### 4.2 Tauri Integration (Type-Safe)

```typescript
// src/lib/tauri.ts

import { invoke } from '@tauri-apps/api/core'

// Type-safe invoke wrapper
export async function invokeCommand<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(command, args)
  } catch (error) {
    // Transform Tauri errors
    if (typeof error === 'object' && error !== null) {
      const appError = error as { message: string; kind: string }
      throw new AppError(appError.message, appError.kind)
    }
    throw new Error('Unknown error')
  }
}

export class AppError extends Error {
  constructor(
    message: string,
    public kind: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}
```

### 4.3 Feature Module Pattern (Agents Example)

```typescript
// src/features/agents/api.ts

import { invokeCommand } from '@/lib/tauri'
import type { Agent, CreateAgentInput } from './types'

export const agentApi = {
  create: (input: CreateAgentInput) =>
    invokeCommand<Agent>('create_agent', { input }),

  list: () =>
    invokeCommand<Agent[]>('list_agents'),

  get: (id: string) =>
    invokeCommand<Agent>('get_agent', { id }),

  update: (id: string, input: Partial<CreateAgentInput>) =>
    invokeCommand<Agent>('update_agent', { id, input }),

  delete: (id: string) =>
    invokeCommand<void>('delete_agent', { id }),
}
```

```typescript
// src/features/agents/store.ts

import { create } from 'zustand'
import { agentApi } from './api'
import type { Agent } from './types'

interface AgentStore {
  agents: Agent[]
  isLoading: boolean
  error: string | null

  fetchAgents: () => Promise<void>
  createAgent: (input: CreateAgentInput) => Promise<Agent>
  deleteAgent: (id: string) => Promise<void>
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: [],
  isLoading: false,
  error: null,

  fetchAgents: async () => {
    set({ isLoading: true, error: null })
    try {
      const agents = await agentApi.list()
      set({ agents, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  createAgent: async (input) => {
    const agent = await agentApi.create(input)
    set({ agents: [...get().agents, agent] })
    return agent
  },

  deleteAgent: async (id) => {
    await agentApi.delete(id)
    set({ agents: get().agents.filter(a => a.id !== id) })
  },
}))
```

```tsx
// src/features/agents/components/agent-list.tsx

import { useEffect } from 'react'
import { useAgentStore } from '../store'
import { AgentCard } from './agent-card'

export function AgentList() {
  const { agents, isLoading, error, fetchAgents } = useAgentStore()

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map(agent => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  )
}
```

---

## 5. LLM INTEGRATION (STREAMING)

### 5.1 Generic Streaming Service

```rust
// src-tauri/src/services/llm.rs

use futures::Stream;
use reqwest::Client;
use serde_json::json;
use crate::errors::AppResult;

pub struct LlmService {
    client: Client,
}

impl LlmService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    pub async fn stream_completion(
        &self,
        provider: &LlmProvider,
        messages: Vec<ChatMessage>,
    ) -> AppResult<impl Stream<Item = AppResult<String>>> {
        match provider.provider_type.as_str() {
            "openai" => self.stream_openai(provider, messages).await,
            "anthropic" => self.stream_anthropic(provider, messages).await,
            _ => Err(AppError::Validation("Unsupported provider".into())),
        }
    }

    async fn stream_openai(
        &self,
        provider: &LlmProvider,
        messages: Vec<ChatMessage>,
    ) -> AppResult<impl Stream<Item = AppResult<String>>> {
        // Implementation using eventsource-stream
        todo!()
    }
}
```

### 5.2 Streaming Command

```rust
// src-tauri/src/commands/messages.rs

use tauri::ipc::Channel;

#[tauri::command]
pub async fn send_message_streaming(
    conversation_id: String,
    content: String,
    on_chunk: Channel,
    state: State<'_, AppState>,
) -> AppResult<Message> {
    let user_id = state.get_current_user(&get_auth_token()?).await
        .ok_or(AppError::Unauthorized)?;

    // 1. Save user message
    let user_message = MessageRepository::create(
        &state.db,
        &conversation_id,
        &user_id,
        &content,
    ).await?;

    // 2. Get conversation context
    let messages = MessageRepository::get_history(&state.db, &conversation_id).await?;

    // 3. Stream AI response
    let mut full_response = String::new();
    let mut stream = state.llm.stream_completion(
        &provider,
        messages.into(),
    ).await?;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk?;
        full_response.push_str(&chunk);

        // Send to frontend
        on_chunk.send(chunk)?;
    }

    // 4. Save AI message
    let ai_message = MessageRepository::create(
        &state.db,
        &conversation_id,
        &agent_id,
        &full_response,
    ).await?;

    Ok(ai_message)
}
```

### 5.3 Frontend Streaming

```typescript
// src/features/chat/api.ts

import { invoke, Channel } from '@tauri-apps/api/core'

export async function sendMessageStreaming(
  conversationId: string,
  content: string,
  onChunk: (chunk: string) => void
): Promise<Message> {
  return invoke('send_message_streaming', {
    conversationId,
    content,
    onChunk: new Channel({
      onmessage: onChunk,
    }),
  })
}
```

```tsx
// src/features/chat/components/chat-input.tsx

import { useState } from 'react'
import { sendMessageStreaming } from '../api'

export function ChatInput({ conversationId }: { conversationId: string }) {
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setStreaming('')

    await sendMessageStreaming(
      conversationId,
      input,
      (chunk) => setStreaming(prev => prev + chunk)
    )

    setInput('')
    setStreaming('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      {streaming && <div className="streaming">{streaming}</div>}
    </form>
  )
}
```

---

## 6. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1)
- [ ] Initialize Tauri project in `version2-tauri/`
- [ ] Set up Vite + React + TypeScript
- [ ] Configure Tailwind + shadcn/ui
- [ ] Set up SQLx + migrations
- [ ] Implement AppState + error handling
- [ ] Create first command (health check)

### Phase 2: Authentication (Week 1-2)
- [ ] User registration + login
- [ ] Session management
- [ ] Password hashing (argon2)
- [ ] Protected commands middleware

### Phase 3: Core Features (Week 2-3)
- [ ] LLM Provider CRUD + encryption
- [ ] Agent CRUD
- [ ] Basic agent-provider linking

### Phase 4: Projects & Conversations (Week 3-4)
- [ ] Project CRUD
- [ ] Conversation CRUD (channels + DMs)
- [ ] Participant management

### Phase 5: Messaging (Week 4-5)
- [ ] Message CRUD
- [ ] Basic LLM integration
- [ ] Streaming responses

### Phase 6: Polish (Week 5-6)
- [ ] Error boundaries
- [ ] Loading states
- [ ] Offline support
- [ ] Performance optimization

---

## 7. QUALITY CHECKLIST

### Code Quality
- [ ] Zero compiler warnings (Rust + TS)
- [ ] Clippy passing
- [ ] ESLint passing
- [ ] All functions < 50 lines
- [ ] All files < 500 lines

### Type Safety
- [ ] SQLx compile-time query verification
- [ ] TypeScript strict mode
- [ ] No `any` types
- [ ] Proper error types everywhere

### Performance
- [ ] App startup < 2s
- [ ] Command latency < 50ms
- [ ] Database queries < 20ms
- [ ] Binary size < 15MB

### Security
- [ ] API keys encrypted (AES-256-GCM)
- [ ] SQL injection prevented (SQLx)
- [ ] XSS prevented (React)
- [ ] No secrets in code

---

## 8. KEY DIFFERENCES FROM V1

| Aspect | V1 (Electron) | V2 (Tauri) |
|--------|---------------|------------|
| **IPC** | Custom createIPCHandler | Native Tauri commands |
| **State** | std::Mutex | tokio::sync::RwLock |
| **DB** | Drizzle ORM | SQLx (raw SQL) |
| **Errors** | String errors | thiserror + custom types |
| **Messages** | Polymorphic complex | Simplified via conversations |
| **Schema** | 12+ tables | 8 tables |
| **LLM** | Vercel AI SDK | Custom streaming |
| **Frontend State** | TanStack Query | Zustand |

---

**Status**: READY TO IMPLEMENT
**Next**: Initialize project in `version2-tauri/`
