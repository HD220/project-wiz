import { EntityCreatedEvent } from "./entity-created.event";

export class ProjectCreatedEvent extends EntityCreatedEvent {
  type = "project.created" as const;

  constructor(
    projectId: string,
    project: {
      name: string;
      description?: string;
      gitUrl?: string;
      status: "active" | "inactive" | "archived";
    },
  ) {
    super(projectId, "project", project);
  }
}
