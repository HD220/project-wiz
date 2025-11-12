use thiserror::Error;

/// Application-level errors
#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Not authenticated")]
    Unauthorized,

    #[error("Access denied")]
    Forbidden,

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("LLM provider error: {0}")]
    LlmProvider(String),

    #[error("Encryption error")]
    Encryption,

    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),

    #[error("Internal error: {0}")]
    Internal(String),
}

/// Custom Result type for application errors
pub type AppResult<T> = Result<T, AppError>;

/// Implement Serialize for Tauri IPC
impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;
        let mut state = serializer.serialize_struct("AppError", 2)?;
        state.serialize_field("message", &self.to_string())?;
        state.serialize_field("kind", &self.error_kind())?;
        state.end()
    }
}

impl AppError {
    fn error_kind(&self) -> &str {
        match self {
            Self::Database(_) => "database",
            Self::Unauthorized => "unauthorized",
            Self::Forbidden => "forbidden",
            Self::NotFound(_) => "not_found",
            Self::Validation(_) => "validation",
            Self::LlmProvider(_) => "llm_provider",
            Self::Encryption => "encryption",
            Self::Io(_) => "io",
            Self::Internal(_) => "internal",
        }
    }
}
