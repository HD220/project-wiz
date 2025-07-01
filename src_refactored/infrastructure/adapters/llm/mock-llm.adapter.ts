import { injectable, inject } from "inversify";
import { z } from "zod";

import {
  ILogger, // Corrected import
  LOGGER_INTERFACE_TYPE, // Corrected import
} from "@/core/common/services/i-logger.service";
import { LLMError } from "@/core/domain/common/errors";
import { ILLMAdapter } from "@/core/ports/adapters/llm-adapter.interface";
import {
  LLMGenerationOptions,
  LanguageModelMessage,
} from "@/core/ports/adapters/llm-adapter.types";

import { Result, ok, error as resultError } from "@/shared/result"; // Corrected import names

@injectable()
export class MockLLMAdapter implements ILLMAdapter {
  constructor(
    @inject(LOGGER_INTERFACE_TYPE) private readonly logger: ILogger // Corrected token and type
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
      return ok({ // Corrected usage
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

    return ok({ // Corrected usage
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
        if (validation.success) return ok(validation.data); // Corrected usage
        return resultError( // Corrected usage
          new LLMError(
            "Failed to generate mock structured output matching schema.",
            { originalError: validation.error } // Wrapped ZodError in details object
          )
        );
      }
      // Renamed e to error
    } catch (error) {
      return resultError( // Corrected usage
        new LLMError(
          "Error generating mock structured output for schema.",
          { originalError: error instanceof Error ? error : new Error(String(error)) } // Wrapped error in details object
        )
      );
    }
    return resultError( // Corrected usage
      new LLMError(
        "Mock structured output for this schema type not implemented." // No second arg here is fine
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
      yield ok(word + " "); // Corrected usage
    }
  }
}
