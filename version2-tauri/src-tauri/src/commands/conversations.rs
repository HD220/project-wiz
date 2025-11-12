use crate::db::models::Conversation;
use crate::db::repositories::ConversationsRepository;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

// ============================================================================
// Command Input/Output Types
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct CreateConversationInput {
    pub project_id: Option<String>,
    pub conversation_type: String,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateConversationInput {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ParticipantInput {
    pub conversation_id: String,
    pub user_id: String,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn validate_create_conversation_input(input: &CreateConversationInput) -> AppResult<()> {
    // Validate conversation type
    let valid_types = ["channel", "dm"];
    if !valid_types.contains(&input.conversation_type.as_str()) {
        return Err(AppError::Validation(
            "Invalid conversation type. Must be 'channel' or 'dm'".to_string()
        ));
    }

    // Channel type requires a name
    if input.conversation_type == "channel" {
        if let Some(name) = &input.name {
            if name.trim().is_empty() {
                return Err(AppError::Validation("Channel name is required".to_string()));
            }
        } else {
            return Err(AppError::Validation("Channel name is required".to_string()));
        }
    }

    Ok(())
}

// ============================================================================
// Commands
// ============================================================================

/// Create a new conversation
#[tauri::command]
pub async fn create_conversation(
    input: CreateConversationInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Conversation> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Validate input
    validate_create_conversation_input(&input)?;

    // Create conversation
    let conversation = ConversationsRepository::create(
        &state.db,
        &user_id,
        input.project_id.as_deref(),
        &input.conversation_type,
        input.name.as_deref(),
        input.description.as_deref(),
    ).await?;

    // Add creator as participant
    ConversationsRepository::add_participant(
        &state.db,
        &conversation.id,
        &user_id,
    ).await?;

    Ok(conversation)
}

/// List all conversations for the current user
#[tauri::command]
pub async fn list_conversations(
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Vec<Conversation>> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // List conversations where user is a participant
    let conversations = ConversationsRepository::list_by_participant(&state.db, &user_id).await?;

    Ok(conversations)
}

/// Get conversation by ID
#[tauri::command]
pub async fn get_conversation(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Conversation> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get conversation
    let conversation = ConversationsRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Conversation not found".to_string()))?;

    // Verify user is participant or owner
    let is_participant = ConversationsRepository::is_participant(&state.db, &id, &user_id).await?;
    if !is_participant && conversation.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    Ok(conversation)
}

/// Update conversation
#[tauri::command]
pub async fn update_conversation(
    input: UpdateConversationInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Conversation> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get conversation to verify ownership
    let conversation = ConversationsRepository::find_by_id(&state.db, &input.id)
        .await?
        .ok_or(AppError::NotFound("Conversation not found".to_string()))?;

    // Verify ownership
    if conversation.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Update conversation
    let updated_conversation = ConversationsRepository::update(
        &state.db,
        &input.id,
        input.name.as_deref(),
        input.description.as_deref(),
    ).await?;

    Ok(updated_conversation)
}

/// Archive a conversation
#[tauri::command]
pub async fn archive_conversation(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Conversation> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get conversation to verify ownership
    let conversation = ConversationsRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Conversation not found".to_string()))?;

    // Verify ownership
    if conversation.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Archive conversation
    let archived_conversation = ConversationsRepository::archive(&state.db, &id).await?;

    Ok(archived_conversation)
}

/// Delete conversation (soft delete)
#[tauri::command]
pub async fn delete_conversation(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get conversation to verify ownership
    let conversation = ConversationsRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Conversation not found".to_string()))?;

    // Verify ownership
    if conversation.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Soft delete conversation
    ConversationsRepository::soft_delete(&state.db, &id).await?;

    Ok(())
}

/// Add participant to conversation
#[tauri::command]
pub async fn add_participant(
    input: ParticipantInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get conversation to verify ownership
    let conversation = ConversationsRepository::find_by_id(&state.db, &input.conversation_id)
        .await?
        .ok_or(AppError::NotFound("Conversation not found".to_string()))?;

    // Verify ownership
    if conversation.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Add participant
    ConversationsRepository::add_participant(
        &state.db,
        &input.conversation_id,
        &input.user_id,
    ).await?;

    Ok(())
}

/// Remove participant from conversation
#[tauri::command]
pub async fn remove_participant(
    input: ParticipantInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get conversation to verify ownership
    let conversation = ConversationsRepository::find_by_id(&state.db, &input.conversation_id)
        .await?
        .ok_or(AppError::NotFound("Conversation not found".to_string()))?;

    // Verify ownership
    if conversation.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Remove participant
    ConversationsRepository::remove_participant(
        &state.db,
        &input.conversation_id,
        &input.user_id,
    ).await?;

    Ok(())
}
