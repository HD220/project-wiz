import { IEvent } from "../event-bus";

export abstract class BaseEvent implements IEvent {
  public readonly timestamp: Date;

  constructor(
    public readonly type: string,
    public readonly entityId: string,
    public readonly id?: string,
  ) {
    this.timestamp = new Date();
  }
}
