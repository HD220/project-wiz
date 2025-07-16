import { logger } from "../logger";

import { IEvent, EventListener } from "./event-bus.interface";

export class EventBusListeners {
  private listeners = new Map<string, EventListener<IEvent>[]>();

  subscribe<T extends IEvent>(
    eventType: T["type"],
    listener: EventListener<T>,
  ) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(listener as EventListener<IEvent>);
    logger.debug(`Event listener registered for: ${eventType}`);
  }

  unsubscribe<T extends IEvent>(
    eventType: T["type"],
    listener: EventListener<T>,
  ) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener as EventListener<IEvent>);
      if (index > -1) {
        eventListeners.splice(index, 1);
        logger.debug(`Event listener unregistered for: ${eventType}`);
      }
    }
  }

  getListeners(eventType: string): EventListener<IEvent>[] {
    return this.listeners.get(eventType) || [];
  }

  getRegisteredEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  getListenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.length || 0;
  }
}
