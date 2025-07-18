import { ipcMain } from 'electron';
import { ChannelService } from '../services/channel.service';
import type { 
  CreateChannelInput, 
  UpdateChannelInput 
} from '../../shared/schemas/validation.schemas';
import { handleError } from '../utils/error-handler';

interface ChannelOrder {
  id: string;
  position: number;
}

/**
 * Channel IPC handlers
 */
export function setupChannelHandlers(): void {
  // Create channel
  ipcMain.handle('channels:create', async (_, input: CreateChannelInput, userId: string) => {
    try {
      return await ChannelService.create(input, userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Find channel by ID
  ipcMain.handle('channels:find-by-id', async (_, channelId: string) => {
    try {
      return await ChannelService.findById(channelId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // List channels by project
  ipcMain.handle('channels:list-by-project', async (_, projectId: string) => {
    try {
      return await ChannelService.listByProject(projectId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Update channel
  ipcMain.handle('channels:update', async (_, channelId: string, input: UpdateChannelInput, userId: string) => {
    try {
      return await ChannelService.update(channelId, input, userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Delete channel
  ipcMain.handle('channels:delete', async (_, channelId: string, userId: string) => {
    try {
      await ChannelService.delete(channelId, userId);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Reorder channels
  ipcMain.handle('channels:reorder', async (_, projectId: string, channelOrders: ChannelOrder[], userId: string) => {
    try {
      await ChannelService.reorder(projectId, channelOrders, userId);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
}