import { z } from "zod";
import { BaseEntity } from "@/main/kernel/base.entity";

export const ChannelPropsSchema = z.object({
  name: z.string().min(1, "Channel name cannot be empty"),
  projectId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ChannelProps = z.infer<typeof ChannelPropsSchema>;

export class Channel extends BaseEntity<ChannelProps> {
  constructor(props: ChannelProps, id?: string) {
    super(props, id);
    ChannelPropsSchema.parse(props);
  }

  static create(props: Omit<ChannelProps, 'createdAt' | 'updatedAt'>, id?: string): Channel {
    return new Channel({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, id);
  }

  static fromPersistence(data: any): Channel {
    const props: ChannelProps = {
      name: data.name,
      projectId: data.projectId,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
    return new Channel(props, data.id);
  }

  touch(): void {
    this.props.updatedAt = new Date();
  }
}
