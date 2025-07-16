export { IEvent, EventListener } from "./event-bus.interface";
export { EventBus } from "./event-bus.class";
export { EventBusSingleton } from "./event-bus.singleton";

// Compatibility export
import { EventBusSingleton as EventBusImpl } from "./event-bus.singleton";
export const EventBusInstance = EventBusImpl.getInstance();
