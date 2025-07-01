import { injectable, inject } from "inversify";
import { z } from "zod";

import {
  ILoggerService,
  LoggerServiceToken,
} from "@/core/common/services/i-logger.service";
import { LLMError } from "@/core/domain/common/errors";
import { ILLMAdapter } from "@/core/ports/adapters/llm-adapter.interface";
import {
  LLMGenerationOptions,
  LanguageModelMessage,
} from "@/core/ports/adapters/llm-adapter.types";

import { Result, Ok, Err } from "@/shared/result";

@injectable()
export class MockLLMAdapter implements ILLMAdapter {
  constructor(
    @inject(LoggerServiceToken) private readonly logger: ILoggerService
  ) {
    this.logger.info("[MockLLMAdapter] Initialized");
  }

  async generateText(
    messages: LanguageModelMessage[],
    options?: LLMGenerationOptions
  ): Promise<Result<LanguageModelMessage, LLMError>> {
    this.logger.info("[MockLLMAdapter] generateText called", {
      messages,
      options,
    });
    const lastUserMessage = messages
      .filter((message) => message.role === "user")
      .pop();
    const responseContent = `Mock response to: ${lastUserMessage?.content || "your request"}. Options: ${JSON.stringify(options || {})}`;

    // Simulate tool call if prompt asks for it
    if (lastUserMessage?.content?.toLowerCase().includes("use tool")) {
      return Ok({
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

    return Ok({
      role: "assistant",
      content: responseContent,
    });
  }

  async generateStructuredOutput<S extends z.ZodTypeAny>(
    prompt: string,
    schema: S,
    options?: LLMGenerationOptions
  ): Promise<Result<z.infer<S>, LLMError>> {
    this.logger.info("[MockLLMAdapter] generateStructuredOutput called", {
      prompt,
      schemaDef: schema.description,
      options,
    });
    // Try to return a mock object that somewhat fits common schemas, or a default based on schema type
    try {
      if (schema instanceof z.ZodObject) {
        // Replaced any with Record<string, unknown>
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
        if (validation.success) return Ok(validation.data);
        return Err(
          new LLMError(
            "Failed to generate mock structured output matching schema.",
            validation.error
          )
        );
      }
      // Renamed e to error
    } catch (error) {
      return Err(
        new LLMError(
          "Error generating mock structured output for schema.",
          error instanceof Error ? error : undefined
        )
      );
    }
    return Err(
      new LLMError(
        "Mock structured output for this schema type not implemented."
      )
    );
  }

  async *streamText(
    prompt: string,
    options?: LLMGenerationOptions
  ): AsyncGenerator<Result<string, LLMError>> {
    this.logger.info("[MockLLMAdapter] streamText called", { prompt, options });
    const response = `Mock streamed response to: ${prompt}. Options: ${JSON.stringify(options || {})}`;
    const words = response.split(" ");
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      yield Ok(word + " ");
    }
  }
}
