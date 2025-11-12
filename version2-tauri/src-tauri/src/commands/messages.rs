use crate::db::models::Message;
use crate::db::repositories::{MessagesRepository, ConversationsRepository, ProvidersRepository, AgentsRepository};
use crate::errors::{AppError, AppResult};
use crate::state::AppState;
use crate::services::llm::{LlmService, messages_to_chat_messages};
use serde::{Deserialize, Serialize};
use tauri::State;
use tauri::ipc::Channel;
use futures::StreamExt;

// ============================================================================
// Command Input/Output Types
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct CreateMessageInput {
    pub conversation_id: String,
    pub content: String,
    pub metadata: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ListMessagesInput {
    pub conversation_id: String,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateMessageInput {
    pub id: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
pub struct SearchMessagesInput {
    pub conversation_id: String,
    pub search_term: String,
    pub limit: Option<i64>,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn validate_create_message_input(input: &CreateMessageInput) -> AppResult<()> {
    if input.content.trim().is_empty() {
        return Err(AppError::Validation("Message content is required".to_string()));
    }

    if input.content.len() > 50000 {
        return Err(AppError::Validation("Message content too long (max 50,000 characters)".to_string()));
    }

    Ok(())
}

fn validate_update_message_input(input: &UpdateMessageInput) -> AppResult<()> {
    if input.content.trim().is_empty() {
        return Err(AppError::Validation("Message content is required".to_string()));
    }

    if input.content.len() > 50000 {
        return Err(AppError::Validation("Message content too long (max 50,000 characters)".to_string()));
    }

    Ok(())
}

// ============================================================================
// Commands
// ============================================================================

/// Create a new message in a conversation
#[tauri::command]
pub async fn create_message(
    input: CreateMessageInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Message> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Validate input
    validate_create_message_input(&input)?;

    // Verify user is participant in the conversation
    let is_participant = ConversationsRepository::is_participant(
        &state.db,
        &input.conversation_id,
        &user_id,
    ).await?;

    if !is_participant {
        return Err(AppError::Forbidden);
    }

    // Create message
    let message = MessagesRepository::create(
        &state.db,
        &input.conversation_id,
        &user_id,
        &input.content,
        input.metadata.as_deref(),
    ).await?;

    Ok(message)
}

/// List messages in a conversation (paginated)
#[tauri::command]
pub async fn list_messages(
    input: ListMessagesInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Vec<Message>> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Verify user is participant in the conversation
    let is_participant = ConversationsRepository::is_participant(
        &state.db,
        &input.conversation_id,
        &user_id,
    ).await?;

    if !is_participant {
        return Err(AppError::Forbidden);
    }

    // List messages
    let messages = MessagesRepository::list_by_conversation(
        &state.db,
        &input.conversation_id,
        input.limit,
        input.offset,
    ).await?;

    Ok(messages)
}

/// Get message by ID
#[tauri::command]
pub async fn get_message(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Message> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get message
    let message = MessagesRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Message not found".to_string()))?;

    // Verify user is participant in the conversation
    let is_participant = ConversationsRepository::is_participant(
        &state.db,
        &message.conversation_id,
        &user_id,
    ).await?;

    if !is_participant {
        return Err(AppError::Forbidden);
    }

    Ok(message)
}

/// Update message content
#[tauri::command]
pub async fn update_message(
    input: UpdateMessageInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Message> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Validate input
    validate_update_message_input(&input)?;

    // Get message to verify authorship
    let message = MessagesRepository::find_by_id(&state.db, &input.id)
        .await?
        .ok_or(AppError::NotFound("Message not found".to_string()))?;

    // Verify authorship (only author can edit)
    if message.author_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Update message
    let updated_message = MessagesRepository::update_content(
        &state.db,
        &input.id,
        &input.content,
    ).await?;

    Ok(updated_message)
}

/// Delete message (soft delete)
#[tauri::command]
pub async fn delete_message(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get message to verify authorship
    let message = MessagesRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Message not found".to_string()))?;

    // Verify authorship (only author can delete)
    if message.author_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Soft delete message
    MessagesRepository::soft_delete(&state.db, &id).await?;

    Ok(())
}

/// Search messages in a conversation
#[tauri::command]
pub async fn search_messages(
    input: SearchMessagesInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Vec<Message>> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Verify user is participant in the conversation
    let is_participant = ConversationsRepository::is_participant(
        &state.db,
        &input.conversation_id,
        &user_id,
    ).await?;

    if !is_participant {
        return Err(AppError::Forbidden);
    }

    // Search messages
    let messages = MessagesRepository::search(
        &state.db,
        &input.conversation_id,
        &input.search_term,
        input.limit,
    ).await?;

    Ok(messages)
}

/// Get conversation history (last N messages)
#[tauri::command]
pub async fn get_message_history(
    conversation_id: String,
    last_n: i64,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Vec<Message>> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Verify user is participant in the conversation
    let is_participant = ConversationsRepository::is_participant(
        &state.db,
        &conversation_id,
        &user_id,
    ).await?;

    if !is_participant {
        return Err(AppError::Forbidden);
    }

    // Validate last_n
    if last_n <= 0 {
        return Err(AppError::Validation("last_n must be positive".to_string()));
    }

    if last_n > 1000 {
        return Err(AppError::Validation("last_n cannot exceed 1000".to_string()));
    }

    // Get history
    let messages = MessagesRepository::get_history(
        &state.db,
        &conversation_id,
        last_n,
    ).await?;

    Ok(messages)
}

/// Send message with streaming LLM response
#[tauri::command]
pub async fn send_message_streaming(
    conversation_id: String,
    content: String,
    agent_id: String, // Which agent should respond
    on_chunk: Channel<String>,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Message> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Verify user is participant in the conversation
    let is_participant = ConversationsRepository::is_participant(
        &state.db,
        &conversation_id,
        &user_id,
    ).await?;

    if !is_participant {
        return Err(AppError::Forbidden);
    }

    // Validate input
    if content.trim().is_empty() {
        return Err(AppError::Validation("Message content is required".to_string()));
    }

    // 1. Save user message
    let user_message = MessagesRepository::create(
        &state.db,
        &conversation_id,
        &user_id,
        &content,
        None,
    ).await?;

    // 2. Get conversation history for context
    let history = MessagesRepository::get_history(
        &state.db,
        &conversation_id,
        50, // Last 50 messages for context
    ).await?;

    // Convert to chat messages
    let chat_messages = messages_to_chat_messages(history);

    // 3. Get agent configuration
    let agent = AgentsRepository::find_by_id(&state.db, &agent_id)
        .await?
        .ok_or(AppError::NotFound("Agent not found".to_string()))?;

    // 4. Get LLM provider
    let provider = ProvidersRepository::find_by_id(&state.db, &agent.config.llm_provider_id)
        .await?
        .ok_or(AppError::NotFound("Provider not found".to_string()))?;

    // 5. Create LLM service and stream response
    let llm_service = LlmService::new();
    let master_key = state.get_master_key().await;

    let mut stream = llm_service
        .stream_completion(&provider, chat_messages, &master_key)
        .await?;

    // 6. Stream chunks to frontend and accumulate
    let mut full_response = String::new();

    while let Some(result) = stream.next().await {
        match result {
            Ok(chunk) => {
                full_response.push_str(&chunk);

                // Send chunk to frontend
                if let Err(e) = on_chunk.send(chunk) {
                    eprintln!("Failed to send chunk: {}", e);
                    // Continue even if send fails (frontend may have disconnected)
                }
            }
            Err(e) => {
                // On error, send what we have so far and return error
                return Err(e);
            }
        }
    }

    // 7. Save AI response
    let ai_message = MessagesRepository::create(
        &state.db,
        &conversation_id,
        &agent_id,
        &full_response,
        None, // TODO: Add metadata (token count, model, etc.)
    ).await?;

    Ok(ai_message)
}
