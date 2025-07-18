import { ipcMain } from 'electron';
import { ProjectService } from '../services/project.service';
import { AgentService } from '../services/agent.service';
import type { 
  CreateProjectInput, 
  UpdateProjectInput 
} from '../../shared/schemas/validation.schemas';
import { handleError } from '../utils/error-handler';

/**
 * Project IPC handlers
 */
export function setupProjectHandlers(): void {
  // Create project
  ipcMain.handle('projects:create', async (_, input: CreateProjectInput, userId: string) => {
    try {
      return await ProjectService.create(input, userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Find project by ID
  ipcMain.handle('projects:find-by-id', async (_, projectId: string) => {
    try {
      return await ProjectService.findById(projectId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Find projects by user
  ipcMain.handle('projects:find-by-user', async (_, userId: string) => {
    try {
      return await ProjectService.findByUser(userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Update project
  ipcMain.handle('projects:update', async (_, projectId: string, input: UpdateProjectInput, userId: string) => {
    try {
      return await ProjectService.update(projectId, input, userId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Archive project
  ipcMain.handle('projects:archive', async (_, projectId: string, userId: string) => {
    try {
      await ProjectService.archive(projectId, userId);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Delete project
  ipcMain.handle('projects:delete', async (_, projectId: string, userId: string) => {
    try {
      await ProjectService.delete(projectId, userId);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Initialize Git repository
  ipcMain.handle('projects:init-git', async (_, projectId: string, gitUrl?: string) => {
    try {
      await ProjectService.initializeGit(projectId, gitUrl);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Clone repository
  ipcMain.handle('projects:clone-repository', async (_, projectId: string, gitUrl: string) => {
    try {
      await ProjectService.cloneRepository(projectId, gitUrl);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  // Agent association management
  ipcMain.handle('projects:add-agent', async (_, projectId: string, agentId: string, role: string, userId: string) => {
    try {
      await AgentService.addToProject(agentId, projectId, role, userId);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  ipcMain.handle('projects:remove-agent', async (_, projectId: string, agentId: string) => {
    try {
      await AgentService.removeFromProject(agentId, projectId);
      return { success: true };
    } catch (error) {
      throw handleError(error);
    }
  });
  
  ipcMain.handle('projects:list-agents', async (_, projectId: string) => {
    try {
      return await AgentService.listByProject(projectId);
    } catch (error) {
      throw handleError(error);
    }
  });
  
  ipcMain.handle('projects:list-project-agents', async (_, projectId: string) => {
    try {
      return await AgentService.listProjectAgents(projectId);
    } catch (error) {
      throw handleError(error);
    }
  });
}