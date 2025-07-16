import { MessageData } from "./project-message-data";

export class ProjectMessageSerializer {
  static toPlainObject(
    identity: string,
    data: MessageData,
  ): {
    id: string;
    content: string;
    channelId: string;
    authorId: string;
    authorName: string;
    type: "text" | "code" | "file" | "system";
    createdAt: Date;
    updatedAt: Date;
    metadata: string | null;
    isEdited: boolean;
  } {
    return {
      id: identity,
      content: data.content,
      channelId: data.channelId,
      authorId: data.authorId,
      authorName: data.authorName,
      type: data.type,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      isEdited: data.isEdited,
    };
  }
}
