import { ModuleInitializer } from "./dependency-container.module-initializer";
import { ModuleRegistry } from "./dependency-container.module-registry";
import { IModule, IModuleContainer } from "./interfaces/module.interface";

export class DependencyContainer implements IModuleContainer {
  private static instance: DependencyContainer;
  private registry: ModuleRegistry;
  private initializer: ModuleInitializer;

  private constructor() {
    this.registry = new ModuleRegistry();
    this.initializer = new ModuleInitializer(this.registry);
  }

  public static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

  register(module: IModule): void {
    module.setContainer(this);
    this.registry.register(module);
  }

  get<T extends IModule>(name: string): T {
    return this.registry.get<T>(name);
  }

  async initializeAll(): Promise<void> {
    await this.initializer.initializeAll();
  }
}
