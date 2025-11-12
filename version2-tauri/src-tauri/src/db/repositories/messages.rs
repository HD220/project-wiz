use sqlx::{query_as, query, SqlitePool};
use crate::{
    db::models::Message,
    errors::AppResult,
};

pub struct MessagesRepository;

impl MessagesRepository {
    /// Create message
    pub async fn create(
        pool: &SqlitePool,
        conversation_id: &str,
        author_id: &str,
        content: &str,
        metadata: Option<&str>,
    ) -> AppResult<Message> {
        let message = query_as::<_, Message>(
            r#"
            INSERT INTO messages
            (conversation_id, author_id, content, metadata)
            VALUES (?, ?, ?, ?)
            RETURNING *
            "#,
        )
        .bind(conversation_id)
        .bind(author_id)
        .bind(content)
        .bind(metadata)
        .fetch_one(pool)
        .await?;

        Ok(message)
    }

    /// Find message by ID (excluding deleted)
    pub async fn find_by_id(
        pool: &SqlitePool,
        id: &str,
    ) -> AppResult<Option<Message>> {
        let message = query_as::<_, Message>(
            r#"
            SELECT * FROM messages
            WHERE id = ? AND deleted_at IS NULL
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(message)
    }

    /// List messages in conversation (excluding deleted, chronological)
    pub async fn list_by_conversation(
        pool: &SqlitePool,
        conversation_id: &str,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> AppResult<Vec<Message>> {
        let messages = if let Some(l) = limit {
            let o = offset.unwrap_or(0);
            query_as::<_, Message>(
                r#"
                SELECT * FROM messages
                WHERE conversation_id = ? AND deleted_at IS NULL
                ORDER BY created_at ASC
                LIMIT ? OFFSET ?
                "#,
            )
            .bind(conversation_id)
            .bind(l)
            .bind(o)
            .fetch_all(pool)
            .await?
        } else {
            query_as::<_, Message>(
                r#"
                SELECT * FROM messages
                WHERE conversation_id = ? AND deleted_at IS NULL
                ORDER BY created_at ASC
                "#,
            )
            .bind(conversation_id)
            .fetch_all(pool)
            .await?
        };

        Ok(messages)
    }

    /// Get conversation history (last N messages)
    pub async fn get_history(
        pool: &SqlitePool,
        conversation_id: &str,
        last_n: i64,
    ) -> AppResult<Vec<Message>> {
        let messages = query_as::<_, Message>(
            r#"
            SELECT * FROM messages
            WHERE conversation_id = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT ?
            "#,
        )
        .bind(conversation_id)
        .bind(last_n)
        .fetch_all(pool)
        .await?;

        // Reverse to get chronological order
        Ok(messages.into_iter().rev().collect())
    }

    /// Get latest message in conversation
    pub async fn get_latest(
        pool: &SqlitePool,
        conversation_id: &str,
    ) -> AppResult<Option<Message>> {
        let message = query_as::<_, Message>(
            r#"
            SELECT * FROM messages
            WHERE conversation_id = ? AND deleted_at IS NULL
            ORDER BY created_at DESC
            LIMIT 1
            "#,
        )
        .bind(conversation_id)
        .fetch_optional(pool)
        .await?;

        Ok(message)
    }

    /// List messages by author
    pub async fn list_by_author(
        pool: &SqlitePool,
        author_id: &str,
        limit: Option<i64>,
    ) -> AppResult<Vec<Message>> {
        let messages = if let Some(l) = limit {
            query_as::<_, Message>(
                r#"
                SELECT * FROM messages
                WHERE author_id = ? AND deleted_at IS NULL
                ORDER BY created_at DESC
                LIMIT ?
                "#,
            )
            .bind(author_id)
            .bind(l)
            .fetch_all(pool)
            .await?
        } else {
            query_as::<_, Message>(
                r#"
                SELECT * FROM messages
                WHERE author_id = ? AND deleted_at IS NULL
                ORDER BY created_at DESC
                "#,
            )
            .bind(author_id)
            .fetch_all(pool)
            .await?
        };

        Ok(messages)
    }

    /// Update message content (marks as edited)
    pub async fn update_content(
        pool: &SqlitePool,
        id: &str,
        content: &str,
    ) -> AppResult<Message> {
        let message = query_as::<_, Message>(
            r#"
            UPDATE messages
            SET content = ?, edited_at = unixepoch() * 1000
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(content)
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(message)
    }

    /// Update message metadata (e.g., token count)
    pub async fn update_metadata(
        pool: &SqlitePool,
        id: &str,
        metadata: &str,
    ) -> AppResult<Message> {
        let message = query_as::<_, Message>(
            r#"
            UPDATE messages
            SET metadata = ?
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(metadata)
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(message)
    }

    /// Soft delete message
    pub async fn soft_delete(pool: &SqlitePool, id: &str) -> AppResult<()> {
        query(
            r#"
            UPDATE messages
            SET deleted_at = unixepoch() * 1000
            WHERE id = ?
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Count messages in conversation
    pub async fn count_by_conversation(
        pool: &SqlitePool,
        conversation_id: &str,
    ) -> AppResult<i64> {
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM messages
            WHERE conversation_id = ? AND deleted_at IS NULL
            "#,
        )
        .bind(conversation_id)
        .fetch_one(pool)
        .await?;

        Ok(count.0)
    }

    /// Search messages by content
    pub async fn search(
        pool: &SqlitePool,
        conversation_id: &str,
        search_term: &str,
        limit: Option<i64>,
    ) -> AppResult<Vec<Message>> {
        let search_pattern = format!("%{}%", search_term);
        let messages = if let Some(l) = limit {
            query_as::<_, Message>(
                r#"
                SELECT * FROM messages
                WHERE conversation_id = ?
                  AND content LIKE ?
                  AND deleted_at IS NULL
                ORDER BY created_at DESC
                LIMIT ?
                "#,
            )
            .bind(conversation_id)
            .bind(search_pattern)
            .bind(l)
            .fetch_all(pool)
            .await?
        } else {
            query_as::<_, Message>(
                r#"
                SELECT * FROM messages
                WHERE conversation_id = ?
                  AND content LIKE ?
                  AND deleted_at IS NULL
                ORDER BY created_at DESC
                "#,
            )
            .bind(conversation_id)
            .bind(search_pattern)
            .fetch_all(pool)
            .await?
        };

        Ok(messages)
    }
}
