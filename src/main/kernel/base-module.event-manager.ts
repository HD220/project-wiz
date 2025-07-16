import { ModuleEvents } from "./base-module.events";
import { IEvent, EventListener } from "./event-bus.interface";

export class BaseModuleEventManager {
  constructor(private events: ModuleEvents) {}

  publishEvent<T extends IEvent>(event: T): Promise<void> {
    return this.events.publishEvent(event);
  }

  subscribeToEvent<T extends IEvent>(
    eventType: T["type"],
    listener: EventListener<T>,
  ): void {
    this.events.subscribeToEvent(eventType, listener);
  }
}
