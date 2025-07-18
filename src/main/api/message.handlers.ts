import { ipcMain } from 'electron';
import { ChatService } from '../services/chat.service';
import type { 
  SendMessageInput,
  ListOptions
} from '../../shared/schemas/validation.schemas';
import { handleError } from '../utils/error-handler';

/**
 * Message IPC handlers
 */
export function setupMessageHandlers(): void {
  // Send message
  ipcMain.handle('messages:send', async (_, input: SendMessageInput, userId: string) => {
    try {
      return await ChatService.sendMessage(input, userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // List messages by channel
  ipcMain.handle('messages:list-by-channel', async (_, channelId: string, options?: ListOptions) => {
    try {
      return await ChatService.listByChannel(channelId, options);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // List messages by DM conversation
  ipcMain.handle('messages:list-by-dm', async (_, conversationId: string, options?: ListOptions) => {
    try {
      return await ChatService.listByDM(conversationId, options);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Update message
  ipcMain.handle('messages:update', async (_, messageId: string, content: string, userId: string) => {
    try {
      return await ChatService.updateMessage(messageId, content, userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Delete message
  ipcMain.handle('messages:delete', async (_, messageId: string, userId: string) => {
    try {
      await ChatService.deleteMessage(messageId, userId);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Get or create DM conversation
  ipcMain.handle('messages:get-or-create-dm', async (_, userId: string, agentId: string) => {
    try {
      return await ChatService.getOrCreateDMConversation(userId, agentId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // List DM conversations
  ipcMain.handle('messages:list-dm-conversations', async (_, userId: string) => {
    try {
      return await ChatService.listDMConversations(userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Mark as read
  ipcMain.handle('messages:mark-as-read', async (_, conversationId: string, userId: string) => {
    try {
      await ChatService.markAsRead(conversationId, userId);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // TODO: Real-time message subscription
  // This would need to be implemented with WebSockets or EventEmitter
  ipcMain.handle('messages:subscribe', async (_, channelId: string) => {
    try {
      // For now, return success
      // Real implementation would set up event listeners
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
}