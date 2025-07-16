import { logger } from "../logger";

import { IEvent } from "./event-bus.interface";
import { EventBusListeners } from "./event-bus.listeners";

export class EventBusPublisher {
  constructor(private listeners: EventBusListeners) {}

  async publish<T extends IEvent>(event: T) {
    const eventListeners = this.listeners.getListeners(event.type);
    if (eventListeners && eventListeners.length > 0) {
      logger.debug(`Publishing event: ${event.type}`, { eventId: event.id });

      const promises = eventListeners.map(async (listener) => {
        try {
          await listener(event);
        } catch (error) {
          logger.error(`Error in event listener for ${event.type}:`, error);
        }
      });

      await Promise.allSettled(promises);
    } else {
      logger.debug(`No listeners found for event: ${event.type}`);
    }
  }
}
