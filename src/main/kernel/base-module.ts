import { BaseModuleCore } from "./base-module.core";
import { BaseModuleEventManager } from "./base-module.event-manager";
import { IModule } from "./interfaces/module.interface";

export abstract class BaseModule extends BaseModuleCore implements IModule {
  private eventManager: BaseModuleEventManager;

  constructor() {
    super();
    this.eventManager = new BaseModuleEventManager(this.events);
  }

  protected publishEvent<T extends any>(event: T): Promise<void> {
    return this.eventManager.publishEvent(event);
  }

  protected subscribeToEvent<T extends any>(
    eventType: T["type"],
    listener: any,
  ): void {
    this.eventManager.subscribeToEvent(eventType, listener);
  }
}
