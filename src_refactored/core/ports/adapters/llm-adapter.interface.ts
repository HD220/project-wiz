import { z } from "zod";

import { LLMError } from "@/domain/common/errors";

import { Result } from "../../../shared/result";

import {
  LLMGenerationOptions,
  LanguageModelMessage,
} from "./llm-adapter.types";

export interface ILLMAdapter {
  generateText(
    messages: LanguageModelMessage[],
    options?: LLMGenerationOptions
  ): Promise<Result<LanguageModelMessage, LLMError>>;

  generateStructuredOutput<S extends z.ZodTypeAny>(
    prompt: string,
    schema: S,
    options?: LLMGenerationOptions
  ): Promise<Result<z.infer<S>, LLMError>>;

  streamText?(
    prompt: string,
    options?: LLMGenerationOptions
  ): AsyncGenerator<Result<string, LLMError>>;
}

export const ILLMAdapterToken = Symbol("ILLMAdapter");
