// src_refactored/core/application/services/chat.service.ts
import { injectable, inject } from 'inversify';

import { ILogger, LOGGER_INTERFACE_TYPE } from '@/core/common/services/i-logger.service';
import { ILLMAdapter, ILLMAdapterToken } from '@/core/ports/adapters/llm-adapter.interface';

import {
  ChatSendMessagePayload,
  ChatStreamEventPayload,
  ChatStreamTokenPayload,
  ChatStreamEndPayload,
  ChatStreamErrorPayload
} from '@/shared/ipc-chat.types';
import { Result, ok, error as resultError, isSuccess } from '@/shared/result';

import { IChatService, IChatServiceSendMessageResponse } from '../ports/services/i-chat.service';

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(ILLMAdapterToken) private readonly llmAdapter: ILLMAdapter,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger,
  ) {}

  async handleSendMessageStream(
    payload: ChatSendMessagePayload,
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void,
  ): Promise<IChatServiceSendMessageResponse> {
    this.logger.info(`[ChatService] Handling send message stream.`);

    if (!this.llmAdapter) {
      return this._handleMissingAdapter(sendStreamEventCallback);
    }
    if (!payload.messages || payload.messages.length === 0) {
      return this._handleEmptyMessages(sendStreamEventCallback);
    }
    if (typeof this.llmAdapter.streamText !== 'function') {
      return this._handleUnsupportedStream(sendStreamEventCallback);
    }
    const streamTextFn = this.llmAdapter.streamText;

    return this._processLLMStream(payload, sendStreamEventCallback, streamTextFn);
  }

  private _handleMissingAdapter(sendStreamEventCallback: (event: ChatStreamEventPayload) => void): Result<IChatServiceSendMessageResponse, Error> {
    this.logger.error('[ChatService] LLMAdapter not available.');
    this.sendMockStream(sendStreamEventCallback, "LLMAdapter not configured. Mock response enabled.");
    return ok({ message: "Message received, mock streaming started due to no LLM adapter." });
  }

  private _handleEmptyMessages(sendStreamEventCallback: (event: ChatStreamEventPayload) => void): Result<IChatServiceSendMessageResponse, Error> {
    this.logger.warn('[ChatService] No messages in payload. Sending generic mock response.');
    this.sendMockStream(sendStreamEventCallback, "No messages provided. Here's a mock reply.");
    return ok({ message: "No messages in payload, mock streaming started." });
  }

  private _handleUnsupportedStream(sendStreamEventCallback: (event: ChatStreamEventPayload) => void): Result<IChatServiceSendMessageResponse, Error> {
    this.logger.error('[ChatService] LLMAdapter does not support streamText method.');
    this.sendMockStream(sendStreamEventCallback, "LLMAdapter does not support streaming. Mock response.");
    return { message: "LLMAdapter does not support streaming. Mock response." };
  }

  private async _processLLMStream(
    payload: ChatSendMessagePayload,
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void,
    streamTextFn: (prompt: string, options?: any) => AsyncGenerator<Result<string, any>>
  ): Promise<Result<IChatServiceSendMessageResponse, Error>> {
    try {
      let effectiveMessages = payload.messages;
      if (effectiveMessages.length === 0 || (effectiveMessages.length === 1 && effectiveMessages[0].role === 'system')) {
        effectiveMessages.push({ role: 'user', content: 'Hello!' });
      }

      const simplePrompt = effectiveMessages.map(message => `${message.role}: ${message.content}`).join('\n');
      const stream = streamTextFn!(simplePrompt);

      for await (const result of stream) {
        if (result.isSuccess) {
          const tokenPayload: ChatStreamTokenPayload = { type: 'token', data: result.value };
          sendStreamEventCallback(tokenPayload);
        } else {
          this.logger.error('[ChatService] Error from LLM stream', result.error, { service: 'ChatService', operation: '_processLLMStream' });
          const errorPayload: ChatStreamErrorPayload = { type: 'error', error: { message: result.error.message, name: result.error.name }};
          sendStreamEventCallback(errorPayload);
        }
      }
      const endPayload: ChatStreamEndPayload = { type: 'end' };
      sendStreamEventCallback(endPayload);

      return { message: "Message received, streaming started." };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('[ChatService] Error processing stream with LLMAdapter:', err);
      const errorPayload: ChatStreamErrorPayload = { type: 'error', error: { message: err.message, name: err.name }};
      sendStreamEventCallback(errorPayload);
      const endPayload: ChatStreamEndPayload = { type: 'end' };
      sendStreamEventCallback(endPayload);
      return resultError(new Error(`Failed to process stream with LLMAdapter: ${err.message}`));
    }
  }

  private sendMockStream(sendStreamEventCallback: (event: ChatStreamEventPayload) => void, messageText: string): void {
    this.logger.warn(`[ChatService] Sending mock stream: ${messageText}`);
    const tokens = messageText.split(' ');
    let delay = 0;
    for (const token of tokens) {
        delay += 100;
        setTimeout(() => {
            const tokenPayload: ChatStreamTokenPayload = { type: 'token', data: token + " " };
            sendStreamEventCallback(tokenPayload);
        }, delay);
    }
    setTimeout(() => {
        const endPayload: ChatStreamEndPayload = { type: 'end' };
        sendStreamEventCallback(endPayload);
    }, delay + 100);
  }
}
