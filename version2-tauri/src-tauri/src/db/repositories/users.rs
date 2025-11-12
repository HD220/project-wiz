use sqlx::{query_as, query, SqlitePool};
use crate::{
    db::models::User,
    errors::AppResult,
};

pub struct UsersRepository;

impl UsersRepository {
    /// Find user by ID (excluding deleted)
    pub async fn find_by_id(pool: &SqlitePool, id: &str) -> AppResult<Option<User>> {
        let user = query_as::<_, User>(
            r#"
            SELECT * FROM users
            WHERE id = ? AND deleted_at IS NULL
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    /// Find user by email (excluding deleted)
    pub async fn find_by_email(pool: &SqlitePool, email: &str) -> AppResult<Option<User>> {
        let user = query_as::<_, User>(
            r#"
            SELECT * FROM users
            WHERE email = ? AND deleted_at IS NULL
            "#,
        )
        .bind(email)
        .fetch_optional(pool)
        .await?;

        Ok(user)
    }

    /// List all users by type (excluding deleted)
    pub async fn list_by_type(
        pool: &SqlitePool,
        user_type: &str,
    ) -> AppResult<Vec<User>> {
        let users = query_as::<_, User>(
            r#"
            SELECT * FROM users
            WHERE user_type = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
            "#,
        )
        .bind(user_type)
        .fetch_all(pool)
        .await?;

        Ok(users)
    }

    /// Update user status
    pub async fn update_status(
        pool: &SqlitePool,
        id: &str,
        status: &str,
    ) -> AppResult<User> {
        let user = query_as::<_, User>(
            r#"
            UPDATE users
            SET status = ?, updated_at = unixepoch() * 1000
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(status)
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    /// Update user profile
    pub async fn update_profile(
        pool: &SqlitePool,
        id: &str,
        name: Option<&str>,
        avatar_url: Option<&str>,
    ) -> AppResult<User> {
        // Build dynamic query based on what's being updated
        let user = if let Some(n) = name {
            if let Some(a) = avatar_url {
                query_as::<_, User>(
                    r#"
                    UPDATE users
                    SET name = ?, avatar_url = ?, updated_at = unixepoch() * 1000
                    WHERE id = ? AND deleted_at IS NULL
                    RETURNING *
                    "#,
                )
                .bind(n)
                .bind(a)
                .bind(id)
                .fetch_one(pool)
                .await?
            } else {
                query_as::<_, User>(
                    r#"
                    UPDATE users
                    SET name = ?, updated_at = unixepoch() * 1000
                    WHERE id = ? AND deleted_at IS NULL
                    RETURNING *
                    "#,
                )
                .bind(n)
                .bind(id)
                .fetch_one(pool)
                .await?
            }
        } else if let Some(a) = avatar_url {
            query_as::<_, User>(
                r#"
                UPDATE users
                SET avatar_url = ?, updated_at = unixepoch() * 1000
                WHERE id = ? AND deleted_at IS NULL
                RETURNING *
                "#,
            )
            .bind(a)
            .bind(id)
            .fetch_one(pool)
            .await?
        } else {
            // Nothing to update, just return current user
            Self::find_by_id(pool, id).await?.ok_or_else(|| {
                crate::errors::AppError::NotFound("User not found".to_string())
            })?
        };

        Ok(user)
    }

    /// Soft delete user
    pub async fn soft_delete(pool: &SqlitePool, id: &str) -> AppResult<()> {
        query(
            r#"
            UPDATE users
            SET deleted_at = unixepoch() * 1000
            WHERE id = ?
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Count users by type (excluding deleted)
    pub async fn count_by_type(pool: &SqlitePool, user_type: &str) -> AppResult<i64> {
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM users
            WHERE user_type = ? AND deleted_at IS NULL
            "#,
        )
        .bind(user_type)
        .fetch_one(pool)
        .await?;

        Ok(count.0)
    }
}
