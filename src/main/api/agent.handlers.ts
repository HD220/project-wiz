import { ipcMain } from 'electron';
import { AgentService } from '../services/agent.service';
import type { 
  CreateAgentInput, 
  UpdateAgentInput 
} from '../../shared/schemas/validation.schemas';
import type { AgentStatus } from '../../shared/types/common';
import { handleError } from '../utils/error-handler';

/**
 * Agent IPC handlers
 */
export function setupAgentHandlers(): void {
  // Create agent
  ipcMain.handle('agents:create', async (_, input: CreateAgentInput, userId: string) => {
    try {
      return await AgentService.create(input, userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Find agent by ID
  ipcMain.handle('agents:find-by-id', async (_, agentId: string) => {
    try {
      return await AgentService.findById(agentId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // List global agents for user
  ipcMain.handle('agents:list-global', async (_, userId: string) => {
    try {
      return await AgentService.listGlobal(userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // List agents by project
  ipcMain.handle('agents:list-by-project', async (_, projectId: string) => {
    try {
      return await AgentService.listByProject(projectId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Update agent
  ipcMain.handle('agents:update', async (_, agentId: string, input: UpdateAgentInput, userId: string) => {
    try {
      return await AgentService.update(agentId, input, userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Delete agent
  ipcMain.handle('agents:delete', async (_, agentId: string, userId: string) => {
    try {
      await AgentService.delete(agentId, userId);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Update agent status
  ipcMain.handle('agents:update-status', async (_, agentId: string, status: AgentStatus) => {
    try {
      await AgentService.updateStatus(agentId, status);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Start agent
  ipcMain.handle('agents:start', async (_, agentId: string) => {
    try {
      await AgentService.updateStatus(agentId, 'online');
      // TODO: Start agent worker
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Stop agent
  ipcMain.handle('agents:stop', async (_, agentId: string) => {
    try {
      await AgentService.updateStatus(agentId, 'offline');
      // TODO: Stop agent worker
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Get agent status
  ipcMain.handle('agents:get-status', async (_, agentId: string) => {
    try {
      const agent = await AgentService.findById(agentId);
      return agent?.status || 'offline';
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Send message to agent
  ipcMain.handle('agents:send-message', async (_, agentId: string, message: string) => {
    try {
      return await AgentService.sendMessage(agentId, message);
    } catch (error) {
      throw handleError(error);
    }
  });
}