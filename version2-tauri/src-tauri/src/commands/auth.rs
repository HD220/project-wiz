use crate::db::models::{CreateUser, User};
use crate::errors::{AppError, AppResult};
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use sqlx::query_as;
use tauri::State;

// ============================================================================
// Command Input/Output Types
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct RegisterInput {
    pub name: String,
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct AuthResponse {
    pub user: User,
    pub token: String,
}

// ============================================================================
// Commands
// ============================================================================

/// Register a new human user
#[tauri::command]
pub async fn register(
    input: RegisterInput,
    state: State<'_, AppState>,
) -> AppResult<AuthResponse> {
    // Hash password
    let password_hash = bcrypt::hash(&input.password, bcrypt::DEFAULT_COST)
        .map_err(|_| AppError::Internal("Failed to hash password".to_string()))?;

    // Create user in database
    let user = query_as::<_, User>(
        r#"
        INSERT INTO users (email, password_hash, name, user_type, status)
        VALUES (?, ?, ?, 'human', 'online')
        RETURNING *
        "#,
    )
    .bind(&input.email)
    .bind(&password_hash)
    .bind(&input.name)
    .fetch_one(&state.db)
    .await?;

    // Create session (expires in 7 days)
    let expires_at = chrono::Utc::now().timestamp_millis() + (7 * 24 * 60 * 60 * 1000);
    let token = state.create_session(user.id.clone(), expires_at).await;

    // Store session in database for persistence
    sqlx::query(
        r#"
        INSERT INTO sessions (token, user_id, expires_at)
        VALUES (?, ?, ?)
        "#,
    )
    .bind(&token)
    .bind(&user.id)
    .bind(expires_at)
    .execute(&state.db)
    .await?;

    Ok(AuthResponse { user, token })
}

/// Login with email and password
#[tauri::command]
pub async fn login(
    email: String,
    password: String,
    state: State<'_, AppState>,
) -> AppResult<AuthResponse> {
    // Find user by email
    let user = query_as::<_, User>(
        r#"
        SELECT * FROM users
        WHERE email = ? AND deleted_at IS NULL AND user_type = 'human'
        "#,
    )
    .bind(&email)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::Unauthorized)?;

    // Verify password
    let password_hash = user
        .password_hash
        .as_ref()
        .ok_or(AppError::Unauthorized)?;

    let valid = bcrypt::verify(&password, password_hash)
        .map_err(|_| AppError::Internal("Failed to verify password".to_string()))?;

    if !valid {
        return Err(AppError::Unauthorized);
    }

    // Create session (expires in 7 days)
    let expires_at = chrono::Utc::now().timestamp_millis() + (7 * 24 * 60 * 60 * 1000);
    let token = state.create_session(user.id.clone(), expires_at).await;

    // Store session in database for persistence
    sqlx::query(
        r#"
        INSERT INTO sessions (token, user_id, expires_at)
        VALUES (?, ?, ?)
        "#,
    )
    .bind(&token)
    .bind(&user.id)
    .bind(expires_at)
    .execute(&state.db)
    .await?;

    Ok(AuthResponse { user, token })
}

/// Get current authenticated user
#[tauri::command]
pub async fn get_current_user(
    token: String,
    state: State<'_, AppState>,
) -> AppResult<User> {
    // Get user ID from session
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Fetch user from database
    let user = query_as::<_, User>(
        r#"
        SELECT * FROM users
        WHERE id = ? AND deleted_at IS NULL
        "#,
    )
    .bind(&user_id)
    .fetch_optional(&state.db)
    .await?
    .ok_or(AppError::Unauthorized)?;

    Ok(user)
}

/// Logout (invalidate session)
#[tauri::command]
pub async fn logout(token: String, state: State<'_, AppState>) -> AppResult<()> {
    // Remove from in-memory store
    state.remove_session(&token).await;

    // Remove from database
    sqlx::query("DELETE FROM sessions WHERE token = ?")
        .bind(&token)
        .execute(&state.db)
        .await?;

    Ok(())
}
