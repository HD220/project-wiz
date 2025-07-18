import { ipcMain } from 'electron';
import { ProjectService, CreateProjectInput, UpdateProjectInput } from './project.service';

export function setupProjectHandlers(): void {
  // Create project handler
  ipcMain.handle('projects:create', async (event, data: CreateProjectInput) => {
    try {
      const result = await ProjectService.create(data);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create project' 
      };
    }
  });

  // Get project by ID handler
  ipcMain.handle('projects:find-by-id', async (event, projectId: string) => {
    try {
      const result = await ProjectService.findById(projectId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to find project' 
      };
    }
  });

  // Get projects by owner handler
  ipcMain.handle('projects:find-by-owner', async (event, ownerId: string) => {
    try {
      const result = await ProjectService.findByOwnerId(ownerId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to find projects' 
      };
    }
  });

  // Get user projects handler
  ipcMain.handle('projects:find-user-projects', async (event, userId: string) => {
    try {
      const result = await ProjectService.findUserProjects(userId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to find user projects' 
      };
    }
  });

  // Update project handler
  ipcMain.handle('projects:update', async (event, data: { projectId: string; input: UpdateProjectInput; userId: string }) => {
    try {
      const result = await ProjectService.update(data.projectId, data.input, data.userId);
      return { success: true, data: result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update project' 
      };
    }
  });

  // Archive project handler
  ipcMain.handle('projects:archive', async (event, data: { projectId: string; userId: string }) => {
    try {
      await ProjectService.archive(data.projectId, data.userId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to archive project' 
      };
    }
  });

  // Delete project handler
  ipcMain.handle('projects:delete', async (event, data: { projectId: string; userId: string }) => {
    try {
      await ProjectService.delete(data.projectId, data.userId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete project' 
      };
    }
  });

  // Add agent to project handler
  ipcMain.handle('projects:add-agent', async (event, data: { projectId: string; agentId: string; role: string; userId: string }) => {
    try {
      await ProjectService.addAgent(data.projectId, data.agentId, data.role, data.userId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add agent to project' 
      };
    }
  });

  // Remove agent from project handler
  ipcMain.handle('projects:remove-agent', async (event, data: { projectId: string; agentId: string; userId: string }) => {
    try {
      await ProjectService.removeAgent(data.projectId, data.agentId, data.userId);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to remove agent from project' 
      };
    }
  });
}