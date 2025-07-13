import { ipcMain, IpcMainInvokeEvent } from "electron";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";
import { AIMessageService } from "../services/ai-message.service";
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
    private aiMessageService: AIMessageService,
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
    
    // AI Message handlers
    ipcMain.handle("dm:ai:processUserMessage", this.handleProcessUserMessage.bind(this));
    ipcMain.handle("dm:ai:regenerateResponse", this.handleRegenerateResponse.bind(this));
    ipcMain.handle("dm:ai:validatePersona", this.handleValidatePersona.bind(this));
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

  // AI Message handlers
  private async handleProcessUserMessage(
    event: IpcMainInvokeEvent,
    data: { conversationId: string; message: string; userId?: string }
  ): Promise<ReadableStream> {
    try {
      console.log('[DM IPC] Processing user message:', data);
      const stream = await this.aiMessageService.processUserMessage(
        data.conversationId,
        data.message,
        data.userId
      );
      console.log('[DM IPC] Returning stream for:', data.conversationId);
      return stream;
    } catch (error) {
      console.error('[DM IPC] Error processing user message:', error);
      throw new Error(`Failed to process message: ${(error as Error).message}`);
    }
  }

  private async handleRegenerateResponse(
    event: IpcMainInvokeEvent,
    data: { conversationId: string }
  ): Promise<MessageDto | null> {
    try {
      return await this.aiMessageService.regenerateLastResponse(data.conversationId);
    } catch (error) {
      console.error('Error regenerating response:', error);
      throw new Error(`Failed to regenerate response: ${(error as Error).message}`);
    }
  }

  private async handleValidatePersona(
    event: IpcMainInvokeEvent,
    data: { personaId: string }
  ): Promise<boolean> {
    try {
      return await this.aiMessageService.validatePersonaForMessaging(data.personaId);
    } catch (error) {
      console.error('Error validating persona:', error);
      return false;
    }
  }
}