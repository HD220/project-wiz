import type {
  CreateMessageInput,
  Message,
} from "../../../../shared/types/common";
import { BaseApiClient } from "../../../services/api-client";

export class MessageApiService extends BaseApiClient {
  static async createMessage(data: CreateMessageInput): Promise<Message> {
    const response = await window.electronAPI.createMessage(data);
    return this.handleResponse(response, "Failed to create message");
  }

  static async getDMMessages(data: {
    dmConversationId: string;
    limit?: number;
    before?: string;
  }): Promise<Message[]> {
    const response = await window.electronAPI.getDMMessages(data);
    return this.handleResponse(response, "Failed to get DM messages");
  }

  static async findMessageById(messageId: string): Promise<Message | null> {
    const response = await window.electronAPI.findMessageById(messageId);
    return this.handleResponse(response, "Failed to find message");
  }

  static async updateMessage(data: {
    messageId: string;
    content: string;
    authorId: string;
  }): Promise<Message> {
    const response = await window.electronAPI.updateMessage(data);
    return this.handleResponse(response, "Failed to update message");
  }

  static async deleteMessage(data: {
    messageId: string;
    authorId: string;
  }): Promise<void> {
    const response = await window.electronAPI.deleteMessage(data);
    return this.handleResponse(response, "Failed to delete message");
  }
}
