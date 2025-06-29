// src_refactored/presentation/electron/main/ipc-project.handlers.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';

import { ListProjectsUseCase } from '@/core/application/use-cases/project/list-projects.use-case';
// LoggerServiceToken and ProjectRepositoryToken are used by the use case, not directly here.

import { appContainer } from '@/infrastructure/ioc/inversify.config'; // This import is the source of the boundary violation.
// We will keep it for now, but ideally, the use case is passed to this handler's registration.
// Removing direct infra imports:
// import { db, schema } from '@/infrastructure/persistence/drizzle/drizzle.client';
// import { DrizzleProjectRepository } from '@/infrastructure/persistence/drizzle/repositories/project.repository';
// import { ConsoleLoggerService } from '@/infrastructure/services/logger/console-logger.service';

import { IPCChannel } from '@/shared/ipc-channels';
import { ProjectListItem } from '@/shared/ipc-project.types'; // Ensure this path is correct




// Placeholder for actual ProjectRepository implementation if DI is not fully set up for main process
// This is a simplified setup for demonstration. A real app would use DI.
let listProjectsUseCase: ListProjectsUseCase;

function initializeUseCases() {
    if (appContainer.isBound(ListProjectsUseCase)) {
        listProjectsUseCase = appContainer.get(ListProjectsUseCase);
    } else {
        // Fallback manual instantiation removed.
        // If ListProjectsUseCase is not bound, an error should occur or be handled by DI setup.
        console.error("[IPC Project Handler] CRITICAL: ListProjectsUseCase not bound in DI container. Cannot proceed with manual instantiation.");
        // listProjectsUseCase remains undefined or null, which will be caught below.
    }
}


export function registerProjectIPCHandlers(): void {
  initializeUseCases();

  ipcMain.handle(IPCChannel.PROJECT_LIST_QUERY, async (event: IpcMainInvokeEvent) => {
    console.log(`[IPC Project Handler] Received ${IPCChannel.PROJECT_LIST_QUERY}`);
    try {
      if (!listProjectsUseCase) {
        // Attempt re-initialization or throw if still not available.
        // initializeUseCases(); // Calling it again might not solve if the root issue is DI setup.
        // Forcing re-check:
        if (!appContainer.isBound(ListProjectsUseCase)) {
             console.error("[IPC Project Handler] ListProjectsUseCase is NOT BOUND on demand. Check DI config.");
             throw new Error("ListProjectsUseCase could not be initialized - not bound in DI container.");
        }
        listProjectsUseCase = appContainer.get(ListProjectsUseCase); // Try to get it again
        if (!listProjectsUseCase) { // Should not happen if isBound is true and get doesn't throw
             throw new Error("ListProjectsUseCase could not be initialized even after re-check.");
        }
      }

      const result = await listProjectsUseCase.execute();

      if (result.isSuccess()) {
        const projects = result.value;
        // Map domain entities to ProjectListItem DTOs
        const projectListItems: ProjectListItem[] = projects.map(project => ({
          id: project.id.value,
          name: project.name.value,
          description: project.description?.value,
          createdAt: project.createdAt.toISOString(),
          updatedAt: project.updatedAt.toISOString(),
          // ownerName: project.owner?.name.value, // Example, if Project entity has owner
          // thumbnailUrl: project.thumbnailUrl?.value, // Example
        }));
        console.log(`[IPC Project Handler] Sending ${projectListItems.length} projects.`);
        return { success: true, data: projectListItems };
      } 
        console.error('[IPC Project Handler] Error listing projects:', result.error);
        return { success: false, error: { message: result.error.message, name: result.error.name } };
      
    } catch (error: any) {
      console.error('[IPC Project Handler] Exception in project:list handler:', error);
      return { success: false, error: { message: error.message || 'An unexpected error occurred while listing projects.' } };
    }
  });

  console.log('[IPC Project Handler] Project IPC handlers registered.');
}

export function unregisterProjectIPCHandlers(): void {
  ipcMain.removeHandler(IPCChannel.PROJECT_LIST_QUERY);
  console.log('[IPC Project Handler] Project IPC handlers unregistered.');
}
