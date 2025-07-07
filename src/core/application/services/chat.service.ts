// src/core/application/services/chat.service.ts
import { injectable, inject } from "inversify";

import {
  ILogger,
  LOGGER_INTERFACE_TYPE,
} from "@/core/common/services/i-logger.service";
import { LLMError } from "@/core/domain/common/common-domain.errors";
import {
  ILLMAdapter,
  ILLMAdapterToken,
} from "@/core/ports/adapters/llm-adapter.interface";
import { LanguageModelMessage } from "@/core/ports/adapters/llm-adapter.types";

import {
  IUseCaseResponse,
  successUseCaseResponse,
  errorUseCaseResponse,
} from "@/shared/application/use-case-response.types";
import {
  ChatSendMessagePayload,
  ChatStreamEndPayload,
  ChatStreamErrorPayload,
  ChatStreamEventPayload,
  ChatStreamTokenPayload,
} from "@/shared/ipc-chat.types";

import {
  IChatService,
  IChatServiceSendMessageResponse,
} from "../ports/services/chat.service.port";

@injectable()
export class ChatService implements IChatService {
  constructor(
    @inject(ILLMAdapterToken) private readonly llmAdapter: ILLMAdapter,
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {}

  async handleSendMessageStream(
    payload: ChatSendMessagePayload,
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void
  ): Promise<IUseCaseResponse<IChatServiceSendMessageResponse>> {
    this.logger.info(`[ChatService] Handling send message stream.`);

    if (!this.llmAdapter) {
      return this._handleMissingAdapter(sendStreamEventCallback);
    }
    if (!payload.messages || payload.messages.length === 0) {
      return this._handleEmptyMessages(sendStreamEventCallback);
    }
    if (typeof this.llmAdapter.streamText !== "function") {
      return this._handleUnsupportedStream(sendStreamEventCallback);
    }

    return this._processLLMStream(payload, sendStreamEventCallback);
  }

  private _handleMissingAdapter(
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void
  ): IUseCaseResponse<IChatServiceSendMessageResponse> {
    this.logger.error("[ChatService] LLMAdapter not available.");
    this.sendMockStream(
      sendStreamEventCallback,
      "LLMAdapter not configured. Mock response enabled."
    );
    return successUseCaseResponse({
      message:
        "Message received, mock streaming started due to no LLM adapter.",
    });
  }

  private _handleEmptyMessages(
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void
  ): IUseCaseResponse<IChatServiceSendMessageResponse> {
    this.logger.warn(
      "[ChatService] No messages in payload. Sending generic mock response."
    );
    this.sendMockStream(
      sendStreamEventCallback,
      "No messages provided. Here's a mock reply."
    );
    return successUseCaseResponse({
      message: "No messages in payload, mock streaming started.",
    });
  }

  private _handleUnsupportedStream(
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void
  ): IUseCaseResponse<IChatServiceSendMessageResponse> {
    this.logger.error(
      "[ChatService] LLMAdapter does not support streamText method."
    );
    this.sendMockStream(
      sendStreamEventCallback,
      "LLMAdapter does not support streaming. Mock response."
    );
    return successUseCaseResponse({
      message: "LLMAdapter does not support streaming. Mock response.",
    });
  }

  private async _processLLMStream(
    payload: ChatSendMessagePayload,
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void
  ): Promise<IUseCaseResponse<IChatServiceSendMessageResponse>> {
    try {
      let effectiveMessages = payload.messages;
      if (
        effectiveMessages.length === 0 ||
        (effectiveMessages.length === 1 &&
          effectiveMessages[0].role === "system")
      ) {
        effectiveMessages.push({ role: "user", content: "Hello!" });
      }

      const simplePrompt = effectiveMessages
        .map((message) => `${message.role}: ${message.content ?? ""}`)
        .join("\n");
      const stream = this.llmAdapter.streamText!(simplePrompt);

      for await (const result of stream) {
        if (result.success) {
          let tokenData: string = "";
          if (
            result.data &&
            typeof result.data === "object" &&
            "content" in result.data
          ) {
            tokenData = (result.data as LanguageModelMessage).content || "";
          }
          const tokenPayload: ChatStreamTokenPayload = {
            type: "token",
            data: tokenData,
          };
          sendStreamEventCallback(tokenPayload);
        } else {
          this.logger.error(
            "[ChatService] Error from LLM stream",
            result.error,
            { service: "ChatService", operation: "_processLLMStream" }
          );
          const errorPayload: ChatStreamErrorPayload = {
            type: "error",
            error: { message: result.error!.message, name: result.error!.name },
          };
          sendStreamEventCallback(errorPayload);
        }
      }
      const endPayload: ChatStreamEndPayload = { type: "end" };
      sendStreamEventCallback(endPayload);

      return successUseCaseResponse({
        message: "Message received, streaming started.",
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        "[ChatService] Error processing stream with LLMAdapter:",
        err
      );
      const errorPayload: ChatStreamErrorPayload = {
        type: "error",
        error: { message: err.message, name: err.name },
      };
      sendStreamEventCallback(errorPayload);
      const endPayload: ChatStreamEndPayload = { type: "end" };
      sendStreamEventCallback(endPayload);
      return errorUseCaseResponse(
        new LLMError(`Failed to process stream with LLMAdapter: ${err.message}`)
      );
    }
  }

  private sendMockStream(
    sendStreamEventCallback: (event: ChatStreamEventPayload) => void,
    messageText: string
  ): void {
    this.logger.warn(`[ChatService] Sending mock stream: ${messageText}`);
    const tokens = messageText.split(" ");
    let delay = 0;
    for (const token of tokens) {
      delay += 100;
      setTimeout(() => {
        const tokenPayload: ChatStreamTokenPayload = {
          type: "token",
          data: token + " ",
        };
        sendStreamEventCallback(tokenPayload);
      }, delay);
    }
    setTimeout(() => {
      const endPayload: ChatStreamEndPayload = { type: "end" };
      sendStreamEventCallback(endPayload);
    }, delay + 100);
  }
}
