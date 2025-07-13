import { z } from "zod";
import {
  ConversationSchema,
  type ConversationData,
} from "./conversation.schema";

export class ConversationEntity {
  private props: ConversationData;

  constructor(data: Partial<ConversationData> | ConversationData) {
    this.props = ConversationSchema.parse(data);
  }

  getId(): string {
    return this.props.id;
  }

  getUserId1(): string {
    return this.props.userId1;
  }

  getUserId2(): string {
    return this.props.userId2;
  }

  getCreatedAt(): Date {
    return this.props.createdAt;
  }

  getUpdatedAt(): Date {
    return this.props.updatedAt;
  }

  toPlainObject(): ConversationData {
    return { ...this.props };
  }
}
