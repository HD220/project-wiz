export interface IModule {
  initialize(): Promise<void>;
  registerIpcHandlers(): void;
  getName(): string;
  getDependencies(): string[];
  setContainer(container: IModuleContainer): void;
}

export interface IModuleContainer {
  register(module: IModule): void;
  get<T extends IModule>(name: string): T;
  initializeAll(): Promise<void>;
}