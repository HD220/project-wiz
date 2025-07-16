import { BaseEvent } from "./base.events";

export abstract class EntityUpdatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    entityType: string,
    public readonly updatedFields: Record<string, unknown>,
    public readonly previousFields: Record<string, unknown>,
  ) {
    super(`entity.${entityType}.updated`, entityId);
  }
}
