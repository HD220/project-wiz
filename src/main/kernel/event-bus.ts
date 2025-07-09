export type EventListener<T = unknown> = (event: T) => void;

export class EventBus {
  private listeners = new Map<string, EventListener<unknown>[]>();

  subscribe<T = unknown>(eventType: string, listener: EventListener<T>) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(listener as EventListener<unknown>);
  }

  publish<T = unknown>(eventType: string, event: T) {
    const eventListeners = this.listeners.get(eventType);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(event));
    }
  }
}
