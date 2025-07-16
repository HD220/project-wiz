import { IEvent } from "../event-bus";

export abstract class DomainEvent implements IEvent {
  abstract type: string;
  timestamp: Date;
  id: string;

  constructor() {
    this.timestamp = new Date();
    this.id = crypto.randomUUID();
  }
}
