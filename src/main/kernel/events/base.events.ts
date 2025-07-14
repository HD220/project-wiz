import { IEvent } from "../event-bus";

// Base event classes for domain events
export abstract class DomainEvent implements IEvent {
  abstract type: string;
  public readonly timestamp: Date;
  public readonly id: string;

  constructor() {
    this.timestamp = new Date();
    this.id = crypto.randomUUID();
  }
}

// Base event for entity creation
export abstract class EntityCreatedEvent extends DomainEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: string,
    public readonly data: Record<string, any>,
  ) {
    super();
  }
}

// Base event for entity updates
export abstract class EntityUpdatedEvent extends DomainEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: string,
    public readonly changes: Record<string, any>,
    public readonly previousData?: Record<string, any>,
  ) {
    super();
  }
}

// Base event for entity deletion
export abstract class EntityDeletedEvent extends DomainEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityType: string,
    public readonly deletedData: Record<string, any>,
  ) {
    super();
  }
}
