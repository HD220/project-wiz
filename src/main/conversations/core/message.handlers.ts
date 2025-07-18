import { ipcMain } from 'electron';
import { MessageService, CreateMessageInput } from './message.service';

export function setupMessageHandlers(): void {
  // Create message handler
  ipcMain.handle('messages:create', async (event, data: CreateMessageInput) => {
    try {
      const result = await MessageService.create(data);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create message' 
      };
    }
  });

  // Get channel messages handler
  ipcMain.handle('messages:get-channel-messages', async (event, data: { channelId: string; limit?: number; before?: string }) => {
    try {
      const result = await MessageService.findChannelMessages(data.channelId, data.limit, data.before);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get channel messages' 
      };
    }
  });

  // Get DM messages handler
  ipcMain.handle('messages:get-dm-messages', async (event, data: { dmConversationId: string; limit?: number; before?: string }) => {
    try {
      const result = await MessageService.findDMMessages(data.dmConversationId, data.limit, data.before);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get DM messages' 
      };
    }
  });

  // Get message by ID handler
  ipcMain.handle('messages:find-by-id', async (event, messageId: string) => {
    try {
      const result = await MessageService.findById(messageId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to find message' 
      };
    }
  });

  // Update message handler
  ipcMain.handle('messages:update', async (event, data: { messageId: string; content: string; authorId: string }) => {
    try {
      const result = await MessageService.update(data.messageId, data.content, data.authorId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update message' 
      };
    }
  });

  // Delete message handler
  ipcMain.handle('messages:delete', async (event, data: { messageId: string; authorId: string }) => {
    try {
      await MessageService.delete(data.messageId, data.authorId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete message' 
      };
    }
  });
}