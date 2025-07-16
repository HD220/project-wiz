import { DomainEvent } from "./domain.event";
import { EntityData } from "./entity-data.type";

export abstract class EntityUpdatedEvent extends DomainEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: string,
    public readonly changes: EntityData,
    public readonly previousData?: EntityData,
  ) {
    super();
  }
}
