import { ipcMain } from 'electron';
import { AgentService, CreateAgentInput, UpdateAgentInput } from './agent.service';

export function setupAgentHandlers(): void {
  // Create agent handler
  ipcMain.handle('agents:create', async (event, data: CreateAgentInput) => {
    try {
      const result = await AgentService.create(data);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create agent' 
      };
    }
  });

  // Get agent by ID handler
  ipcMain.handle('agents:find-by-id', async (event, agentId: string) => {
    try {
      const result = await AgentService.findById(agentId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to find agent' 
      };
    }
  });

  // Get agents by creator handler
  ipcMain.handle('agents:find-by-creator', async (event, creatorId: string) => {
    try {
      const result = await AgentService.findByCreator(creatorId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to find agents' 
      };
    }
  });

  // Get project agents handler
  ipcMain.handle('agents:find-project-agents', async (event, projectId: string) => {
    try {
      const result = await AgentService.findProjectAgents(projectId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to find project agents' 
      };
    }
  });

  // Get available agents handler
  ipcMain.handle('agents:get-available', async (event, userId: string) => {
    try {
      const result = await AgentService.getAvailableAgents(userId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get available agents' 
      };
    }
  });

  // Update agent handler
  ipcMain.handle('agents:update', async (event, data: { agentId: string; input: UpdateAgentInput; userId: string }) => {
    try {
      const result = await AgentService.update(data.agentId, data.input, data.userId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update agent' 
      };
    }
  });

  // Update agent status handler
  ipcMain.handle('agents:update-status', async (event, data: { agentId: string; status: string }) => {
    try {
      await AgentService.updateStatus(data.agentId, data.status);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update agent status' 
      };
    }
  });

  // Delete agent handler
  ipcMain.handle('agents:delete', async (event, data: { agentId: string; userId: string }) => {
    try {
      await AgentService.delete(data.agentId, data.userId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete agent' 
      };
    }
  });
}