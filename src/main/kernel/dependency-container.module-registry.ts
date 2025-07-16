import { logger } from "../logger";

import { IModule } from "./interfaces/module.interface";

export class ModuleRegistry {
  private modules = new Map<string, IModule>();
  private initializedModules = new Set<string>();

  register(module: IModule): void {
    const name = module.getName();
    if (this.modules.has(name)) {
      throw new Error(`Module ${name} is already registered`);
    }

    logger.info(`Registering module: ${name}`);
    this.modules.set(name, module);
  }

  get<T extends IModule>(name: string): T {
    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module ${name} not found`);
    }
    return module as T;
  }

  getAllModules(): Map<string, IModule> {
    return this.modules;
  }

  isInitialized(name: string): boolean {
    return this.initializedModules.has(name);
  }

  markAsInitialized(name: string): void {
    this.initializedModules.add(name);
  }
}
