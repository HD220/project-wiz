import { IModule, IModuleContainer } from './interfaces/module.interface';
import { logger } from '../logger';

export class DependencyContainer implements IModuleContainer {
  private static instance: DependencyContainer;
  private modules = new Map<string, IModule>();
  private initializedModules = new Set<string>();

  private constructor() {}

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

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

  async initializeAll(): Promise<void> {
    logger.info('Starting module initialization...');
    
    // Topological sort based on dependencies
    const sortedModules = this.topologicalSort();
    
    for (const moduleName of sortedModules) {
      await this.initializeModule(moduleName);
    }
    
    // Register all IPC handlers after initialization
    for (const moduleName of sortedModules) {
      const module = this.modules.get(moduleName)!;
      logger.info(`Registering IPC handlers for module: ${moduleName}`);
      module.registerIpcHandlers();
    }
    
    logger.info('All modules initialized and IPC handlers registered');
  }

  private async initializeModule(name: string): Promise<void> {
    if (this.initializedModules.has(name)) {
      return;
    }

    const module = this.modules.get(name);
    if (!module) {
      throw new Error(`Module ${name} not found`);
    }

    // Initialize dependencies first
    const dependencies = module.getDependencies();
    for (const dep of dependencies) {
      await this.initializeModule(dep);
    }

    logger.info(`Initializing module: ${name}`);
    await module.initialize();
    this.initializedModules.add(name);
  }

  private topologicalSort(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const visit = (name: string) => {
      if (visited.has(name)) return;
      
      const module = this.modules.get(name);
      if (!module) return;

      visited.add(name);
      
      // Visit dependencies first
      for (const dep of module.getDependencies()) {
        visit(dep);
      }
      
      result.push(name);
    };

    for (const [name] of this.modules) {
      visit(name);
    }

    return result;
  }
}