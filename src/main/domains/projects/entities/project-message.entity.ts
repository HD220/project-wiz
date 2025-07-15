interface MessageData {
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type: "text" | "code" | "file" | "system";
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
  isEdited: boolean;
}

export class ProjectMessage {
  private readonly identity: string;
  private data: MessageData;

  constructor(props: {
    id?: string;
    content: string;
    channelId: string;
    authorId: string;
    authorName: string;
    type?: "text" | "code" | "file" | "system";
    createdAt?: Date;
    updatedAt?: Date;
    metadata?: Record<string, any>;
    isEdited?: boolean;
  }) {
    this.identity = props.id || crypto.randomUUID();
    this.data = this.buildMessageData(props);
  }

  private buildMessageData(props: any): MessageData {
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

  canBeEditedBy(userId: string): boolean {
    return this.data.authorId === userId && !this.isSystem();
  }

  canBeDeletedBy(userId: string): boolean {
    return this.data.authorId === userId;
  }

  toPlainObject(): any {
    return {
      id: this.identity,
      content: this.data.content,
      channelId: this.data.channelId,
      authorId: this.data.authorId,
      authorName: this.data.authorName,
      type: this.data.type,
      createdAt: this.data.createdAt,
      updatedAt: this.data.updatedAt,
      metadata: this.data.metadata ? JSON.stringify(this.data.metadata) : null,
      isEdited: this.data.isEdited,
    };
  }
}
