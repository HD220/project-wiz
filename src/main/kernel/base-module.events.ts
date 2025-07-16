import { EventBus, IEvent, EventListener } from "./event-bus";

export class ModuleEvents {
  eventBus: EventBus;

  constructor() {
    this.eventBus = EventBus.getInstance();
  }

  publishEvent<T extends IEvent>(event: T): Promise<void> {
    return this.eventBus.publish(event);
  }

  subscribeToEvent<T extends IEvent>(
    eventType: T["type"],
    listener: EventListener<T>,
  ): void {
    this.eventBus.subscribe(eventType, listener);
  }
}
