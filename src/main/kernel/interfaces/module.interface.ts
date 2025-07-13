export interface IModule {
  initialize(): Promise<void>;
  registerIpcHandlers(): void;
  getName(): string;
  getDependencies(): string[];
}

export interface IModuleContainer {
  register(module: IModule): void;
  get<T extends IModule>(name: string): T;
  initializeAll(): Promise<void>;
}