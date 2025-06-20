// src/infrastructure/services/llm/llm-provider.registry.ts
import { injectable, inject } from 'inversify';
import {
    createProviderRegistry,
    experimental_ProviderRegistry as ProviderRegistry,
    AIModel, // For type hinting
    LanguageModelProvider // For type hinting
} from 'ai';
// Import specific provider SDKs as needed, e.g., for OpenAI
import { createOpenAI } from '@ai-sdk/openai';
// import { anthropic } from '@ai-sdk/anthropic'; // Example for Anthropic
// import { google } from '@ai-sdk/google'; // Example for Google
import { ILoggerService } from '@/domain/services/i-logger.service';
import { TYPES } from '@/infrastructure/ioc/types';

// Define our application's interface to the provider registry
export interface ILLMProviderRegistry {
  // Define methods we expect to use, mirroring ProviderRegistry from 'ai'
  get<MODEL extends AIModel<string, string, any>>(id: MODEL['modelId'] | `${MODEL['provider']}/${MODEL['modelName']}` | `${MODEL['provider']}:${MODEL['modelName']}`): MODEL;
  experimental_getProvider<PROVIDER_NAME extends string>(providerName: PROVIDER_NAME): LanguageModelProvider<PROVIDER_NAME, any>;
  listModels(): Array<AIModel<string, string, any>>;
  experimental_listProviders(): string[];
  // Add other methods if needed by SdkLlmService
}

@injectable()
export class LLMProviderRegistryService implements ILLMProviderRegistry {
  private readonly registry: ProviderRegistry;
  private logger: ILoggerService;

  constructor(@inject(TYPES.ILoggerService) logger: ILoggerService) {
    this.logger = logger;
    this.logger.info('[LLMProviderRegistryService] Initializing...');

    const openAIApiKey = process.env.OPENAI_API_KEY || "YOUR_OPENAI_API_KEY_PLACEHOLDER";
    if (openAIApiKey === "YOUR_OPENAI_API_KEY_PLACEHOLDER") {
        this.logger.warn("[LLMProviderRegistryService] OpenAI API Key is using a placeholder. Real calls may fail.");
    }
    const openai = createOpenAI({ apiKey: openAIApiKey });

    // const anthropicApiKey = process.env.ANTHROPIC_API_KEY || "YOUR_ANTHROPIC_API_KEY_PLACEHOLDER";
    // if (anthropicApiKey === "YOUR_ANTHROPIC_API_KEY_PLACEHOLDER") {
    //     this.logger.warn("[LLMProviderRegistryService] Anthropic API Key is using a placeholder.");
    // }
    // const anthropicProvider = anthropic({ apiKey: anthropicApiKey });

    this.registry = createProviderRegistry({
        openai: openai,
        // anthropic: anthropicProvider
        // Add other providers here
    });
    this.logger.info('[LLMProviderRegistryService] Provider registry created with configured providers.');
  }

  public get<MODEL extends AIModel<string, string, any>>(id: MODEL['modelId'] | `${MODEL['provider']}/${MODEL['modelName']}` | `${MODEL['provider']}:${MODEL['modelName']}`): MODEL {
    // The 'ai' package's ProviderRegistry get method has a complex signature.
    // We might need to cast or use a more specific type from 'ai/core' if available for `id`.
    // For now, this attempts to match the flexibility.
    return this.registry.get(id as any) as MODEL;
  }

  public experimental_getProvider<PROVIDER_NAME extends string>(providerName: PROVIDER_NAME): LanguageModelProvider<PROVIDER_NAME, any> {
    return this.registry.experimental_getProvider(providerName);
  }

  public listModels(): Array<AIModel<string, string, any>> {
    return this.registry.listModels();
  }

  public experimental_listProviders(): string[] {
    return this.registry.experimental_listProviders();
  }
}
