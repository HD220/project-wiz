import { IRepository } from "@/core/common/repository";
import { LLMProviderConfig } from "@/core/domain/entities/llm-provider-config";

export type ILLMProviderConfigRepository = IRepository<
  typeof LLMProviderConfig
>;
