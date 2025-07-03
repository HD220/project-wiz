// src_refactored/core/application/ports/services/i-chat.service.ts
import {
  IUseCaseResponse,
} from "@/shared/application/use-case-response.dto";
import {
  ChatSendMessagePayload,
  ChatStreamEventPayload,
} from "@/shared/ipc-chat.types";

export interface IChatServiceSendMessageResponse {
  message: string;
}

export interface IChatService {
  handleSendMessageStream(
    payload: ChatSendMessagePayload,
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void
  ): Promise<IUseCaseResponse<IChatServiceSendMessageResponse>>;
}

export const CHAT_SERVICE_TOKEN = Symbol('IChatService');
