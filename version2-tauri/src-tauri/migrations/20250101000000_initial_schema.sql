-- Project Wiz V2 - Initial Database Schema
-- Simplified architecture with 8 tables

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- 1. Users (both humans and agents)
CREATE TABLE users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE,
    password_hash TEXT,
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

-- 7. Conversation Participants (junction table)
CREATE TABLE conversation_participants (
    conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    PRIMARY KEY (conversation_id, user_id)
);

-- 8. Sessions (authentication tokens)
CREATE TABLE sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

-- Indexes for performance

-- Users
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_user_type ON users(user_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status);

-- LLM Providers
CREATE INDEX idx_llm_providers_owner ON llm_providers(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_llm_providers_default ON llm_providers(is_default) WHERE deleted_at IS NULL;

-- Projects
CREATE INDEX idx_projects_owner ON projects(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_projects_archived ON projects(archived_at) WHERE deleted_at IS NULL;

-- Conversations
CREATE INDEX idx_conversations_owner ON conversations(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_project ON conversations(project_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_type ON conversations(conversation_type) WHERE deleted_at IS NULL;

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_author ON messages(author_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- Conversation Participants
CREATE INDEX idx_conversation_participants_user ON conversation_participants(user_id);

-- Sessions
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
