use sqlx::SqlitePool;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

/// Main application state, managed by Tauri
#[derive(Clone)]
pub struct AppState {
    pub db: SqlitePool,
    pub sessions: Arc<RwLock<SessionStore>>,
    pub config: Arc<AppConfig>,
}

/// Session storage for authentication tokens
pub struct SessionStore {
    sessions: HashMap<String, Session>,
}

/// Individual session data
pub struct Session {
    pub user_id: String,
    pub expires_at: i64,
}

/// Application configuration
#[derive(Clone)]
pub struct AppConfig {
    pub master_key: Vec<u8>, // For encryption/decryption of API keys
}

impl AppState {
    /// Create a new AppState with database connection and configuration
    pub async fn new(db_path: &str, master_key: Vec<u8>) -> Result<Self, sqlx::Error> {
        // Connect to SQLite database
        let db = SqlitePool::connect(db_path).await?;

        // Run migrations automatically
        sqlx::migrate!("./migrations").run(&db).await?;

        Ok(Self {
            db,
            sessions: Arc::new(RwLock::new(SessionStore {
                sessions: HashMap::new(),
            })),
            config: Arc::new(AppConfig { master_key }),
        })
    }

    /// Get the current authenticated user ID from a session token
    pub async fn get_current_user(&self, token: &str) -> Option<String> {
        let sessions = self.sessions.read().await;
        sessions.sessions.get(token).map(|s| s.user_id.clone())
    }

    /// Create a new session for a user
    pub async fn create_session(&self, user_id: String, expires_at: i64) -> String {
        let token = uuid::Uuid::new_v4().to_string();
        let mut sessions = self.sessions.write().await;
        sessions.sessions.insert(
            token.clone(),
            Session {
                user_id,
                expires_at,
            },
        );
        token
    }

    /// Remove a session (logout)
    pub async fn remove_session(&self, token: &str) {
        let mut sessions = self.sessions.write().await;
        sessions.sessions.remove(token);
    }

    /// Clean up expired sessions
    pub async fn cleanup_expired_sessions(&self) {
        let now = chrono::Utc::now().timestamp_millis();
        let mut sessions = self.sessions.write().await;
        sessions
            .sessions
            .retain(|_, session| session.expires_at > now);
    }

    /// Get the master key for encryption/decryption
    pub async fn get_master_key(&self) -> Vec<u8> {
        self.config.master_key.clone()
    }
}

impl SessionStore {
    /// Check if a session is valid and not expired
    pub fn is_valid(&self, token: &str) -> bool {
        if let Some(session) = self.sessions.get(token) {
            let now = chrono::Utc::now().timestamp_millis();
            session.expires_at > now
        } else {
            false
        }
    }
}
