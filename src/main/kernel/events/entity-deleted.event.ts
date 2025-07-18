import { DomainEvent } from "./domain.event";
import { EntityData } from "./entity-data.type";

export abstract class EntityDeletedEvent extends DomainEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: string,
    public readonly deletedData: EntityData,
  ) {
    super();
  }
}
