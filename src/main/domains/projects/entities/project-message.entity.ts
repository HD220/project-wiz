import { ProjectMessageCore } from "./project-message-core.entity";
import { ProjectMessagePermissions } from "./project-message-permissions";
import { ProjectMessageSerializer } from "./project-message-serializer";

interface CreateProps {
  id?: string;
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type?: "text" | "code" | "file" | "system";
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
  isEdited?: boolean;
}

export class ProjectMessage {
  constructor(private readonly core: ProjectMessageCore) {}

  static create(props: CreateProps): ProjectMessage {
    return new ProjectMessage(ProjectMessageCore.create(props));
  }

  getId() { return this.core.getId(); }
  getContent() { return this.core.getContent(); }
  getChannelId() { return this.core.getChannelId(); }
  getAuthorId() { return this.core.getAuthorId(); }
  isText() { return this.core.isText(); }
  isCode() { return this.core.isCode(); }
  isSystem() { return this.core.isSystem(); }

  canBeEditedBy(userId: string): boolean {
    return new ProjectMessagePermissions(this.core.getData()).canBeEditedBy(userId);
  }

  canBeDeletedBy(userId: string): boolean {
    return new ProjectMessagePermissions(this.core.getData()).canBeDeletedBy(userId);
  }

  toPlainObject() {
    return ProjectMessageSerializer.toPlainObject(this.core.getId(), this.core.getData());
  }
}
