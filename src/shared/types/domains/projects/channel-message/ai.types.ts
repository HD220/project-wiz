import { ChannelMessageDto } from "./base.types";

export interface AISendMessageRequestDto {
  content: string;
  channelId: string;
  llmProviderId: string;
  authorId: string;
  authorName: string;
  aiName?: string;
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
