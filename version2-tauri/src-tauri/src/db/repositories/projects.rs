use sqlx::{query_as, query, SqlitePool};
use crate::{
    db::models::Project,
    errors::AppResult,
};

pub struct ProjectsRepository;

impl ProjectsRepository {
    /// Create project
    pub async fn create(
        pool: &SqlitePool,
        owner_id: &str,
        name: &str,
        description: Option<&str>,
        avatar_url: Option<&str>,
        git_url: Option<&str>,
        git_branch: Option<&str>,
        local_path: &str,
    ) -> AppResult<Project> {
        let project = query_as::<_, Project>(
            r#"
            INSERT INTO projects
            (owner_id, name, description, avatar_url, git_url, git_branch, local_path)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            "#,
        )
        .bind(owner_id)
        .bind(name)
        .bind(description)
        .bind(avatar_url)
        .bind(git_url)
        .bind(git_branch.or(Some("main")))
        .bind(local_path)
        .fetch_one(pool)
        .await?;

        Ok(project)
    }

    /// Find project by ID (excluding deleted)
    pub async fn find_by_id(
        pool: &SqlitePool,
        id: &str,
    ) -> AppResult<Option<Project>> {
        let project = query_as::<_, Project>(
            r#"
            SELECT * FROM projects
            WHERE id = ? AND deleted_at IS NULL
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(project)
    }

    /// List all projects by owner (excluding deleted, including archived)
    pub async fn list_by_owner(
        pool: &SqlitePool,
        owner_id: &str,
        include_archived: bool,
    ) -> AppResult<Vec<Project>> {
        let projects = if include_archived {
            query_as::<_, Project>(
                r#"
                SELECT * FROM projects
                WHERE owner_id = ? AND deleted_at IS NULL
                ORDER BY archived_at IS NULL DESC, updated_at DESC
                "#,
            )
            .bind(owner_id)
            .fetch_all(pool)
            .await?
        } else {
            query_as::<_, Project>(
                r#"
                SELECT * FROM projects
                WHERE owner_id = ? AND archived_at IS NULL AND deleted_at IS NULL
                ORDER BY updated_at DESC
                "#,
            )
            .bind(owner_id)
            .fetch_all(pool)
            .await?
        };

        Ok(projects)
    }

    /// Update project metadata
    pub async fn update(
        pool: &SqlitePool,
        id: &str,
        name: Option<&str>,
        description: Option<&str>,
        avatar_url: Option<&str>,
        git_url: Option<&str>,
        git_branch: Option<&str>,
        local_path: Option<&str>,
    ) -> AppResult<Project> {
        // For simplicity, update all fields with COALESCE
        let project = query_as::<_, Project>(
            r#"
            UPDATE projects
            SET
                name = COALESCE(?, name),
                description = COALESCE(?, description),
                avatar_url = COALESCE(?, avatar_url),
                git_url = COALESCE(?, git_url),
                git_branch = COALESCE(?, git_branch),
                local_path = COALESCE(?, local_path),
                updated_at = unixepoch() * 1000
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(name)
        .bind(description)
        .bind(avatar_url)
        .bind(git_url)
        .bind(git_branch)
        .bind(local_path)
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(project)
    }

    /// Archive project
    pub async fn archive(pool: &SqlitePool, id: &str) -> AppResult<Project> {
        let project = query_as::<_, Project>(
            r#"
            UPDATE projects
            SET archived_at = unixepoch() * 1000
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(project)
    }

    /// Unarchive project
    pub async fn unarchive(pool: &SqlitePool, id: &str) -> AppResult<Project> {
        let project = query_as::<_, Project>(
            r#"
            UPDATE projects
            SET archived_at = NULL
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(project)
    }

    /// Soft delete project
    pub async fn soft_delete(pool: &SqlitePool, id: &str) -> AppResult<()> {
        query(
            r#"
            UPDATE projects
            SET deleted_at = unixepoch() * 1000
            WHERE id = ?
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Count projects by owner
    pub async fn count_by_owner(
        pool: &SqlitePool,
        owner_id: &str,
    ) -> AppResult<i64> {
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM projects
            WHERE owner_id = ? AND deleted_at IS NULL AND archived_at IS NULL
            "#,
        )
        .bind(owner_id)
        .fetch_one(pool)
        .await?;

        Ok(count.0)
    }

    /// Search projects by name (for owner)
    pub async fn search_by_name(
        pool: &SqlitePool,
        owner_id: &str,
        search_term: &str,
    ) -> AppResult<Vec<Project>> {
        let search_pattern = format!("%{}%", search_term);
        let projects = query_as::<_, Project>(
            r#"
            SELECT * FROM projects
            WHERE owner_id = ?
              AND name LIKE ?
              AND deleted_at IS NULL
            ORDER BY updated_at DESC
            "#,
        )
        .bind(owner_id)
        .bind(search_pattern)
        .fetch_all(pool)
        .await?;

        Ok(projects)
    }
}
