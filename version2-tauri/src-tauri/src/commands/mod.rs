pub mod auth;
pub mod agents;
pub mod providers;
pub mod projects;
pub mod conversations;
pub mod messages;

// Re-export all commands for easy registration
pub use auth::{get_current_user, login, logout, register};
pub use agents::{create_agent, list_agents, get_agent, update_agent, delete_agent};
pub use providers::{
    create_provider, list_providers, get_provider, update_provider,
    update_provider_api_key, delete_provider
};
pub use projects::{
    create_project, list_projects, get_project, update_project,
    archive_project, unarchive_project, delete_project
};
pub use conversations::{
    create_conversation, list_conversations, get_conversation, update_conversation,
    archive_conversation, delete_conversation, add_participant, remove_participant
};
pub use messages::{
    create_message, list_messages, get_message, update_message,
    delete_message, search_messages, get_message_history, send_message_streaming
};
