import { UserIdentity, MessageContent, SenderType } from "../value-objects";

export class DirectMessage {
  constructor(
    private messageId: UserIdentity,
    private content: MessageContent,
  ) {}

  processMessage(senderId: UserIdentity, senderType: SenderType): void {
    this.validateSender(senderId, senderType);
    this.logActivity();
  }

  private validateSender(_id: UserIdentity, _type: SenderType): void {
    if (this.content.isEmpty()) {
      throw new Error("Cannot process empty message");
    }
  }

  private logActivity(): void {
    console.log(`Message ${this.messageId.getValue()} processed`);
  }

  getId(): UserIdentity {
    return this.messageId;
  }

  getContent(): MessageContent {
    return this.content;
  }
}
