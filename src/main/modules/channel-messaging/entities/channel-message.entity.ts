import { z } from "zod";
import {
  ChannelMessageSchema,
  type ChannelMessageData,
} from "./channel-message.schema";
import { ChannelMessageTypeEnum } from "../../../../shared/types/channel-message.types";

export class ChannelMessageEntity {
  private props: ChannelMessageData;

  constructor(data: Partial<ChannelMessageData> | ChannelMessageData) {
    this.props = ChannelMessageSchema.parse(data);
  }

  getId(): string {
    return this.props.id;
  }

  getContent(): string {
    return this.props.content;
  }

  getChannelId(): string {
    return this.props.channelId;
  }

  getAuthorId(): string {
    return this.props.authorId;
  }

  getAuthorName(): string {
    return this.props.authorName;
  }

  getType(): ChannelMessageTypeEnum {
    return this.props.type;
  }

  isEdited(): boolean {
    return this.props.isEdited;
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
    const validated = z.object({ content: ChannelMessageSchema.shape.content }).parse(data);
    this.props.content = validated.content;
    this.props.isEdited = true;
    this.props.updatedAt = new Date();
  }

  canBeEditedBy(userId: string): boolean {
    return this.props.authorId === userId && this.props.type !== ChannelMessageTypeEnum.SYSTEM;
  }

  canBeDeletedBy(userId: string): boolean {
    return this.props.authorId === userId && this.props.type !== ChannelMessageTypeEnum.SYSTEM;
  }

  toPlainObject(): ChannelMessageData {
    return { ...this.props };
  }
}