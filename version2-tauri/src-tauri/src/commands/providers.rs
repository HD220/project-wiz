use crate::db::models::LlmProvider;
use crate::db::repositories::ProvidersRepository;
use crate::errors::{AppError, AppResult};
use crate::services::crypto;
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

// ============================================================================
// Command Input/Output Types
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct CreateProviderInput {
    pub name: String,
    pub provider_type: String,
    pub api_key: String,
    pub base_url: Option<String>,
    pub is_default: bool,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProviderInput {
    pub id: String,
    pub name: Option<String>,
    pub base_url: Option<String>,
    pub is_default: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProviderApiKeyInput {
    pub id: String,
    pub api_key: String,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn validate_create_provider_input(input: &CreateProviderInput) -> AppResult<()> {
    if input.name.trim().is_empty() {
        return Err(AppError::Validation("Provider name is required".to_string()));
    }

    if input.name.len() > 100 {
        return Err(AppError::Validation("Provider name too long (max 100 characters)".to_string()));
    }

    if input.provider_type.trim().is_empty() {
        return Err(AppError::Validation("Provider type is required".to_string()));
    }

    // Validate provider type
    let valid_types = ["openai", "anthropic", "google", "deepseek", "custom"];
    if !valid_types.contains(&input.provider_type.as_str()) {
        return Err(AppError::Validation(
            "Invalid provider type. Must be one of: openai, anthropic, google, deepseek, custom".to_string()
        ));
    }

    if input.api_key.trim().is_empty() {
        return Err(AppError::Validation("API key is required".to_string()));
    }

    if input.api_key.len() < 10 {
        return Err(AppError::Validation("API key too short (min 10 characters)".to_string()));
    }

    Ok(())
}

// ============================================================================
// Commands
// ============================================================================

/// Create a new LLM provider with encrypted API key
#[tauri::command]
pub async fn create_provider(
    input: CreateProviderInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<LlmProvider> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Validate input
    validate_create_provider_input(&input)?;

    // Get master key from state
    let master_key = state.get_master_key().await;

    // Encrypt API key
    let api_key_encrypted = crypto::encrypt(&input.api_key, &master_key)?;

    // If setting as default, unset other defaults first
    if input.is_default {
        ProvidersRepository::unset_all_defaults(&state.db, &user_id).await?;
    }

    // Create provider
    let provider = ProvidersRepository::create(
        &state.db,
        &user_id,
        &input.name,
        &input.provider_type,
        &api_key_encrypted,
        input.base_url.as_deref(),
        input.is_default,
    ).await?;

    Ok(provider)
}

/// List all providers for the current user
#[tauri::command]
pub async fn list_providers(
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Vec<LlmProvider>> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // List providers
    let providers = ProvidersRepository::list_by_owner(&state.db, &user_id).await?;

    Ok(providers)
}

/// Get provider by ID
#[tauri::command]
pub async fn get_provider(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<LlmProvider> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get provider
    let provider = ProvidersRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Provider not found".to_string()))?;

    // Verify ownership
    if provider.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    Ok(provider)
}

/// Update provider configuration (name, base_url, is_default)
#[tauri::command]
pub async fn update_provider(
    input: UpdateProviderInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<LlmProvider> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get provider to verify ownership
    let provider = ProvidersRepository::find_by_id(&state.db, &input.id)
        .await?
        .ok_or(AppError::NotFound("Provider not found".to_string()))?;

    // Verify ownership
    if provider.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // If setting as default, unset other defaults first
    if input.is_default == Some(true) {
        ProvidersRepository::unset_all_defaults(&state.db, &user_id).await?;
    }

    // Update provider
    let updated_provider = ProvidersRepository::update(
        &state.db,
        &input.id,
        input.name.as_deref(),
        input.base_url.as_deref(),
        input.is_default,
    ).await?;

    Ok(updated_provider)
}

/// Update provider API key (re-encrypt with master key)
#[tauri::command]
pub async fn update_provider_api_key(
    input: UpdateProviderApiKeyInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<LlmProvider> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Validate API key
    if input.api_key.trim().is_empty() {
        return Err(AppError::Validation("API key is required".to_string()));
    }

    if input.api_key.len() < 10 {
        return Err(AppError::Validation("API key too short (min 10 characters)".to_string()));
    }

    // Get provider to verify ownership
    let provider = ProvidersRepository::find_by_id(&state.db, &input.id)
        .await?
        .ok_or(AppError::NotFound("Provider not found".to_string()))?;

    // Verify ownership
    if provider.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Get master key from state
    let master_key = state.get_master_key().await;

    // Encrypt new API key
    let api_key_encrypted = crypto::encrypt(&input.api_key, &master_key)?;

    // Update API key
    let updated_provider = ProvidersRepository::update_api_key(
        &state.db,
        &input.id,
        &api_key_encrypted,
    ).await?;

    Ok(updated_provider)
}

/// Delete provider (soft delete)
#[tauri::command]
pub async fn delete_provider(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get provider to verify ownership
    let provider = ProvidersRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Provider not found".to_string()))?;

    // Verify ownership
    if provider.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Soft delete provider
    ProvidersRepository::soft_delete(&state.db, &id).await?;

    Ok(())
}
