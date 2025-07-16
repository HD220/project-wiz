import {
  MessageIdentity,
  MessageContent,
  MessageLocation,
  MessageState,
  MessageType,
} from "../value-objects";

export class ProjectMessageCore {
  private constructor(
    private readonly identity: MessageIdentity,
    private readonly content: MessageContent,
    private readonly location: MessageLocation,
    private readonly state: MessageState,
  ) {}

  static create(props: {
    id?: string;
    content: string;
    channelId: string;
    authorId: string;
    type?: MessageType;
    createdAt?: Date;
    updatedAt?: Date;
    metadata?: Record<string, unknown>;
    isEdited?: boolean;
  }): ProjectMessageCore {
    const identity = MessageIdentity.create({
      id: props.id,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    });

    const content = MessageContent.create({
      content: props.content,
      type: props.type,
      metadata: props.metadata,
    });

    const location = MessageLocation.create({
      channelId: props.channelId,
      authorId: props.authorId,
    });

    const state = MessageState.create(props.isEdited);

    return new ProjectMessageCore(identity, content, location, state);
  }

  getId(): string {
    return this.identity.getId();
  }

  getContent(): string {
    return this.content.getContent();
  }

  getChannelId(): string {
    return this.location.getChannelId();
  }

  getAuthorId(): string {
    return this.location.getAuthorId();
  }

  isText(): boolean {
    return this.content.isText();
  }

  isCode(): boolean {
    return this.content.isCode();
  }

  isSystem(): boolean {
    return this.content.isSystem();
  }

  getData() {
    return {
      id: this.identity.getId(),
      content: this.content.getContent(),
      channelId: this.location.getChannelId(),
      authorId: this.location.getAuthorId(),
      type: this.content.getType(),
      createdAt: this.identity.getCreatedAt(),
      updatedAt: this.identity.getUpdatedAt(),
      metadata: this.content.getMetadata(),
      isEdited: this.state.isMessageEdited(),
    };
  }
}
