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

export type EntityData = Record<string, unknown>;

export abstract class EntityUpdatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    entityType: string,
    public readonly changes: EntityData,
    public readonly previousData?: EntityData,
  ) {
    super(`entity.${entityType}.updated`, entityId);
  }
}

export abstract class EntityDeletedEvent extends BaseEvent {
  constructor(
    entityId: string,
    entityType: string,
    public readonly deletedData: EntityData,
  ) {
    super(`entity.${entityType}.deleted`, entityId);
  }
}
