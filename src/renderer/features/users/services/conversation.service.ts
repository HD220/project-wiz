import {
  ConversationDto,
  ConversationFilterDto,
  CreateConversationDto,
} from "../../../../shared/types/users/message.types";

export const conversationService = {
  async list(_filter?: ConversationFilterDto): Promise<ConversationDto[]> {
    return window.electronIPC.conversations.list();
  },

  async getById(id: string): Promise<ConversationDto | null> {
    return window.electronIPC.conversations.getById(id);
  },

  async create(data: CreateConversationDto): Promise<ConversationDto> {
    return window.electronIPC.conversations.create(data);
  },

  async findOrCreate(participants: string[]): Promise<ConversationDto> {
    return window.electronIPC.conversations.findOrCreate(participants);
  },
};
