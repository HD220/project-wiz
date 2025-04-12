/** 
 * Shared types for the Application layer
 * Do not depend on infrastructure
 */

/** Represents a configurable prompt */
export interface PromptDTO {
  id: string
  title: string
  description?: string
  content: string
  variables: Record<string, string> // default variables or placeholders
  createdAt: Date
  updatedAt: Date
}

/** Represents a request to an LLM model */
export interface LLMRequestDTO {
  prompt: string
  variables?: Record<string, string>
  temperature?: number
  maxTokens?: number
  topP?: number
  stopSequences?: string[]
  stream?: boolean
  model?: string
}

/** Represents a response from the LLM model */
export interface LLMResponseDTO {
  id: string
  content: string
  createdAt: Date
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  isFinal: boolean
}

/** Represents an entry in the conversation history */
export interface HistoryEntryDTO {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
}

/** Represents general application and model settings */
export interface SettingsDTO {
  defaultModel: string
  temperature: number
  maxTokens: number
  topP: number
  stopSequences: string[]
  apiKey?: string
  customSettings?: Record<string, any>
}