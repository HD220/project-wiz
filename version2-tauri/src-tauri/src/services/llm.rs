use crate::db::models::{LlmProvider, Message};
use crate::errors::{AppError, AppResult};
use crate::services::crypto;
use async_stream::stream;
use eventsource_stream::Eventsource;
use futures::Stream;
use futures::StreamExt;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::pin::Pin;

// ============================================================================
// Chat Message Types
// ============================================================================

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String, // "user" | "assistant" | "system"
    pub content: String,
}

impl From<Message> for ChatMessage {
    fn from(msg: Message) -> Self {
        ChatMessage {
            role: if msg.author_id.contains("agent") {
                "assistant".to_string()
            } else {
                "user".to_string()
            },
            content: msg.content,
        }
    }
}

// Helper function to convert Vec<Message> to Vec<ChatMessage>
pub fn messages_to_chat_messages(messages: Vec<Message>) -> Vec<ChatMessage> {
    messages.into_iter().map(ChatMessage::from).collect()
}

// ============================================================================
// LLM Service
// ============================================================================

pub struct LlmService {
    client: Client,
}

impl LlmService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
        }
    }

    /// Stream completion from LLM provider
    pub async fn stream_completion(
        &self,
        provider: &LlmProvider,
        messages: Vec<ChatMessage>,
        master_key: &[u8],
    ) -> AppResult<Pin<Box<dyn Stream<Item = AppResult<String>> + Send>>> {
        // Decrypt API key
        let api_key = crypto::decrypt(&provider.api_key_encrypted, master_key)?;

        // Route to appropriate provider
        match provider.provider_type.as_str() {
            "openai" | "deepseek" => {
                self.stream_openai_compatible(provider, messages, &api_key)
                    .await
            }
            "anthropic" => self.stream_anthropic(provider, messages, &api_key).await,
            _ => Err(AppError::Validation(format!(
                "Unsupported provider type: {}",
                provider.provider_type
            ))),
        }
    }

    /// Stream OpenAI-compatible API (OpenAI, DeepSeek, custom)
    async fn stream_openai_compatible(
        &self,
        provider: &LlmProvider,
        messages: Vec<ChatMessage>,
        api_key: &str,
    ) -> AppResult<Pin<Box<dyn Stream<Item = AppResult<String>> + Send>>> {
        // Determine base URL
        let base_url = provider
            .base_url
            .as_deref()
            .unwrap_or("https://api.openai.com/v1");

        let url = format!("{}/chat/completions", base_url);

        // Build request body
        let body = json!({
            "model": "gpt-4", // Should come from agent config
            "messages": messages,
            "stream": true,
            "temperature": 0.7,
        });

        // Make streaming request
        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::LlmProvider(format!("Request failed: {}", e)))?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(AppError::LlmProvider(format!(
                "API error {}: {}",
                status, text
            )));
        }

        // Create stream from SSE
        let stream = response
            .bytes_stream()
            .eventsource()
            .map(|event| match event {
                Ok(event) => {
                    // Skip [DONE] message
                    if event.data == "[DONE]" {
                        return Ok(String::new());
                    }

                    // Parse SSE data
                    match serde_json::from_str::<serde_json::Value>(&event.data) {
                        Ok(json) => {
                            // Extract delta content
                            if let Some(content) = json
                                .get("choices")
                                .and_then(|c| c.get(0))
                                .and_then(|c| c.get("delta"))
                                .and_then(|d| d.get("content"))
                                .and_then(|c| c.as_str())
                            {
                                Ok(content.to_string())
                            } else {
                                Ok(String::new())
                            }
                        }
                        Err(e) => Err(AppError::LlmProvider(format!(
                            "Failed to parse SSE data: {}",
                            e
                        ))),
                    }
                }
                Err(e) => Err(AppError::LlmProvider(format!("Stream error: {}", e))),
            })
            .filter(|result| {
                // Filter out empty chunks
                futures::future::ready(match result {
                    Ok(s) => !s.is_empty(),
                    Err(_) => true,
                })
            });

        Ok(Box::pin(stream))
    }

    /// Stream Anthropic API
    async fn stream_anthropic(
        &self,
        provider: &LlmProvider,
        messages: Vec<ChatMessage>,
        api_key: &str,
    ) -> AppResult<Pin<Box<dyn Stream<Item = AppResult<String>> + Send>>> {
        let base_url = provider
            .base_url
            .as_deref()
            .unwrap_or("https://api.anthropic.com");

        let url = format!("{}/v1/messages", base_url);

        // Convert messages to Anthropic format
        let anthropic_messages: Vec<_> = messages
            .into_iter()
            .filter(|m| m.role != "system")
            .map(|m| {
                json!({
                    "role": m.role,
                    "content": m.content
                })
            })
            .collect();

        // Build request body
        let body = json!({
            "model": "claude-3-5-sonnet-20241022", // Should come from agent config
            "messages": anthropic_messages,
            "stream": true,
            "max_tokens": 2048,
        });

        // Make streaming request
        let response = self
            .client
            .post(&url)
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::LlmProvider(format!("Request failed: {}", e)))?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response
                .text()
                .await
                .unwrap_or_else(|_| "Unknown error".to_string());
            return Err(AppError::LlmProvider(format!(
                "API error {}: {}",
                status, text
            )));
        }

        // Create stream from SSE
        let stream = response
            .bytes_stream()
            .eventsource()
            .map(|event| match event {
                Ok(event) => {
                    // Skip non-content events
                    if event.event.as_str() != "content_block_delta" {
                        return Ok(String::new());
                    }

                    // Parse SSE data
                    match serde_json::from_str::<serde_json::Value>(&event.data) {
                        Ok(json) => {
                            // Extract delta text
                            if let Some(text) = json
                                .get("delta")
                                .and_then(|d| d.get("text"))
                                .and_then(|t| t.as_str())
                            {
                                Ok(text.to_string())
                            } else {
                                Ok(String::new())
                            }
                        }
                        Err(e) => Err(AppError::LlmProvider(format!(
                            "Failed to parse SSE data: {}",
                            e
                        ))),
                    }
                }
                Err(e) => Err(AppError::LlmProvider(format!("Stream error: {}", e))),
            })
            .filter(|result| {
                // Filter out empty chunks
                futures::future::ready(match result {
                    Ok(s) => !s.is_empty(),
                    Err(_) => true,
                })
            });

        Ok(Box::pin(stream))
    }
}

impl Default for LlmService {
    fn default() -> Self {
        Self::new()
    }
}
