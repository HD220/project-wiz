// src_refactored/core/application/services/chat.service.ts
import { injectable, inject } from 'inversify';

import { ILoggerService, LoggerServiceToken } from '@/core/common/services/i-logger.service'; // Assuming a logger is useful
import { ILLMAdapter, ILLMAdapterToken } from '@/core/ports/adapters/llm-adapter.interface';
import { LanguageModelMessage } from '@/core/ports/adapters/llm-adapter.types';

import {
  ChatSendMessagePayload,
  ChatStreamEventPayload,
  ChatStreamTokenPayload,
  ChatStreamEndPayload,
  ChatStreamErrorPayload
} from '@/shared/ipc-chat.types';
import { Result, Ok, Err } from '@/shared/result';

import { IChatService, IChatServiceSendMessageResponse } from '../ports/services/i-chat.service';

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(ILLMAdapterToken) private readonly llmAdapter: ILLMAdapter,
    @inject(LoggerServiceToken) private readonly logger: ILoggerService,
  ) {}

  async handleSendMessageStream(
    payload: ChatSendMessagePayload,
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void,
  ): Promise<Result<IChatServiceSendMessageResponse, Error>> {
    this.logger.info(`[ChatService] Handling send message stream for session: ${payload.sessionId}`);

    if (!this.llmAdapter) {
      this.logger.error('[ChatService] LLMAdapter not available.');
      // Fallback mock streaming if no LLM adapter (or send error immediately)
      this.sendMockStream(sendStreamEventCallback, "LLMAdapter not configured. Mock response enabled.");
      return Ok({ message: "Message received, mock streaming started due to no LLM adapter." });
    }
    if (!payload.messages) {
        this.logger.warn('[ChatService] No messages in payload. Sending generic mock response.');
        this.sendMockStream(sendStreamEventCallback, "No messages provided. Here's a mock reply.");
        return Ok({ message: "No messages in payload, mock streaming started." });
    }

    try {
      if (typeof this.llmAdapter.streamText !== 'function') {
        this.logger.error('[ChatService] LLMAdapter does not support streamText method.');
        this.sendMockStream(sendStreamEventCallback, "LLMAdapter does not support streaming. Mock response.");
        return Ok({ message: "LLMAdapter does not support streaming, mock streaming started." });
      }

      let effectiveMessages = payload.messages;
      if (effectiveMessages.length === 0 || (effectiveMessages.length === 1 && effectiveMessages[0].role === 'system')) {
        effectiveMessages.push({ role: 'user', content: 'Hello!' });
      }

      // Simplification: using prompt from messages. Adapter might need full message history.
      const simplePrompt = effectiveMessages.map(m => `${m.role}: ${m.content}`).join('\n');
      const stream = this.llmAdapter.streamText(simplePrompt, payload.options);

      for await (const result of stream) {
        if (result.isSuccess()) {
          const tokenPayload: ChatStreamTokenPayload = { type: 'token', data: result.value };
          sendStreamEventCallback(tokenPayload);
        } else {
          this.logger.error('[ChatService] Error from LLM stream:', result.error);
          const errorPayload: ChatStreamErrorPayload = { type: 'error', error: { message: result.error.message, name: result.error.name }};
          sendStreamEventCallback(errorPayload);
        }
      }
      const endPayload: ChatStreamEndPayload = { type: 'end' };
      sendStreamEventCallback(endPayload);

      return Ok({ message: "Message received, streaming started." });

    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error('[ChatService] Error processing stream with LLMAdapter:', err);
      const errorPayload: ChatStreamErrorPayload = { type: 'error', error: { message: err.message, name: err.name }};
      sendStreamEventCallback(errorPayload);
      const endPayload: ChatStreamEndPayload = { type: 'end' };
      sendStreamEventCallback(endPayload);
      return Err(new Error(`Failed to process stream with LLMAdapter: ${err.message}`));
    }
  }

  private sendMockStream(sendStreamEventCallback: (event: ChatStreamEventPayload) => void, message: string): void {
    this.logger.warn(`[ChatService] Sending mock stream: ${message}`);
    const tokens = message.split(' ');
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
