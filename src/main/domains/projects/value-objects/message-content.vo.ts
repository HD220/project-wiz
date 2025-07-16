export type MessageType = "text" | "code" | "file" | "system";

export class MessageContent {
  private constructor(
    private readonly content: string,
    private readonly type: MessageType,
    private readonly metadata: Record<string, unknown>,
  ) {}

  static create(props: {
    content: string;
    type?: MessageType;
    metadata?: Record<string, unknown>;
  }): MessageContent {
    const type = props.type || "text";
    const metadata = props.metadata || {};

    return new MessageContent(props.content, type, metadata);
  }

  getContent(): string {
    return this.content;
  }

  getType(): MessageType {
    return this.type;
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

  getMetadata(): Record<string, unknown> {
    return this.metadata;
  }
}
