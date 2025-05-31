import { IRepository } from "@/core/common/repository";
import { LLMProvider } from "@/core/domain/entities/llm-provider";

export type ILLMProviderRepository = IRepository<typeof LLMProvider>;
