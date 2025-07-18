import { DomainEvent } from "./domain.event";
import { EntityData } from "./entity-data.type";

export abstract class EntityCreatedEvent extends DomainEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: string,
    public readonly data: EntityData,
  ) {
    super();
  }
}
