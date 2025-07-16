import {
  EntityCreatedEvent,
  EntityUpdatedEvent,
  EntityDeletedEvent,
  EntityData,
} from "./base.events";

// Project Events
export class ProjectCreatedEvent extends EntityCreatedEvent {
  type = "project.created" as const;

  constructor(
    projectId: string,
    public readonly project: {
      name: string;
      description?: string;
      gitUrl?: string;
      status: "active" | "inactive" | "archived";
    },
  ) {
    super(projectId, "project", project);
  }
}

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

export class ProjectDeletedEvent extends EntityDeletedEvent {
  type = "project.deleted" as const;

  constructor(projectId: string, deletedProject: EntityData) {
    super(projectId, "project", deletedProject);
  }
}

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
