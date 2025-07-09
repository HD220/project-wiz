import { BaseEntity } from "@/shared/common/base.entity";
import { z } from "zod";

export const DirectMessagePropsSchema = z.object({
  senderId: z.string().min(1, "Sender ID cannot be empty"),
  receiverId: z.string().min(1, "Receiver ID cannot be empty"),
  content: z.string().min(1, "Message content cannot be empty"),
  timestamp: z.date(),
});

export type DirectMessageProps = z.infer<typeof DirectMessagePropsSchema>;

export class DirectMessage extends BaseEntity<DirectMessageProps> {
  constructor(props: DirectMessageProps, id?: string) {
    DirectMessagePropsSchema.parse(props);
    super(props, id);
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get receiverId(): string {
    return this.props.receiverId;
  }

  get content(): string {
    return this.props.content;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }
}
