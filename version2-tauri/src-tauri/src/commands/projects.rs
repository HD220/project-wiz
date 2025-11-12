use crate::db::models::Project;
use crate::db::repositories::ProjectsRepository;
use crate::errors::{AppError, AppResult};
use crate::state::AppState;
use serde::{Deserialize, Serialize};
use tauri::State;

// ============================================================================
// Command Input/Output Types
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct CreateProjectInput {
    pub name: String,
    pub description: Option<String>,
    pub avatar_url: Option<String>,
    pub git_url: Option<String>,
    pub git_branch: Option<String>,
    pub local_path: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectInput {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub avatar_url: Option<String>,
    pub git_url: Option<String>,
    pub git_branch: Option<String>,
    pub local_path: Option<String>,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn validate_create_project_input(input: &CreateProjectInput) -> AppResult<()> {
    if input.name.trim().is_empty() {
        return Err(AppError::Validation("Project name is required".to_string()));
    }

    if input.name.len() > 100 {
        return Err(AppError::Validation("Project name too long (max 100 characters)".to_string()));
    }

    if input.local_path.trim().is_empty() {
        return Err(AppError::Validation("Local path is required".to_string()));
    }

    // Validate git URL format if provided
    if let Some(git_url) = &input.git_url {
        if !git_url.trim().is_empty() {
            // Basic validation for git URL
            if !git_url.starts_with("http://")
                && !git_url.starts_with("https://")
                && !git_url.starts_with("git@") {
                return Err(AppError::Validation(
                    "Git URL must start with http://, https://, or git@".to_string()
                ));
            }
        }
    }

    Ok(())
}

// ============================================================================
// Commands
// ============================================================================

/// Create a new project
#[tauri::command]
pub async fn create_project(
    input: CreateProjectInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Project> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Validate input
    validate_create_project_input(&input)?;

    // Create project
    let project = ProjectsRepository::create(
        &state.db,
        &user_id,
        &input.name,
        input.description.as_deref(),
        input.avatar_url.as_deref(),
        input.git_url.as_deref(),
        input.git_branch.as_deref(),
        &input.local_path,
    ).await?;

    Ok(project)
}

/// List all projects for the current user
#[tauri::command]
pub async fn list_projects(
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Vec<Project>> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // List projects (excluding archived and deleted)
    let projects = ProjectsRepository::list_by_owner(&state.db, &user_id, false).await?;

    Ok(projects)
}

/// Get project by ID
#[tauri::command]
pub async fn get_project(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Project> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get project
    let project = ProjectsRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Project not found".to_string()))?;

    // Verify ownership
    if project.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    Ok(project)
}

/// Update project configuration
#[tauri::command]
pub async fn update_project(
    input: UpdateProjectInput,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Project> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get project to verify ownership
    let project = ProjectsRepository::find_by_id(&state.db, &input.id)
        .await?
        .ok_or(AppError::NotFound("Project not found".to_string()))?;

    // Verify ownership
    if project.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Validate git URL if provided
    if let Some(git_url) = &input.git_url {
        if !git_url.trim().is_empty() {
            if !git_url.starts_with("http://")
                && !git_url.starts_with("https://")
                && !git_url.starts_with("git@") {
                return Err(AppError::Validation(
                    "Git URL must start with http://, https://, or git@".to_string()
                ));
            }
        }
    }

    // Update project
    let updated_project = ProjectsRepository::update(
        &state.db,
        &input.id,
        input.name.as_deref(),
        input.description.as_deref(),
        input.avatar_url.as_deref(),
        input.git_url.as_deref(),
        input.git_branch.as_deref(),
        input.local_path.as_deref(),
    ).await?;

    Ok(updated_project)
}

/// Archive a project
#[tauri::command]
pub async fn archive_project(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Project> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get project to verify ownership
    let project = ProjectsRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Project not found".to_string()))?;

    // Verify ownership
    if project.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Archive project
    let archived_project = ProjectsRepository::archive(&state.db, &id).await?;

    Ok(archived_project)
}

/// Unarchive a project
#[tauri::command]
pub async fn unarchive_project(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<Project> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get project to verify ownership
    let project = ProjectsRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Project not found".to_string()))?;

    // Verify ownership
    if project.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Unarchive project
    let unarchived_project = ProjectsRepository::unarchive(&state.db, &id).await?;

    Ok(unarchived_project)
}

/// Delete project (soft delete)
#[tauri::command]
pub async fn delete_project(
    id: String,
    token: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    // Authenticate
    let user_id = state
        .get_current_user(&token)
        .await
        .ok_or(AppError::Unauthorized)?;

    // Get project to verify ownership
    let project = ProjectsRepository::find_by_id(&state.db, &id)
        .await?
        .ok_or(AppError::NotFound("Project not found".to_string()))?;

    // Verify ownership
    if project.owner_id != user_id {
        return Err(AppError::Forbidden);
    }

    // Soft delete project
    ProjectsRepository::soft_delete(&state.db, &id).await?;

    Ok(())
}
