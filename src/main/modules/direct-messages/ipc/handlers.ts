import { ipcMain, IpcMainInvokeEvent } from "electron";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";
import { ConversationMapper } from "../mappers/conversation.mapper";
import { MessageMapper } from "../mappers/message.mapper";
import {
  CreateConversationDto,
  ConversationDto,
  CreateMessageDto,
  MessageDto,
  UpdateMessageDto,
} from "../../../../shared/types/message.types";

export class DirectMessageIpcHandlers {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private conversationMapper: ConversationMapper,
    private messageMapper: MessageMapper
  ) {}

  registerHandlers(): void {
    // Conversation handlers
    ipcMain.handle("dm:conversation:create", this.handleCreateConversation.bind(this));
    ipcMain.handle("dm:conversation:getById", this.handleGetConversationById.bind(this));
    ipcMain.handle("dm:conversation:findOrCreate", this.handleFindOrCreateConversation.bind(this));
    ipcMain.handle("dm:conversation:delete", this.handleDeleteConversation.bind(this));

    // Message handlers
    ipcMain.handle("dm:message:create", this.handleCreateMessage.bind(this));
    ipcMain.handle("dm:message:getById", this.handleGetMessageById.bind(this));
    ipcMain.handle("dm:message:listByConversation", this.handleListMessagesByConversation.bind(this));
    ipcMain.handle("dm:message:update", this.handleUpdateMessage.bind(this));
    ipcMain.handle("dm:message:delete", this.handleDeleteMessage.bind(this));
  }

  // Conversation handlers
  private async handleCreateConversation(
    event: IpcMainInvokeEvent,
    data: CreateConversationDto,
  ): Promise<ConversationDto> {
    const conversation = await this.conversationService.createConversation(data);
    return this.conversationMapper.toDtoFromData(conversation);
  }

  private async handleGetConversationById(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<ConversationDto | null> {
    const conversation = await this.conversationService.getConversationById(data);
    return conversation ? this.conversationMapper.toDtoFromData(conversation) : null;
  }

  private async handleFindOrCreateConversation(
    event: IpcMainInvokeEvent,
    data: { userId1: string, userId2: string },
  ): Promise<ConversationDto> {
    const conversation = await this.conversationService.findOrCreateConversation(data);
    return this.conversationMapper.toDtoFromData(conversation);
  }

  private async handleDeleteConversation(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<void> {
    await this.conversationService.deleteConversation(data);
  }

  // Message handlers
  private async handleCreateMessage(
    event: IpcMainInvokeEvent,
    data: CreateMessageDto,
  ): Promise<MessageDto> {
    const message = await this.messageService.createMessage(data);
    return this.messageMapper.toDtoFromData(message);
  }

  private async handleGetMessageById(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<MessageDto | null> {
    const message = await this.messageService.getMessageById(data);
    return message ? this.messageMapper.toDtoFromData(message) : null;
  }

  private async handleListMessagesByConversation(
    event: IpcMainInvokeEvent,
    data: { conversationId: string },
  ): Promise<MessageDto[]> {
    const messages = await this.messageService.listMessagesByConversation(data);
    return messages.map(message => this.messageMapper.toDtoFromData(message));
  }

  private async handleUpdateMessage(
    event: IpcMainInvokeEvent,
    data: UpdateMessageDto,
  ): Promise<MessageDto> {
    const message = await this.messageService.updateMessage(data);
    return this.messageMapper.toDtoFromData(message);
  }

  private async handleDeleteMessage(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<void> {
    await this.messageService.deleteMessage(data);
  }
}