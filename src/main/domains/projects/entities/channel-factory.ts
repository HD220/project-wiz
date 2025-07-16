import { ChannelBuilder } from "./channel-builder";
import { Channel } from "./channel.entity";

export class ChannelFactory {
  static createGeneral(projectId: string, createdBy: string): Channel {
    const generalData = ChannelBuilder.buildGeneralChannel(projectId, createdBy);
    const channel = Object.create(Channel.prototype);
    channel.identity = crypto.randomUUID();
    channel.data = generalData;
    return channel;
  }
}