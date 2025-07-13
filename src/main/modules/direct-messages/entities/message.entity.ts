import { z } from "zod";
import {
  MessageSchema,
  type MessageData,
} from "./message.schema";
import { MessageTypeEnum } from "../../../../shared/types/message.types";

export class MessageEntity {
  private props: MessageData;

  constructor(data: Partial<MessageData> | MessageData) {
    this.props = MessageSchema.parse(data);
  }

  getId(): string {
    return this.props.id;
  }

  getContent(): string {
    return this.props.content;
  }

  getConversationId(): string {
    return this.props.conversationId;
  }

  getSenderId(): string {
    return this.props.senderId;
  }

  getReceiverId(): string {
    return this.props.receiverId;
  }

  getType(): MessageTypeEnum {
    return this.props.type;
  }

  isEdited(): boolean {
    return this.props.isEdited;
  }

  isRead(): boolean {
    return this.props.isRead;
  }

  getMetadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  updateContent(data: { content: string }): void {
    const validated = z.object({ content: MessageSchema.shape.content }).parse(data);
    this.props.content = validated.content;
    this.props.isEdited = true;
    this.props.updatedAt = new Date();
  }

  markAsRead(): void {
    this.props.isRead = true;
    this.props.updatedAt = new Date();
  }

  canBeEditedBy(userId: string): boolean {
    return this.props.senderId === userId;
  }

  canBeDeletedBy(userId: string): boolean {
    return this.props.senderId === userId;
  }

  toPlainObject(): MessageData {
    return { ...this.props };
  }
}
