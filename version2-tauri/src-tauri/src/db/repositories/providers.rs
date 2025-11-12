use sqlx::{query_as, query, SqlitePool};
use crate::{
    db::models::LlmProvider,
    errors::AppResult,
};

pub struct ProvidersRepository;

impl ProvidersRepository {
    /// Create LLM provider
    /// Note: api_key_encrypted should be encrypted BEFORE calling this
    pub async fn create(
        pool: &SqlitePool,
        owner_id: &str,
        name: &str,
        provider_type: &str,
        api_key_encrypted: &[u8],
        base_url: Option<&str>,
        is_default: bool,
    ) -> AppResult<LlmProvider> {
        let provider = query_as::<_, LlmProvider>(
            r#"
            INSERT INTO llm_providers
            (owner_id, name, provider_type, api_key_encrypted, base_url, is_default)
            VALUES (?, ?, ?, ?, ?, ?)
            RETURNING *
            "#,
        )
        .bind(owner_id)
        .bind(name)
        .bind(provider_type)
        .bind(api_key_encrypted)
        .bind(base_url)
        .bind(if is_default { 1 } else { 0 })
        .fetch_one(pool)
        .await?;

        Ok(provider)
    }

    /// Find provider by ID (excluding deleted)
    pub async fn find_by_id(
        pool: &SqlitePool,
        id: &str,
    ) -> AppResult<Option<LlmProvider>> {
        let provider = query_as::<_, LlmProvider>(
            r#"
            SELECT * FROM llm_providers
            WHERE id = ? AND deleted_at IS NULL
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(provider)
    }

    /// List all providers by owner (excluding deleted)
    pub async fn list_by_owner(
        pool: &SqlitePool,
        owner_id: &str,
    ) -> AppResult<Vec<LlmProvider>> {
        let providers = query_as::<_, LlmProvider>(
            r#"
            SELECT * FROM llm_providers
            WHERE owner_id = ? AND deleted_at IS NULL
            ORDER BY is_default DESC, created_at DESC
            "#,
        )
        .bind(owner_id)
        .fetch_all(pool)
        .await?;

        Ok(providers)
    }

    /// Find default provider by owner
    pub async fn find_default_by_owner(
        pool: &SqlitePool,
        owner_id: &str,
    ) -> AppResult<Option<LlmProvider>> {
        let provider = query_as::<_, LlmProvider>(
            r#"
            SELECT * FROM llm_providers
            WHERE owner_id = ? AND is_default = 1 AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1
            "#,
        )
        .bind(owner_id)
        .fetch_optional(pool)
        .await?;

        Ok(provider)
    }

    /// Update provider (name, base_url, or set as default)
    pub async fn update(
        pool: &SqlitePool,
        id: &str,
        name: Option<&str>,
        base_url: Option<&str>,
        set_as_default: Option<bool>,
    ) -> AppResult<LlmProvider> {
        // Build query dynamically based on what's being updated
        let provider = if let Some(n) = name {
            if let Some(b) = base_url {
                if let Some(d) = set_as_default {
                    query_as::<_, LlmProvider>(
                        r#"
                        UPDATE llm_providers
                        SET name = ?, base_url = ?, is_default = ?
                        WHERE id = ? AND deleted_at IS NULL
                        RETURNING *
                        "#,
                    )
                    .bind(n)
                    .bind(b)
                    .bind(if d { 1 } else { 0 })
                    .bind(id)
                    .fetch_one(pool)
                    .await?
                } else {
                    query_as::<_, LlmProvider>(
                        r#"
                        UPDATE llm_providers
                        SET name = ?, base_url = ?
                        WHERE id = ? AND deleted_at IS NULL
                        RETURNING *
                        "#,
                    )
                    .bind(n)
                    .bind(b)
                    .bind(id)
                    .fetch_one(pool)
                    .await?
                }
            } else {
                query_as::<_, LlmProvider>(
                    r#"
                    UPDATE llm_providers
                    SET name = ?
                    WHERE id = ? AND deleted_at IS NULL
                    RETURNING *
                    "#,
                )
                .bind(n)
                .bind(id)
                .fetch_one(pool)
                .await?
            }
        } else if let Some(d) = set_as_default {
            query_as::<_, LlmProvider>(
                r#"
                UPDATE llm_providers
                SET is_default = ?
                WHERE id = ? AND deleted_at IS NULL
                RETURNING *
                "#,
            )
            .bind(if d { 1 } else { 0 })
            .bind(id)
            .fetch_one(pool)
            .await?
        } else {
            // Nothing to update
            Self::find_by_id(pool, id).await?.ok_or_else(|| {
                crate::errors::AppError::NotFound("Provider not found".to_string())
            })?
        };

        Ok(provider)
    }

    /// Update API key (encrypted)
    pub async fn update_api_key(
        pool: &SqlitePool,
        id: &str,
        api_key_encrypted: &[u8],
    ) -> AppResult<LlmProvider> {
        let provider = query_as::<_, LlmProvider>(
            r#"
            UPDATE llm_providers
            SET api_key_encrypted = ?
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(api_key_encrypted)
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(provider)
    }

    /// Unset default flag for all providers of an owner (used before setting new default)
    pub async fn unset_all_defaults(
        pool: &SqlitePool,
        owner_id: &str,
    ) -> AppResult<()> {
        query(
            r#"
            UPDATE llm_providers
            SET is_default = 0
            WHERE owner_id = ? AND deleted_at IS NULL
            "#,
        )
        .bind(owner_id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Soft delete provider
    pub async fn soft_delete(pool: &SqlitePool, id: &str) -> AppResult<()> {
        query(
            r#"
            UPDATE llm_providers
            SET deleted_at = unixepoch() * 1000
            WHERE id = ?
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Count providers by owner
    pub async fn count_by_owner(pool: &SqlitePool, owner_id: &str) -> AppResult<i64> {
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM llm_providers
            WHERE owner_id = ? AND deleted_at IS NULL
            "#,
        )
        .bind(owner_id)
        .fetch_one(pool)
        .await?;

        Ok(count.0)
    }
}
