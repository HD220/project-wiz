/** 
 * Tipos compartilhados da camada Application
 * Não dependem da infraestrutura
 */

/** Representa um prompt configurável */
export interface PromptDTO {
  id: string
  title: string
  description?: string
  content: string
  variables: Record<string, string> // variáveis padrão ou placeholders
  createdAt: Date
  updatedAt: Date
}

/** Representa uma requisição para um modelo LLM */
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

/** Representa uma resposta do modelo LLM */
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

/** Representa uma entrada no histórico de conversas */
export interface HistoryEntryDTO {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
}

/** Representa configurações gerais da aplicação e do modelo */
export interface SettingsDTO {
  defaultModel: string
  temperature: number
  maxTokens: number
  topP: number
  stopSequences: string[]
  apiKey?: string
  customSettings?: Record<string, any>
}