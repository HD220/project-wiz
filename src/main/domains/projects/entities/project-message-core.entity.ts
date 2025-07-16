import { MessageData } from "./project-message-data";
import { ProjectMessageBuilder } from "./project-message-builder";

export class ProjectMessageCore {
  constructor(
    private readonly identity: string,
    private data: MessageData,
  ) {}

  static create(props: {
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
  }): ProjectMessageCore {
    const identity = props.id || crypto.randomUUID();
    const data = ProjectMessageBuilder.buildData(props);
    return new ProjectMessageCore(identity, data);
  }

  getId(): string {
    return this.identity;
  }

  getContent(): string {
    return this.data.content;
  }

  getChannelId(): string {
    return this.data.channelId;
  }

  getAuthorId(): string {
    return this.data.authorId;
  }

  isText(): boolean {
    return this.data.type === "text";
  }

  isCode(): boolean {
    return this.data.type === "code";
  }

  isSystem(): boolean {
    return this.data.type === "system";
  }

  getData(): MessageData {
    return this.data;
  }
}