import { logger } from "../logger";

import { ModuleRegistry } from "./dependency-container.module-registry";
import { TopologicalSort } from "./dependency-container.topological-sort";

export class ModuleInitializer {
  constructor(private registry: ModuleRegistry) {}

  async initializeAll(): Promise<void> {
    logger.info("Starting module initialization...");

    const sortedModules = new TopologicalSort(
      this.registry.getAllModules(),
    ).sort();

    for (const moduleName of sortedModules) {
      await this.initializeModule(moduleName);
    }

    for (const moduleName of sortedModules) {
      const module = this.registry.get(moduleName);
      logger.info(`Registering IPC handlers for module: ${moduleName}`);
      module.registerIpcHandlers();
    }

    logger.info("All modules initialized and IPC handlers registered");
  }

  private async initializeModule(name: string): Promise<void> {
    if (this.registry.isInitialized(name)) {
      return;
    }

    const module = this.registry.get(name);
    const dependencies = module.getDependencies();

    for (const dep of dependencies) {
      await this.initializeModule(dep);
    }

    logger.info(`Initializing module: ${name}`);
    await module.initialize();
    this.registry.markAsInitialized(name);
  }
}
