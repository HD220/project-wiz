import type {
  CreateChannelInput,
  Channel,
  Message,
} from "../../../../shared/types/common";
import { BaseApiClient } from "../../../services/api-client";

export class ChannelApiService extends BaseApiClient {
  static async createChannel(data: CreateChannelInput): Promise<Channel> {
    const response = await window.electronAPI.createChannel(data);
    return this.handleResponse(response, "Failed to create channel");
  }

  static async findChannelById(channelId: string): Promise<Channel | null> {
    const response = await window.electronAPI.findChannelById(channelId);
    return this.handleResponse(response, "Failed to find channel");
  }

  static async findProjectChannels(projectId: string): Promise<Channel[]> {
    const response = await window.electronAPI.findProjectChannels(projectId);
    return this.handleResponse(response, "Failed to find project channels");
  }

  static async updateChannel(data: {
    channelId: string;
    input: Partial<CreateChannelInput>;
    userId: string;
  }): Promise<Channel> {
    const response = await window.electronAPI.updateChannel(data);
    return this.handleResponse(response, "Failed to update channel");
  }

  static async deleteChannel(data: {
    channelId: string;
    userId: string;
  }): Promise<void> {
    const response = await window.electronAPI.deleteChannel(data);
    return this.handleResponse(response, "Failed to delete channel");
  }

  static async getChannelMessages(data: {
    channelId: string;
    limit?: number;
    before?: string;
  }): Promise<Message[]> {
    const response = await window.electronAPI.getChannelMessages(data);
    return this.handleResponse(response, "Failed to get channel messages");
  }
}
