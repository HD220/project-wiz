import { EventBus, type IEvent } from "../kernel/event-bus";

export function publishEvent<T extends IEvent>(event: T): Promise<void> {
  const eventBus = EventBus.getInstance();
  return eventBus.publish(event);
}

export function subscribeToEvent<T extends IEvent>(
  eventType: T["type"],
  listener: (event: T) => void | Promise<void>,
): void {
  const eventBus = EventBus.getInstance();
  eventBus.subscribe(eventType, listener);
}

export function unsubscribeFromEvent<T extends IEvent>(
  eventType: T["type"],
  listener: (event: T) => void | Promise<void>,
): void {
  const eventBus = EventBus.getInstance();
  eventBus.unsubscribe(eventType, listener);
}
