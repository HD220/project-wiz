import { ChannelMessage } from "./channel-message.types";
import {
  ChannelMessageFilterDto,
  CreateChannelMessageDto,
  UpdateChannelMessageDto,
} from "./crud.types";

export interface IChannelMessageService {
  list: (filter?: ChannelMessageFilterDto) => Promise<ChannelMessage[]>;
  listByChannel: (
    channelId: string,
    limit?: number,
    offset?: number,
  ) => Promise<ChannelMessage[]>;
  getLatest: (channelId: string, limit?: number) => Promise<ChannelMessage[]>;
  getById: (id: string) => Promise<ChannelMessage | null>;
  create: (data: CreateChannelMessageDto) => Promise<ChannelMessage>;
  createText: (
    content: string,
    channelId: string,
    authorId: string,
    authorName: string,
  ) => Promise<ChannelMessage>;
  update: (data: UpdateChannelMessageDto) => Promise<ChannelMessage>;
  delete: (id: string) => Promise<void>;
  search: (
    channelId: string,
    searchTerm: string,
    limit?: number,
  ) => Promise<ChannelMessage[]>;
  getLastMessage: (channelId: string) => Promise<ChannelMessage | null>;
}
