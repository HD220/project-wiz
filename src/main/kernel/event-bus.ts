export interface IEvent {
  type: string;
}

export type EventListener<T extends IEvent> = (event: T) => void;

export class EventBus {
  private listeners = new Map<string, EventListener<IEvent>[]>();

  subscribe<T extends IEvent>(
    eventType: T["type"],
    listener: EventListener<T>,
  ) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(listener as EventListener<IEvent>);
  }

  publish<T extends IEvent>(event: T) {
    const eventListeners = this.listeners.get(event.type);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(event));
    }
  }
}
