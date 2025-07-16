import { z } from "zod";

const ConversationTypeSchema = z.enum(["direct", "group"], {
  errorMap: () => ({ message: "Conversation type must be direct or group" }),
});

export type ConversationTypeValue = z.infer<typeof ConversationTypeSchema>;

export class ConversationType {
  constructor(type: ConversationTypeValue) {
    const validated = ConversationTypeSchema.parse(type);
    this.value = validated;
  }

  private readonly value: ConversationTypeValue;

  getValue(): ConversationTypeValue {
    return this.value;
  }

  isDirect(): boolean {
    return this.value === "direct";
  }

  equals(other: ConversationType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
