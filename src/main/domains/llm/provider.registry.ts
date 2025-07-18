import { LanguageModel } from "ai";

import { getLogger } from "@/infrastructure/logger";

import { LLMProvider } from "./entities";
import { ProviderFactory } from "./provider-factory";
import { ProviderRegistryStorage } from "./provider-registry-storage";

const logger = getLogger("provider.registry");

export class ProviderRegistry {
  constructor() {
    this.storage = new ProviderRegistryStorage(new Map());
  }

  private readonly storage: ProviderRegistryStorage;

  registerProvider(
    id: string,
    provider: LLMProvider,
    apiKey: string,
    model: string = "gpt-4o",
  ): void {
    const languageModel = ProviderFactory.createLanguageModel(
      provider,
      apiKey,
      model,
    );
    this.storage.store(id, languageModel);

    logger.info("Provider registered", {
      providerId: id,
      type: provider.getProviderType().getValue(),
    });
  }

  getProvider(id: string): LanguageModel | null {
    return this.storage.retrieve(id);
  }

  hasProvider(id: string): boolean {
    return this.storage.exists(id);
  }

  clearProviders(): void {
    this.storage.clear();
  }

  getRegisteredProviderIds(): string[] {
    return this.storage.getIds();
  }
}
