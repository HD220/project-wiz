export interface ChatMessageSender {
  type: 'user' | 'agent' | 'system'
  id: string
  name?: string
}

export interface ChatMessage {
  id: string
  content: string
  sender: ChatMessageSender
  timestamp: Date
  isMarkdown?: boolean
  status?: ChatMessageStatus
}

export type ChatMessageStatus = 'sending' | 'sent' | 'failed'

export interface ChatHistoryQuery {
  conversationId: string
  limit?: number
  before?: Date
}

export interface ChatThread {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}