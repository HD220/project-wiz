import { logger } from "../logger";

import { DependencyContainer } from "./dependency-container";

export class ModuleLoader {
  private container: DependencyContainer;

  constructor() {
    this.container = DependencyContainer.getInstance();
  }

  async loadAndInitializeModules(): Promise<void> {
    try {
      logger.info("Starting module loading...");

      // Register all modules
      this.registerModules();

      // Initialize all modules in dependency order
      await this.container.initializeAll();

      logger.info("All modules loaded and initialized successfully");
    } catch (error) {
      logger.error("Failed to load modules:", error);
      throw error;
    }
  }

  private registerModules(): void {
    // All modules successfully migrated to domain architecture
    // Domain handlers are registered directly in main.ts via registerDomainHandlers()
    logger.info(
      "Module-based architecture fully migrated to domain architecture",
    );
  }

  getContainer(): DependencyContainer {
    return this.container;
  }
}
