export class ProjectMessageCore {
  private constructor(
    private readonly id: string,
    private content: string,
    private channelId: string,
    private authorId: string,
    private type: "text" | "code" | "file" | "system",
    private createdAt: Date,
    private updatedAt: Date,
    private metadata: Record<string, unknown>,
    private isEdited: boolean,
  ) {}

  static create(props: {
    id?: string;
    content: string;
    channelId: string;
    authorId: string;
    type?: "text" | "code" | "file" | "system";
    createdAt?: Date;
    updatedAt?: Date;
    metadata?: Record<string, unknown>;
    isEdited?: boolean;
  }): ProjectMessageCore {
    const id = props.id || crypto.randomUUID();
    const createdAt = props.createdAt || new Date();
    const updatedAt = props.updatedAt || new Date();
    const type = props.type || "text";
    const metadata = props.metadata || {};
    const isEdited = props.isEdited || false;

    return new ProjectMessageCore(
      id,
      props.content,
      props.channelId,
      props.authorId,
      type,
      createdAt,
      updatedAt,
      metadata,
      isEdited,
    );
  }

  getId(): string {
    return this.id;
  }

  getContent(): string {
    return this.content;
  }

  getChannelId(): string {
    return this.channelId;
  }

  getAuthorId(): string {
    return this.authorId;
  }

  isText(): boolean {
    return this.type === "text";
  }

  isCode(): boolean {
    return this.type === "code";
  }

  isSystem(): boolean {
    return this.type === "system";
  }

  getData() {
    return {
      id: this.id,
      content: this.content,
      channelId: this.channelId,
      authorId: this.authorId,
      type: this.type,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata,
      isEdited: this.isEdited,
    };
  }
}
