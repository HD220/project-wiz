import { MessageData } from "./project-message-data";

export class ProjectMessagePermissions {
  constructor(private data: MessageData) {}

  canBeEditedBy(userId: string): boolean {
    return this.data.authorId === userId && !this.isSystem();
  }

  canBeDeletedBy(userId: string): boolean {
    return this.data.authorId === userId;
  }

  private isSystem(): boolean {
    return this.data.type === "system";
  }
}
