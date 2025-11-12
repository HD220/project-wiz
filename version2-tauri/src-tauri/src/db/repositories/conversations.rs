use sqlx::{query_as, query, SqlitePool};
use crate::{
    db::models::{Conversation, ConversationParticipant},
    errors::AppResult,
};

pub struct ConversationsRepository;

impl ConversationsRepository {
    /// Create conversation
    pub async fn create(
        pool: &SqlitePool,
        owner_id: &str,
        project_id: Option<&str>,
        conversation_type: &str,
        name: Option<&str>,
        description: Option<&str>,
    ) -> AppResult<Conversation> {
        let conversation = query_as::<_, Conversation>(
            r#"
            INSERT INTO conversations
            (owner_id, project_id, conversation_type, name, description)
            VALUES (?, ?, ?, ?, ?)
            RETURNING *
            "#,
        )
        .bind(owner_id)
        .bind(project_id)
        .bind(conversation_type)
        .bind(name)
        .bind(description)
        .fetch_one(pool)
        .await?;

        Ok(conversation)
    }

    /// Find conversation by ID (excluding deleted)
    pub async fn find_by_id(
        pool: &SqlitePool,
        id: &str,
    ) -> AppResult<Option<Conversation>> {
        let conversation = query_as::<_, Conversation>(
            r#"
            SELECT * FROM conversations
            WHERE id = ? AND deleted_at IS NULL
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(conversation)
    }

    /// List conversations by owner (excluding deleted)
    pub async fn list_by_owner(
        pool: &SqlitePool,
        owner_id: &str,
        include_archived: bool,
    ) -> AppResult<Vec<Conversation>> {
        let conversations = if include_archived {
            query_as::<_, Conversation>(
                r#"
                SELECT * FROM conversations
                WHERE owner_id = ? AND deleted_at IS NULL
                ORDER BY archived_at IS NULL DESC, created_at DESC
                "#,
            )
            .bind(owner_id)
            .fetch_all(pool)
            .await?
        } else {
            query_as::<_, Conversation>(
                r#"
                SELECT * FROM conversations
                WHERE owner_id = ? AND archived_at IS NULL AND deleted_at IS NULL
                ORDER BY created_at DESC
                "#,
            )
            .bind(owner_id)
            .fetch_all(pool)
            .await?
        };

        Ok(conversations)
    }

    /// List conversations by project
    pub async fn list_by_project(
        pool: &SqlitePool,
        project_id: &str,
    ) -> AppResult<Vec<Conversation>> {
        let conversations = query_as::<_, Conversation>(
            r#"
            SELECT * FROM conversations
            WHERE project_id = ? AND deleted_at IS NULL AND archived_at IS NULL
            ORDER BY created_at DESC
            "#,
        )
        .bind(project_id)
        .fetch_all(pool)
        .await?;

        Ok(conversations)
    }

    /// List conversations where user is participant
    pub async fn list_by_participant(
        pool: &SqlitePool,
        user_id: &str,
    ) -> AppResult<Vec<Conversation>> {
        let conversations = query_as::<_, Conversation>(
            r#"
            SELECT c.* FROM conversations c
            INNER JOIN conversation_participants cp ON c.id = cp.conversation_id
            WHERE cp.user_id = ? AND c.deleted_at IS NULL AND c.archived_at IS NULL
            ORDER BY c.created_at DESC
            "#,
        )
        .bind(user_id)
        .fetch_all(pool)
        .await?;

        Ok(conversations)
    }

    /// Update conversation
    pub async fn update(
        pool: &SqlitePool,
        id: &str,
        name: Option<&str>,
        description: Option<&str>,
    ) -> AppResult<Conversation> {
        let conversation = query_as::<_, Conversation>(
            r#"
            UPDATE conversations
            SET
                name = COALESCE(?, name),
                description = COALESCE(?, description)
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(name)
        .bind(description)
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(conversation)
    }

    /// Archive conversation
    pub async fn archive(pool: &SqlitePool, id: &str) -> AppResult<Conversation> {
        let conversation = query_as::<_, Conversation>(
            r#"
            UPDATE conversations
            SET archived_at = unixepoch() * 1000
            WHERE id = ? AND deleted_at IS NULL
            RETURNING *
            "#,
        )
        .bind(id)
        .fetch_one(pool)
        .await?;

        Ok(conversation)
    }

    /// Soft delete conversation
    pub async fn soft_delete(pool: &SqlitePool, id: &str) -> AppResult<()> {
        query(
            r#"
            UPDATE conversations
            SET deleted_at = unixepoch() * 1000
            WHERE id = ?
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        Ok(())
    }

    // ========================================================================
    // Participant Management
    // ========================================================================

    /// Add participant to conversation
    pub async fn add_participant(
        pool: &SqlitePool,
        conversation_id: &str,
        user_id: &str,
    ) -> AppResult<ConversationParticipant> {
        let participant = query_as::<_, ConversationParticipant>(
            r#"
            INSERT INTO conversation_participants (conversation_id, user_id)
            VALUES (?, ?)
            RETURNING *
            "#,
        )
        .bind(conversation_id)
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok(participant)
    }

    /// Remove participant from conversation
    pub async fn remove_participant(
        pool: &SqlitePool,
        conversation_id: &str,
        user_id: &str,
    ) -> AppResult<()> {
        query(
            r#"
            DELETE FROM conversation_participants
            WHERE conversation_id = ? AND user_id = ?
            "#,
        )
        .bind(conversation_id)
        .bind(user_id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// List all participants in a conversation
    pub async fn list_participants(
        pool: &SqlitePool,
        conversation_id: &str,
    ) -> AppResult<Vec<ConversationParticipant>> {
        let participants = query_as::<_, ConversationParticipant>(
            r#"
            SELECT * FROM conversation_participants
            WHERE conversation_id = ?
            ORDER BY joined_at ASC
            "#,
        )
        .bind(conversation_id)
        .fetch_all(pool)
        .await?;

        Ok(participants)
    }

    /// Check if user is participant
    pub async fn is_participant(
        pool: &SqlitePool,
        conversation_id: &str,
        user_id: &str,
    ) -> AppResult<bool> {
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM conversation_participants
            WHERE conversation_id = ? AND user_id = ?
            "#,
        )
        .bind(conversation_id)
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok(count.0 > 0)
    }

    /// Count conversations by owner
    pub async fn count_by_owner(pool: &SqlitePool, owner_id: &str) -> AppResult<i64> {
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM conversations
            WHERE owner_id = ? AND deleted_at IS NULL AND archived_at IS NULL
            "#,
        )
        .bind(owner_id)
        .fetch_one(pool)
        .await?;

        Ok(count.0)
    }
}
