import { BaseModuleCore } from "./base-module.core";
import { BaseModuleEventManager } from "./base-module.event-manager";
import { IEvent, EventListener } from "./event-bus.interface";
import { IModule } from "./interfaces/module.interface";

export abstract class BaseModule extends BaseModuleCore implements IModule {
  private eventManager: BaseModuleEventManager;

  constructor() {
    super();
    this.eventManager = new BaseModuleEventManager(this.events);
  }

  protected publishEvent<T extends IEvent>(event: T): Promise<void> {
    return this.eventManager.publishEvent(event);
  }

  protected subscribeToEvent<T extends IEvent>(
    eventType: T["type"],
    listener: EventListener<T>,
  ): void {
    this.eventManager.subscribeToEvent(eventType, listener);
  }
}
