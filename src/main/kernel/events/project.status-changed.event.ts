import { EntityUpdatedEvent } from "./entity.events";

export class ProjectStatusChangedEvent extends EntityUpdatedEvent {
  type = "project.status.changed" as const;

  constructor(
    projectId: string,
    newStatus: "active" | "inactive" | "archived",
    previousStatus: "active" | "inactive" | "archived",
  ) {
    super(
      projectId,
      "project",
      { status: newStatus },
      { status: previousStatus },
    );
  }
}
