import { ModuleContainer } from "./base-module.container";
import { ModuleEvents } from "./base-module.events";
import { ModuleInitialization } from "./base-module.initialization";
import { IModuleContainer } from "./interfaces/module.interface";

export abstract class BaseModuleCore {
  protected initialization: ModuleInitialization;
  protected events: ModuleEvents;
  protected container: ModuleContainer;

  constructor() {
    this.initialization = new ModuleInitialization();
    this.events = new ModuleEvents();
    this.container = new ModuleContainer();
  }

  setContainer(container: IModuleContainer): void {
    this.container.setContainer(container);
  }

  abstract getName(): string;
  abstract getDependencies(): string[];

  async initialize(): Promise<void> {
    await this.initialization.initializeOnce(async () => {
      await this.onInitialize();
      this.subscribeToEvents();
    });
  }

  registerIpcHandlers(): void {
    this.initialization.requireInitialized(this.getName());
    this.onRegisterIpcHandlers();
  }

  protected abstract onInitialize(): Promise<void>;
  protected abstract onRegisterIpcHandlers(): void;
  protected subscribeToEvents(): void {}

  protected isInitialized(): boolean {
    return this.initialization.isInitialized();
  }
}
