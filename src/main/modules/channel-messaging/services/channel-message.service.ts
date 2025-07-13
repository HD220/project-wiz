import { ChannelMessageEntity } from "../entities/channel-message.entity";
import { ChannelMessageRepository } from "../persistence/repository";
import {
  CreateChannelMessageData,
  UpdateChannelMessageData,
  ChannelMessageData,
} from "../entities/channel-message.schema";
import { ChannelMessageFilterDto } from "../../../../shared/types/channel-message.types";

export class ChannelMessageService {
  constructor(private repository: ChannelMessageRepository) {}

  async createMessage(data: CreateChannelMessageData): Promise<ChannelMessageData> {
    const message = new ChannelMessageEntity(data);
    const saved = await this.repository.save(message.toPlainObject());
    return saved;
  }

  async listMessages(filter?: ChannelMessageFilterDto): Promise<ChannelMessageData[]> {
    return this.repository.findMany(filter);
  }

  async getMessageById(data: { id: string }): Promise<ChannelMessageData | null> {
    return this.repository.findById(data.id);
  }

  async updateMessage(data: UpdateChannelMessageData): Promise<ChannelMessageData> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Message not found");
    }

    const message = new ChannelMessageEntity(existing);

    if (data.content !== undefined) {
      message.updateContent({ content: data.content });
    }

    return this.repository.update(message.toPlainObject());
  }

  async deleteMessage(data: { id: string }): Promise<void> {
    await this.repository.delete(data.id);
  }
}