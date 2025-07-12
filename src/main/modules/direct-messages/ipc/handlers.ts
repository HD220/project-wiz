import { ipcMain, IpcMainInvokeEvent } from "electron";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";
import {
  CreateConversationDto,
  ConversationFilterDto,
  ConversationDto,
  CreateMessageDto,
  MessageFilterDto,
  MessageDto,
} from "../../../../shared/types/message.types";

export class DirectMessageIpcHandlers {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
  ) {}

  registerHandlers(): void {
    // Conversation handlers
    ipcMain.handle("dm:conversation:create", this.handleCreateConversation.bind(this));
    ipcMain.handle("dm:conversation:list", this.handleListConversations.bind(this));
    ipcMain.handle("dm:conversation:getById", this.handleGetConversationById.bind(this));
    ipcMain.handle("dm:conversation:findOrCreate", this.handleFindOrCreateDirectMessage.bind(this));

    // Message handlers
    ipcMain.handle("dm:message:create", this.handleCreateMessage.bind(this));
    ipcMain.handle("dm:message:getById", this.handleGetMessageById.bind(this));
    ipcMain.handle("dm:message:getByConversation", this.handleGetConversationMessages.bind(this));
  }

  // Conversation handlers
  private async handleCreateConversation(
    event: IpcMainInvokeEvent,
    data: CreateConversationDto,
  ): Promise<ConversationDto> {
    return await this.conversationService.createConversation(data);
  }

  private async handleListConversations(
    event: IpcMainInvokeEvent,
    filter?: ConversationFilterDto,
  ): Promise<ConversationDto[]> {
    return await this.conversationService.listConversations(filter);
  }

  private async handleGetConversationById(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<ConversationDto | null> {
    return await this.conversationService.getConversationById(data.id);
  }

  private async handleFindOrCreateDirectMessage(
    event: IpcMainInvokeEvent,
    data: { participants: string[] },
  ): Promise<ConversationDto> {
    return await this.conversationService.findOrCreateDirectMessage(data.participants);
  }

  // Message handlers
  private async handleCreateMessage(
    event: IpcMainInvokeEvent,
    data: CreateMessageDto,
  ): Promise<MessageDto> {
    return await this.messageService.createMessage(data);
  }

  private async handleGetMessageById(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<MessageDto | null> {
    return await this.messageService.getMessageById(data.id);
  }

  private async handleGetConversationMessages(
    event: IpcMainInvokeEvent,
    data: { conversationId: string; limit?: number; offset?: number },
  ): Promise<MessageDto[]> {
    return await this.messageService.getConversationMessages(
      data.conversationId,
      data.limit,
      data.offset
    );
  }
}