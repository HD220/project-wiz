export class MessageLocation {
  private constructor(
    private readonly channelId: string,
    private readonly authorId: string,
  ) {}

  static create(props: {
    channelId: string;
    authorId: string;
  }): MessageLocation {
    return new MessageLocation(props.channelId, props.authorId);
  }

  getChannelId(): string {
    return this.channelId;
  }

  getAuthorId(): string {
    return this.authorId;
  }
}
