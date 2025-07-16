export { IEvent, EventListener } from "./event-bus.interface";
export { EventBus } from "./event-bus.class";
export { EventBusSingleton } from "./event-bus.singleton";

// Compatibility export
export const EventBusInstance = EventBusSingleton;
