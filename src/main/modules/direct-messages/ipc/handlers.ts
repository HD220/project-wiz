import { ipcMain, IpcMainInvokeEvent } from "electron";
import { ConversationService } from "../application/conversation.service";
import { MessageService } from "../application/message.service";
import { AgentConversationService } from "../application/agent-conversation.service";
import {
  CreateConversationDto,
  ConversationFilterDto,
  ConversationDto,
  CreateMessageDto,
  MessageDto,
} from "../../../../shared/types/message.types";

export class DirectMessageIpcHandlers {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
    private agentConversationService: AgentConversationService,
  ) {}

  registerHandlers(): void {
    // Conversation handlers
    ipcMain.handle(
      "dm:conversation:create",
      this.handleCreateConversation.bind(this),
    );
    ipcMain.handle(
      "dm:conversation:list",
      this.handleListConversations.bind(this),
    );
    ipcMain.handle(
      "dm:conversation:getById",
      this.handleGetConversationById.bind(this),
    );
    ipcMain.handle(
      "dm:conversation:findOrCreate",
      this.handleFindOrCreateDirectMessage.bind(this),
    );

    // Message handlers
    ipcMain.handle("dm:message:create", this.handleCreateMessage.bind(this));
    ipcMain.handle("dm:message:getById", this.handleGetMessageById.bind(this));
    ipcMain.handle(
      "dm:message:getByConversation",
      this.handleGetConversationMessages.bind(this),
    );
    ipcMain.handle("dm:message:delete", this.handleDeleteMessage.bind(this));

    // Agent conversation handlers (new simplified interface)
    ipcMain.handle(
      "dm:agent:sendMessage",
      this.handleSendMessageToAgent.bind(this),
    );
    ipcMain.handle(
      "dm:agent:regenerateResponse",
      this.handleRegenerateResponse.bind(this),
    );
    ipcMain.handle(
      "dm:agent:validateConversation",
      this.handleValidateConversation.bind(this),
    );
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
    return await this.conversationService.findOrCreateDirectMessage(
      data.participants,
    );
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
      data.offset,
    );
  }

  private async handleDeleteMessage(
    event: IpcMainInvokeEvent,
    data: { id: string },
  ): Promise<void> {
    return await this.messageService.deleteMessage(data.id);
  }

  // Agent conversation handlers (new simplified interface)
  private async handleSendMessageToAgent(
    event: IpcMainInvokeEvent,
    data: { conversationId: string; message: string; userId?: string },
  ): Promise<{ userMessage: MessageDto; agentMessage: MessageDto }> {
    try {
      console.log("[DM IPC] Processing user message to agent:", data);
      const result = await this.agentConversationService.processUserMessage({
        conversationId: data.conversationId,
        userMessage: data.message,
        userId: data.userId,
      });
      console.log("[DM IPC] Agent response generated successfully");
      return result;
    } catch (error) {
      console.error("[DM IPC] Error processing user message:", error);
      throw new Error(`Failed to process message: ${(error as Error).message}`);
    }
  }

  private async handleRegenerateResponse(
    event: IpcMainInvokeEvent,
    data: { conversationId: string },
  ): Promise<MessageDto> {
    try {
      return await this.agentConversationService.regenerateLastResponse(
        data.conversationId,
      );
    } catch (error) {
      console.error("Error regenerating response:", error);
      throw new Error(
        `Failed to regenerate response: ${(error as Error).message}`,
      );
    }
  }

  private async handleValidateConversation(
    event: IpcMainInvokeEvent,
    data: { conversationId: string },
  ): Promise<boolean> {
    try {
      return await this.agentConversationService.validateAgentForConversation(
        data.conversationId,
      );
    } catch (error) {
      console.error("Error validating conversation:", error);
      return false;
    }
  }
}
