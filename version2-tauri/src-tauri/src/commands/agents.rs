use crate::db::models::{Agent, AgentConfig, User};
use crate::db::repositories::AgentsRepository;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

// ============================================================================
// Command Input/Output Types
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct CreateAgentInput {
    pub name: String,
    pub llm_provider_id: String,
    pub role: String,
    pub backstory: String,
    pub goal: String,
    pub model: String,
    pub temperature: f64,
    pub max_tokens: i64,
    pub top_p: Option<f64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAgentInput {
    pub id: String,
    pub role: Option<String>,
    pub backstory: Option<String>,
    pub goal: Option<String>,
    pub model: Option<String>,
    pub temperature: Option<f64>,
    pub max_tokens: Option<i64>,
    pub top_p: Option<f64>,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn validate_create_agent_input(input: &CreateAgentInput) -> AppResult<()> {
    if input.name.trim().is_empty() {
        return Err(AppError::Validation("Agent name is required".to_string()));
    }

    if input.name.len() > 100 {
        return Err(AppError::Validation("Agent name too long (max 100 characters)".to_string()));
    }

    if input.role.trim().is_empty() {
        return Err(AppError::Validation("Agent role is required".to_string()));
    }

    if input.backstory.trim().is_empty() {
        return Err(AppError::Validation("Agent backstory is required".to_string()));
    }

    if input.goal.trim().is_empty() {
        return Err(AppError::Validation("Agent goal is required".to_string()));
    }

    if input.model.trim().is_empty() {
        return Err(AppError::Validation("Model is required".to_string()));
    }

    if input.temperature < 0.0 || input.temperature > 2.0 {
        return Err(AppError::Validation("Temperature must be between 0.0 and 2.0".to_string()));
    }

    if input.max_tokens < 1 {
        return Err(AppError::Validation("Max tokens must be greater than 0".to_string()));
    }

    if let Some(top_p) = input.top_p {
        if top_p < 0.0 || top_p > 1.0 {
            return Err(AppError::Validation("Top P must be between 0.0 and 1.0".to_string()));
        }
    }

    Ok(())
}

// ============================================================================
// Commands
// ============================================================================

/// Create a new agent
#[tauri::command]
pub async fn create_agent(
    input: CreateAgentInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Agent> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Validate input
    validate_create_agent_input(&input)?;

    // Create agent user
    let agent_user = AgentsRepository::create_user(
        &state.db,
        &input.name,
    ).await?;

    // Create agent config
    let _agent_config = AgentsRepository::create_config(
        &state.db,
        &agent_user.id,
        &input.llm_provider_id,
        &input.role,
        &input.backstory,
        &input.goal,
        &input.model,
        input.temperature,
        input.max_tokens,
        input.top_p,
    ).await?;

    // Fetch the complete agent (user + config joined)
    let agent = AgentsRepository::find_by_id(&state.db, &agent_user.id)
        .await?
        .ok_or(AppError::Internal("Failed to retrieve created agent".to_string()))?;

    Ok(agent)
}

/// List all agents
#[tauri::command]
pub async fn list_agents(
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Vec<Agent>> {
    // Authenticate
    let _user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // List all agents
    let agents = AgentsRepository::list_all(&state.db).await?;

    Ok(agents)
}

/// Get agent by ID
#[tauri::command]
pub async fn get_agent(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Agent> {
    // Authenticate
    let _user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get agent
    let agent = AgentsRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Agent not found".to_string()))?;

    Ok(agent)
}

/// Update agent configuration
#[tauri::command]
pub async fn update_agent(
    input: UpdateAgentInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Agent> {
    // Authenticate
    let _user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Validate temperature if provided
    if let Some(temp) = input.temperature {
        if temp < 0.0 || temp > 2.0 {
            return Err(AppError::Validation("Temperature must be between 0.0 and 2.0".to_string()));
        }
    }

    // Validate max_tokens if provided
    if let Some(max_tokens) = input.max_tokens {
        if max_tokens < 1 {
            return Err(AppError::Validation("Max tokens must be greater than 0".to_string()));
        }
    }

    // Validate top_p if provided
    if let Some(top_p) = input.top_p {
        if top_p < 0.0 || top_p > 1.0 {
            return Err(AppError::Validation("Top P must be between 0.0 and 1.0".to_string()));
        }
    }

    // Update agent config
    let _config = AgentsRepository::update_config(
        &state.db,
        &input.id,
        input.role.as_deref(),
        input.backstory.as_deref(),
        input.goal.as_deref(),
        input.model.as_deref(),
        input.temperature,
        input.max_tokens,
        input.top_p,
    ).await?;

    // Fetch the updated agent
    let agent = AgentsRepository::find_by_id(&state.db, &input.id)
        .await?
        .ok_or(AppError::NotFound("Agent not found".to_string()))?;

    Ok(agent)
}

/// Delete agent (soft delete)
#[tauri::command]
pub async fn delete_agent(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    // Authenticate
    let _user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Soft delete agent
    AgentsRepository::soft_delete(&state.db, &id).await?;

    Ok(())
}
