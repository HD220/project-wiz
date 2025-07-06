import { z } from "zod";

import { LLMError } from "@/domain/common/errors";

import { IUseCaseResponse } from "@/shared/application/use-case-response.dto";

import {
  LLMGenerationOptions,
  LanguageModelMessage,
} from "./llm-adapter.types";

export interface ILLMAdapter {
  generateText(
    messages: LanguageModelMessage[],
    options?: LLMGenerationOptions
  ): Promise<IUseCaseResponse<LanguageModelMessage, LLMError>>;

  generateStructuredOutput<S extends z.ZodTypeAny>(
    prompt: string,
    schema: S,
    options?: LLMGenerationOptions
  ): Promise<IUseCaseResponse<z.infer<S>, LLMError>>;

  streamText?(
    prompt: string,
    options?: LLMGenerationOptions
  ): AsyncGenerator<IUseCaseResponse<string, LLMError>>;
}

export const ILLMAdapterToken = Symbol("ILLMAdapter");
