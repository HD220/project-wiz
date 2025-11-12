use serde::{Deserialize, Serialize};
use sqlx::FromRow;

// ============================================================================
// User Models
// ============================================================================

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: Option<String>,
    pub password_hash: Option<String>,
    pub name: String,
    pub avatar_url: Option<String>,
    pub user_type: String, // 'human' | 'agent'
    pub status: String,    // 'online' | 'away' | 'busy' | 'offline'
    pub created_at: i64,
    pub updated_at: i64,
    pub deleted_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateUser {
    pub email: Option<String>,
    pub password_hash: Option<String>,
    pub name: String,
    pub avatar_url: Option<String>,
    pub user_type: String,
}

// ============================================================================
// Agent Config Models
// ============================================================================

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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateAgentConfig {
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

// Full agent view (user + config)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Agent {
    pub user: User,
    pub config: AgentConfig,
}

// Flat struct for database queries (all fields at top level)
#[derive(Debug, Clone, FromRow)]
pub struct AgentRow {
    // User fields
    pub id: String,
    pub email: Option<String>,
    pub password_hash: Option<String>,
    pub name: String,
    pub avatar_url: Option<String>,
    pub user_type: String,
    pub status: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub deleted_at: Option<i64>,
    // AgentConfig fields
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

impl From<AgentRow> for Agent {
    fn from(row: AgentRow) -> Self {
        Agent {
            user: User {
                id: row.id,
                email: row.email,
                password_hash: row.password_hash,
                name: row.name,
                avatar_url: row.avatar_url,
                user_type: row.user_type,
                status: row.status,
                created_at: row.created_at,
                updated_at: row.updated_at,
                deleted_at: row.deleted_at,
            },
            config: AgentConfig {
                user_id: row.user_id,
                llm_provider_id: row.llm_provider_id,
                role: row.role,
                backstory: row.backstory,
                goal: row.goal,
                model: row.model,
                temperature: row.temperature,
                max_tokens: row.max_tokens,
                top_p: row.top_p,
            },
        }
    }
}

// ============================================================================
// LLM Provider Models
// ============================================================================

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct LlmProvider {
    pub id: String,
    pub owner_id: String,
    pub name: String,
    pub provider_type: String, // 'openai' | 'anthropic' | 'google' | 'deepseek' | 'custom'
    #[serde(skip_serializing)] // Don't expose encrypted key in API
    pub api_key_encrypted: Vec<u8>,
    pub base_url: Option<String>,
    pub is_default: i64, // SQLite uses i64 for boolean
    pub created_at: i64,
    pub deleted_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateLlmProvider {
    pub owner_id: String,
    pub name: String,
    pub provider_type: String,
    pub api_key: String, // Plain text, will be encrypted before storage
    pub base_url: Option<String>,
    pub is_default: bool,
}

// ============================================================================
// Project Models
// ============================================================================

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Project {
    pub id: String,
    pub owner_id: String,
    pub name: String,
    pub description: Option<String>,
    pub avatar_url: Option<String>,
    pub git_url: Option<String>,
    pub git_branch: Option<String>,
    pub local_path: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub archived_at: Option<i64>,
    pub deleted_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateProject {
    pub owner_id: String,
    pub name: String,
    pub description: Option<String>,
    pub avatar_url: Option<String>,
    pub git_url: Option<String>,
    pub git_branch: Option<String>,
    pub local_path: String,
}

// ============================================================================
// Conversation Models
// ============================================================================

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Conversation {
    pub id: String,
    pub owner_id: String,
    pub project_id: Option<String>,
    pub conversation_type: String, // 'channel' | 'dm'
    pub name: Option<String>,
    pub description: Option<String>,
    pub created_at: i64,
    pub archived_at: Option<i64>,
    pub deleted_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateConversation {
    pub owner_id: String,
    pub project_id: Option<String>,
    pub conversation_type: String,
    pub name: Option<String>,
    pub description: Option<String>,
}

// ============================================================================
// Message Models
// ============================================================================

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Message {
    pub id: String,
    pub conversation_id: String,
    pub author_id: String,
    pub content: String,
    pub metadata: Option<String>, // JSON string
    pub created_at: i64,
    pub edited_at: Option<i64>,
    pub deleted_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateMessage {
    pub conversation_id: String,
    pub author_id: String,
    pub content: String,
    pub metadata: Option<String>,
}

// ============================================================================
// Conversation Participant Models
// ============================================================================

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct ConversationParticipant {
    pub conversation_id: String,
    pub user_id: String,
    pub joined_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddParticipant {
    pub conversation_id: String,
    pub user_id: String,
}

// ============================================================================
// Session Models
// ============================================================================

#[derive(Debug, Clone, FromRow, Serialize, Deserialize)]
pub struct Session {
    pub token: String,
    pub user_id: String,
    pub expires_at: i64,
    pub created_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateSession {
    pub token: String,
    pub user_id: String,
    pub expires_at: i64,
}
