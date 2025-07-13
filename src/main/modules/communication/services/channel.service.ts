import { ChannelEntity } from "../entities/channel.entity";
import { ChannelRepository } from "../persistence/repository";
import {
  CreateChannelData,
  UpdateChannelData,
  ChannelData,
} from "../entities/channel.schema";
import { ChannelFilterDto } from "../../../../shared/types/channel.types";

export class ChannelService {
  constructor(private repository: ChannelRepository) {}

  async createChannel(data: CreateChannelData): Promise<ChannelData> {
    const nameExists = await this.repository.existsByNameInProject(
      data.name,
      data.projectId
    );

    if (nameExists) {
      throw new Error("A channel with this name already exists in this project");
    }

    const channel = new ChannelEntity(data);
    const saved = await this.repository.save(channel.toPlainObject());
    return saved;
  }

  async listChannels(filter?: ChannelFilterDto): Promise<ChannelData[]> {
    return this.repository.findMany(filter);
  }

  async getChannelById(data: { id: string }): Promise<ChannelData | null> {
    return this.repository.findById(data.id);
  }

  async updateChannel(data: UpdateChannelData): Promise<ChannelData> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Channel not found");
    }

    if (data.name) {
      const nameExists = await this.repository.existsByNameInProject(
        data.name,
        existing.projectId,
        data.id
      );

      if (nameExists) {
        throw new Error("A channel with this name already exists in this project");
      }
    }

    const channel = new ChannelEntity(existing);

    if (data.name !== undefined) {
      channel.updateName({ name: data.name });
    }
    if (data.description !== undefined) {
      channel.updateDescription({ description: data.description });
    }

    return this.repository.update(channel.toPlainObject());
  }

  async archiveChannel(data: { id: string }): Promise<ChannelData> {
    const existing = await this.repository.findById(data.id);
    if (!existing) {
      throw new Error("Channel not found");
    }

    const channel = new ChannelEntity(existing);
    channel.archive();

    return this.repository.update(channel.toPlainObject());
  }

  async deleteChannel(data: { id: string }): Promise<void> {
    await this.repository.delete(data.id);
  }
}