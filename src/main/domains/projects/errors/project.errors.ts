export class ProjectNotFoundError extends Error {
  constructor(projectId: string) {
    super(`Project not found: ${projectId}`);
    this.name = "ProjectNotFoundError";
  }
}

export class ProjectUpdateError extends Error {
  constructor(message: string = "Failed to update project") {
    super(message);
    this.name = "ProjectUpdateError";
  }
}

export class ProjectArchiveError extends Error {
  constructor(projectId: string) {
    super(`Cannot archive project: ${projectId}`);
    this.name = "ProjectArchiveError";
  }
}

export class ProjectDeleteError extends Error {
  constructor(projectId: string) {
    super(`Cannot delete project: ${projectId}`);
    this.name = "ProjectDeleteError";
  }
}

export class ChannelNotFoundError extends Error {
  constructor(channelId: string) {
    super(`Channel not found: ${channelId}`);
    this.name = "ChannelNotFoundError";
  }
}

export class ChannelDeleteError extends Error {
  constructor(channelId: string, reason?: string) {
    super(`Cannot delete channel: ${channelId}${reason ? ` - ${reason}` : ""}`);
    this.name = "ChannelDeleteError";
  }
}
