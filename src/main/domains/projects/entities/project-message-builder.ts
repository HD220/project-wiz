import { MessageData } from "./project-message-data";

export class ProjectMessageBuilder {
  static buildData(props: {
    content: string;
    channelId: string;
    authorId: string;
    authorName: string;
    type?: "text" | "code" | "file" | "system";
    createdAt?: Date;
    updatedAt?: Date;
    metadata?: Record<string, unknown>;
    isEdited?: boolean;
  }): MessageData {
    return {
      content: props.content.trim(),
      channelId: props.channelId,
      authorId: props.authorId,
      authorName: props.authorName,
      type: props.type || "text",
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
      metadata: props.metadata || {},
      isEdited: props.isEdited || false,
    };
  }
}
