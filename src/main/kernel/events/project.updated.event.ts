import { EntityUpdatedEvent, EntityData } from "./base.events";

export class ProjectUpdatedEvent extends EntityUpdatedEvent {
  type = "project.updated" as const;

  constructor(
    projectId: string,
    changes: EntityData,
    previousData?: EntityData,
  ) {
    super(projectId, "project", changes, previousData);
  }
}
