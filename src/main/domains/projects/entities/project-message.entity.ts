import { randomUUID } from "crypto";

export type MessageType = "text" | "code" | "file" | "system";

interface CreateProps {
  id?: string;
  content: string;
  channelId: string;
  authorId: string;
  authorName: string;
  type?: MessageType;
  createdAt?: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
  isEdited?: boolean;
}

export class ProjectMessage {
  private constructor(
    private readonly id: string,
    private readonly content: string,
    private readonly channelId: string,
    private readonly authorId: string,
    private readonly authorName: string,
    private readonly type: MessageType,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
    private readonly metadata: Record<string, unknown>,
    private readonly isEdited: boolean,
  ) {}

  static create(props: CreateProps): ProjectMessage {
    return new ProjectMessage(
      props.id ?? randomUUID(),
      props.content,
      props.channelId,
      props.authorId,
      props.authorName,
      props.type ?? "text",
      props.createdAt ?? new Date(),
      props.updatedAt ?? new Date(),
      props.metadata ?? {},
      props.isEdited ?? false,
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

  getAuthorName(): string {
    return this.authorName;
  }

  getType(): MessageType {
    return this.type;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getMetadata(): Record<string, unknown> {
    return this.metadata;
  }

  getIsEdited(): boolean {
    return this.isEdited;
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

  canBeEditedBy(userId: string): boolean {
    return this.authorId === userId && !this.isSystem();
  }

  canBeDeletedBy(userId: string): boolean {
    return this.authorId === userId;
  }

  toPlainObject() {
    return {
      id: this.id,
      content: this.content,
      channelId: this.channelId,
      authorId: this.authorId,
      authorName: this.authorName,
      type: this.type,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      metadata: this.metadata ? JSON.stringify(this.metadata) : null,
      isEdited: this.isEdited,
    };
  }
}
