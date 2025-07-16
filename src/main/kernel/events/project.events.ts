import { BaseEvent } from "./base.events";
import { EVENT_TYPES } from "./event-types";

export class ProjectCreatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    public readonly project: ProjectEventData,
  ) {
    super(EVENT_TYPES.PROJECT_CREATED, entityId);
  }
}

export class ProjectUpdatedEvent extends BaseEvent {
  constructor(
    entityId: string,
    public readonly updates: ProjectUpdateData,
  ) {
    super(EVENT_TYPES.PROJECT_UPDATED, entityId);
  }
}

export class ProjectDeletedEvent extends BaseEvent {
  constructor(entityId: string) {
    super(EVENT_TYPES.PROJECT_DELETED, entityId);
  }
}

interface ProjectEventData {
  id: string;
  name: string;
  description: string;
  gitUrl: string;
  status: string;
  createdBy: string;
}

interface ProjectUpdateData {
  name?: string;
  description?: string;
  gitUrl?: string;
  status?: string;
}
