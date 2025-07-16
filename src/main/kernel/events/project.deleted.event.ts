import { EntityDeletedEvent, EntityData } from "./base.events";

export class ProjectDeletedEvent extends EntityDeletedEvent {
  type = "project.deleted" as const;

  constructor(projectId: string, deletedProject: EntityData) {
    super(projectId, "project", deletedProject);
  }
}
