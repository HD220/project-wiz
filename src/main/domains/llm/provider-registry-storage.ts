import { LanguageModel } from "ai";

import { getLogger } from "../../infrastructure/logger";

const logger = getLogger("provider.registry.storage");

export class ProviderRegistryStorage {
  constructor(private providers: Map<string, LanguageModel>) {}

  store(id: string, model: LanguageModel): void {
    this.providers.set(id, model);
    logger.info("Provider stored", { providerId: id });
  }

  retrieve(id: string): LanguageModel | null {
    return this.providers.get(id) || null;
  }

  exists(id: string): boolean {
    return this.providers.has(id);
  }

  clear(): void {
    this.providers.clear();
    logger.info("All providers cleared");
  }

  getIds(): string[] {
    return Array.from(this.providers.keys());
  }
}
