use sqlx::{query_as, query, SqlitePool};
use crate::{
    db::models::{User, AgentConfig, Agent, AgentRow},
    errors::AppResult,
};

pub struct AgentsRepository;

impl AgentsRepository {
    /// Create agent user
    pub async fn create_user(
        pool: &SqlitePool,
        name: &str,
    ) -> AppResult<User> {
        let user = query_as::<_, User>(
            r#"
            INSERT INTO users (name, user_type, status)
            VALUES (?, 'agent', 'offline')
            RETURNING *
            "#,
        )
        .bind(name)
        .fetch_one(pool)
        .await?;

        Ok(user)
    }

    /// Create agent config
    pub async fn create_config(
        pool: &SqlitePool,
        user_id: &str,
        llm_provider_id: &str,
        role: &str,
        backstory: &str,
        goal: &str,
        model: &str,
        temperature: f64,
        max_tokens: i64,
        top_p: Option<f64>,
    ) -> AppResult<AgentConfig> {
        let config = query_as::<_, AgentConfig>(
            r#"
            INSERT INTO agent_configs
            (user_id, llm_provider_id, role, backstory, goal, model, temperature, max_tokens, top_p)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
            "#,
        )
        .bind(user_id)
        .bind(llm_provider_id)
        .bind(role)
        .bind(backstory)
        .bind(goal)
        .bind(model)
        .bind(temperature)
        .bind(max_tokens)
        .bind(top_p)
        .fetch_one(pool)
        .await?;

        Ok(config)
    }

    /// Get agent by ID (joins user + config)
    pub async fn find_by_id(pool: &SqlitePool, id: &str) -> AppResult<Option<Agent>> {
        let result = query_as::<_, AgentRow>(
            r#"
            SELECT
                u.id, u.email, u.password_hash, u.name, u.avatar_url, u.user_type, u.status,
                u.created_at, u.updated_at, u.deleted_at,
                ac.user_id, ac.llm_provider_id, ac.role, ac.backstory, ac.goal, ac.model,
                ac.temperature, ac.max_tokens, ac.top_p
            FROM users u
            INNER JOIN agent_configs ac ON u.id = ac.user_id
            WHERE u.id = ? AND u.user_type = 'agent' AND u.deleted_at IS NULL
            "#,
        )
        .bind(id)
        .fetch_optional(pool)
        .await?;

        Ok(result.map(|row| row.into()))
    }

    /// List all agents (joins user + config)
    pub async fn list_all(pool: &SqlitePool) -> AppResult<Vec<Agent>> {
        let results = query_as::<_, AgentRow>(
            r#"
            SELECT
                u.id, u.email, u.password_hash, u.name, u.avatar_url, u.user_type, u.status,
                u.created_at, u.updated_at, u.deleted_at,
                ac.user_id, ac.llm_provider_id, ac.role, ac.backstory, ac.goal, ac.model,
                ac.temperature, ac.max_tokens, ac.top_p
            FROM users u
            INNER JOIN agent_configs ac ON u.id = ac.user_id
            WHERE u.user_type = 'agent' AND u.deleted_at IS NULL
            ORDER BY u.created_at DESC
            "#,
        )
        .fetch_all(pool)
        .await?;

        Ok(results
            .into_iter()
            .map(|row| row.into())
            .collect())
    }

    /// Update agent config
    pub async fn update_config(
        pool: &SqlitePool,
        user_id: &str,
        role: Option<&str>,
        backstory: Option<&str>,
        goal: Option<&str>,
        model: Option<&str>,
        temperature: Option<f64>,
        max_tokens: Option<i64>,
        top_p: Option<f64>,
    ) -> AppResult<AgentConfig> {
        // For simplicity, we'll update all fields at once
        // In production, you'd build dynamic query
        let config = query_as::<_, AgentConfig>(
            r#"
            UPDATE agent_configs
            SET
                role = COALESCE(?, role),
                backstory = COALESCE(?, backstory),
                goal = COALESCE(?, goal),
                model = COALESCE(?, model),
                temperature = COALESCE(?, temperature),
                max_tokens = COALESCE(?, max_tokens),
                top_p = COALESCE(?, top_p)
            WHERE user_id = ?
            RETURNING *
            "#,
        )
        .bind(role)
        .bind(backstory)
        .bind(goal)
        .bind(model)
        .bind(temperature)
        .bind(max_tokens)
        .bind(top_p)
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok(config)
    }

    /// Update agent LLM provider
    pub async fn update_provider(
        pool: &SqlitePool,
        user_id: &str,
        provider_id: &str,
    ) -> AppResult<AgentConfig> {
        let config = query_as::<_, AgentConfig>(
            r#"
            UPDATE agent_configs
            SET llm_provider_id = ?
            WHERE user_id = ?
            RETURNING *
            "#,
        )
        .bind(provider_id)
        .bind(user_id)
        .fetch_one(pool)
        .await?;

        Ok(config)
    }

    /// Delete agent (soft delete user + cascade deletes config)
    pub async fn soft_delete(pool: &SqlitePool, id: &str) -> AppResult<()> {
        query(
            r#"
            UPDATE users
            SET deleted_at = unixepoch() * 1000
            WHERE id = ? AND user_type = 'agent'
            "#,
        )
        .bind(id)
        .execute(pool)
        .await?;

        Ok(())
    }

    /// Count active agents
    pub async fn count_active(pool: &SqlitePool) -> AppResult<i64> {
        let count: (i64,) = sqlx::query_as(
            r#"
            SELECT COUNT(*) FROM users
            WHERE user_type = 'agent' AND deleted_at IS NULL
            "#,
        )
        .fetch_one(pool)
        .await?;

        Ok(count.0)
    }
}
