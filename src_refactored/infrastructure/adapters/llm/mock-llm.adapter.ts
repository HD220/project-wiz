import { injectable, inject } from "inversify";
import { z } from "zod";

import {
  ILogger,
  LOGGER_INTERFACE_TYPE,
} from "@/core/common/services/i-logger.service";
import { LLMError } from "@/core/domain/common/errors";
import { ILLMAdapter } from "@/core/ports/adapters/llm-adapter.interface";
import {
  LLMGenerationOptions,
  LanguageModelMessage,
} from "@/core/ports/adapters/llm-adapter.types";

import {
  IUseCaseResponse,
  successUseCaseResponse,
  errorUseCaseResponse,
} from "@/shared/application/use-case-response.dto";

@injectable()
export class MockLLMAdapter implements ILLMAdapter {
  constructor(
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger
  ) {
    this.logger.info("[MockLLMAdapter] Initialized");
  }

  async generateText(
    messages: LanguageModelMessage[],
    options?: LLMGenerationOptions
  ): Promise<IUseCaseResponse<LanguageModelMessage, LLMError>> {
    this.logger.info("[MockLLMAdapter] generateText called", {
      messages,
      options,
    });
    const lastUserMessage = messages
      .filter((message) => message.role === "user")
      .pop();
    const responseContent = `Mock response to: ${lastUserMessage?.content || "your request"}. Options: ${JSON.stringify(options || {})}`;

    if (lastUserMessage?.content?.toLowerCase().includes("use tool")) {
      return successUseCaseResponse({
        role: "assistant",
        content: null,
        tool_calls: [
          {
            id: "tool_call_mock_123",
            type: "function",
            function: {
              name: "example.tool",
              arguments: JSON.stringify({
                message: "hello from mock tool call",
              }),
            },
          },
        ],
      });
    }

    return successUseCaseResponse({
      role: "assistant",
      content: responseContent,
    });
  }

  async generateStructuredOutput<S extends z.ZodTypeAny>(
    prompt: string,
    schema: S,
    options?: LLMGenerationOptions
  ): Promise<IUseCaseResponse<z.infer<S>, LLMError>> {
    this.logger.info("[MockLLMAdapter] generateStructuredOutput called", {
      prompt,
      schemaDef: schema.description,
      options,
    });
    try {
      if (schema instanceof z.ZodObject) {
        const mockData: Record<string, unknown> = {};
        for (const key in schema.shape) {
          const fieldSchema = schema.shape[key];
          if (fieldSchema instanceof z.ZodString) {
            mockData[key] = `mock string for ${key}`;
          } else if (fieldSchema instanceof z.ZodNumber) {
            mockData[key] = 123;
          } else if (fieldSchema instanceof z.ZodBoolean) {
            mockData[key] = true;
          } else {
            mockData[key] = null;
          }
        }
        const validation = schema.safeParse(mockData);
        if (validation.success) return successUseCaseResponse(validation.data);
        return errorUseCaseResponse(
          new LLMError(
            "Failed to generate mock structured output matching schema.",
            { details: validation.error }
          )
        );
      }
    } catch (error) {
      return errorUseCaseResponse(
        new LLMError(
          "Error generating mock structured output for schema.",
          { originalError: error instanceof Error ? error : new Error(String(error)) }
        )
      );
    }
    return errorUseCaseResponse(
      new LLMError(
        "Mock structured output for this schema type not implemented."
      )
    );
  }

  async *streamText(
    prompt: string,
    options?: LLMGenerationOptions
  ): AsyncGenerator<IUseCaseResponse<string, LLMError>> {
    this.logger.info("[MockLLMAdapter] streamText called", { prompt, options });
    const response = `Mock streamed response to: ${prompt}. Options: ${JSON.stringify(options || {})}`;
    const words = response.split(" ");
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      yield successUseCaseResponse(word + " ");
    }
  }
}
