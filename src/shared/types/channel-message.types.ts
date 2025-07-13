// DTOs para mensagens de canal - módulo independente

// DTO para criar uma nova mensagem no canal
export interface CreateChannelMessageDto {
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type?: 'text' | 'code' | 'file' | 'system';
  metadata?: Record<string, any>;
}

// DTO para atualizar mensagem existente
export interface UpdateChannelMessageDto {
  id: string;
  content?: string;
  metadata?: Record<string, any>;
}

// DTO para resposta (output)
export interface ChannelMessageDto {
  id: string;
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type: string;
  metadata?: Record<string, any>;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO para filtros de busca
export interface ChannelMessageFilterDto {
  channelId?: string;
  authorId?: string;
  type?: string;
  limit?: number;
  offset?: number;
  searchContent?: string;
}

// Enum para tipos de mensagem
export const ChannelMessageType = {
  TEXT: 'text',
  CODE: 'code',
  FILE: 'file',
  SYSTEM: 'system',
} as const;

export type ChannelMessageTypeEnum = typeof ChannelMessageType[keyof typeof ChannelMessageType];

// DTO para paginação
export interface ChannelMessagePaginationDto {
  messages: ChannelMessageDto[];
  totalCount: number;
  hasMore: boolean;
  nextOffset?: number;
}

// AI Chat Integration Types
export interface AISendMessageRequestDto {
  content: string;
  channelId: string;
  llmProviderId: string;
  authorId: string;
  authorName: string;
  aiName?: string; // Name for the AI assistant responses
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeHistory?: boolean;
  historyLimit?: number;
}

export interface AISendMessageResponseDto {
  userMessage: ChannelMessageDto;
  aiMessage: ChannelMessageDto;
}

export interface AIRegenerateMessageRequestDto {
  channelId: string;
  llmProviderId: string;
  authorId: string;
  authorName: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIChatConfigDto {
  channelId: string;
  llmProviderId: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeHistory?: boolean;
  historyLimit?: number;
}