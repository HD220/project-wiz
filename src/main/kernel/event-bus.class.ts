import { IEvent, EventListener } from "./event-bus.interface";
import { EventBusListeners } from "./event-bus.listeners";
import { EventBusPublisher } from "./event-bus.publisher";

export class EventBus {
  private listenerManager: EventBusListeners;
  private publisher: EventBusPublisher;

  constructor() {
    this.listenerManager = new EventBusListeners();
    this.publisher = new EventBusPublisher(this.listenerManager);
  }

  subscribe<T extends IEvent>(
    eventType: T["type"],
    listener: EventListener<T>,
  ) {
    this.listenerManager.subscribe(eventType, listener);
  }

  unsubscribe<T extends IEvent>(
    eventType: T["type"],
    listener: EventListener<T>,
  ) {
    this.listenerManager.unsubscribe(eventType, listener);
  }

  async publish<T extends IEvent>(event: T) {
    await this.publisher.publish(event);
  }

  getRegisteredEventTypes(): string[] {
    return this.listenerManager.getRegisteredEventTypes();
  }

  getListenerCount(eventType: string): number {
    return this.listenerManager.getListenerCount(eventType);
  }
}
