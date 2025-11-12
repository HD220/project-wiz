// Modules
mod commands;
mod db;
mod errors;
mod services;
mod state;

// Re-exports
pub use db::models;
pub use errors::{AppError, AppResult};
pub use state::AppState;

// Import commands for registration
use commands::*;

// Tauri imports
use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            println!("[SETUP] Starting app initialization...");

            // Initialize app state with database
            tauri::async_runtime::block_on(async {
                // Get app data directory
                println!("[SETUP] Getting app data directory...");
                let app_dir = app
                    .path()
                    .app_data_dir()
                    .expect("Failed to get app data directory");
                println!("[SETUP] App data directory: {}", app_dir.display());

                // Create directory if it doesn't exist
                println!("[SETUP] Creating app data directory...");
                std::fs::create_dir_all(&app_dir)
                    .expect("Failed to create app data directory");
                println!("[SETUP] Directory created successfully");

                // Database path
                let db_path = app_dir.join("project_wiz.db");
                let db_url = format!("sqlite://{}?mode=rwc", db_path.display());
                println!("[SETUP] Database URL: {}", db_url);

                // Generate or load master key (32 bytes for AES-256)
                // TODO: In production, this should be securely stored/generated
                let master_key = vec![0u8; 32]; // Placeholder
                println!("[SETUP] Master key generated");

                // Initialize AppState
                println!("[SETUP] Initializing AppState and running migrations...");
                let state = AppState::new(&db_url, master_key)
                    .await
                    .expect("Failed to initialize app state");
                println!("[SETUP] AppState initialized successfully!");

                // Store state in Tauri's managed state
                app.manage(state);
                println!("[SETUP] State managed successfully!");
            });

            println!("[SETUP] Setup completed!");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            register,
            login,
            get_current_user,
            logout,
            create_agent,
            list_agents,
            get_agent,
            update_agent,
            delete_agent,
            create_provider,
            list_providers,
            get_provider,
            update_provider,
            update_provider_api_key,
            delete_provider,
            create_project,
            list_projects,
            get_project,
            update_project,
            archive_project,
            unarchive_project,
            delete_project,
            create_conversation,
            list_conversations,
            get_conversation,
            update_conversation,
            archive_conversation,
            delete_conversation,
            add_participant,
            remove_participant,
            create_message,
            list_messages,
            get_message,
            update_message,
            delete_message,
            search_messages,
            get_message_history,
            send_message_streaming,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
