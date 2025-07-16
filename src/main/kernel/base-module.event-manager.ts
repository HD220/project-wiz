import { ModuleEvents } from "./base-module.events";

export class BaseModuleEventManager {
  constructor(private events: ModuleEvents) {}

  publishEvent<T extends any>(event: T): Promise<void> {
    return this.events.publishEvent(event);
  }

  subscribeToEvent<T extends any>(eventType: T["type"], listener: any): void {
    this.events.subscribeToEvent(eventType, listener);
  }
}
