import { EntityCreatedEvent } from "./entity-created.event";

export class ChannelCreatedEvent extends EntityCreatedEvent {
  type = "channel.created" as const;

  constructor(
    channelId: string,
    channel: {
      name: string;
      projectId: string;
      createdBy: string;
      description?: string;
      isPrivate: boolean;
    },
  ) {
    super(channelId, "channel", channel);
  }
}
