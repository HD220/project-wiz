// src_refactored/core/application/ports/services/i-chat.service.ts
import {
  ChatSendMessagePayload,
  ChatStreamEventPayload
} from '@/shared/ipc-chat.types';
import { Result } from '@/shared/result';

// Define a more specific type for the data returned by handleSendMessageStream if needed
export interface IChatServiceSendMessageResponse {
  message: string;
}

export interface IChatService {
  /**
   * Handles sending a message and streaming back the response.
   * @param payload The message payload from the client.
   * @param sendStreamEventCallback A callback function to send stream events back to the client.
   * @returns A Promise that resolves to a Result indicating initial success or failure of starting the stream.
   */
  handleSendMessageStream(
    payload: ChatSendMessagePayload,
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void,
  ): Promise<IChatServiceSendMessageResponse>;
}

export const CHAT_SERVICE_TOKEN = Symbol('IChatService');
