import { logger } from '../logger';

export interface IEvent {
  type: string;
  id?: string;
  timestamp?: Date;
}

export type EventListener<T extends IEvent> = (event: T) => void | Promise<void>;

export class EventBus {
  private static instance: EventBus;
  private listeners = new Map<string, EventListener<IEvent>[]>();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

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

  async publish<T extends IEvent>(event: T) {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners && eventListeners.length > 0) {
      logger.debug(`Publishing event: ${event.type}`, { eventId: event.id });
      
      // Execute all listeners, handling both sync and async
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

  // Get registered event types for debugging
  getRegisteredEventTypes(): string[] {
    return Array.from(this.listeners.keys());
  }

  // Get listener count for an event type
  getListenerCount(eventType: string): number {
    return this.listeners.get(eventType)?.length || 0;
  }
}
