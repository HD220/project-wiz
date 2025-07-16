import { EventBus } from "./event-bus.class";

export class EventBusSingleton {
  private static instance: EventBus;

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBusSingleton.instance) {
      EventBusSingleton.instance = new EventBus();
    }
    return EventBusSingleton.instance;
  }
}
