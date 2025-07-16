import { IModuleContainer } from "./interfaces/module.interface";

export class ModuleContainer {
  container!: IModuleContainer;

  setContainer(container: IModuleContainer): void {
    this.container = container;
  }

  getContainer(): IModuleContainer {
    return this.container;
  }
}
