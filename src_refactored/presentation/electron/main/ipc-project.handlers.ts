// src_refactored/presentation/electron/main/ipc-project.handlers.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';

import { ListProjectsUseCase } from '@/core/application/use-cases/project/list-projects.use-case';
import { LoggerServiceToken } from '@/core/common/services/i-logger.service';
import { ProjectRepositoryToken } from '@/core/domain/project/ports/project-repository.interface';

import { appContainer } from '@/infrastructure/ioc/inversify.config'; // Assuming DI container
import { db, schema } from '@/infrastructure/persistence/drizzle/drizzle.client'; // Example db client and schema
import { DrizzleProjectRepository } from '@/infrastructure/persistence/drizzle/repositories/project.repository'; // Example concrete repo
import { ConsoleLoggerService } from '@/infrastructure/services/logger/console-logger.service'; // Example Logger

import { IPCChannel } from '@/shared/ipc-channels';
import { ProjectListItem } from '@/shared/ipc-project.types'; // Ensure this path is correct




// Placeholder for actual ProjectRepository implementation if DI is not fully set up for main process
// This is a simplified setup for demonstration. A real app would use DI.
let listProjectsUseCase: ListProjectsUseCase;

function initializeUseCases() {
    if (appContainer.isBound(ListProjectsUseCase)) {
        listProjectsUseCase = appContainer.get(ListProjectsUseCase);
    } else {
        console.warn("[IPC Project Handler] ListProjectsUseCase not bound in DI. Attempting manual instantiation (may be incomplete).");
        // Manual instantiation as a fallback (less ideal)
        // This requires knowing all dependencies of ListProjectsUseCase and its own dependencies.
        // This is a common issue when DI isn't fully integrated into the Electron main process early.
        let projectRepo;
        if (appContainer.isBound(ProjectRepositoryToken)) {
            projectRepo = appContainer.get(ProjectRepositoryToken);
        } else {
            console.warn("[IPC Project Handler] ProjectRepositoryToken not bound in DI for ListProjectsUseCase. Using direct DrizzleProjectRepository.");
            // This is highly simplified and likely won't work without a proper DB connection configured for main process
            // and potentially migrations run.
            projectRepo = new DrizzleProjectRepository(db, schema, new ConsoleLoggerService('DrizzleProjectRepo'));
        }
        let logger;
        if(appContainer.isBound(LoggerServiceToken)) {
            logger = appContainer.get(LoggerServiceToken);
        } else {
            logger = new ConsoleLoggerService('ListProjectsUseCase');
        }
        listProjectsUseCase = new ListProjectsUseCase(projectRepo, logger);
    }
}


export function registerProjectIPCHandlers(): void {
  initializeUseCases(); // Initialize use case (DI or manual)

  ipcMain.handle(IPCChannel.PROJECT_LIST_QUERY, async (event: IpcMainInvokeEvent) => {
    console.log(`[IPC Project Handler] Received ${IPCChannel.PROJECT_LIST_QUERY}`);
    try {
      if (!listProjectsUseCase) {
        // Re-initialize if it wasn't ready on first call (e.g. async DI setup)
        initializeUseCases();
        if (!listProjectsUseCase) {
          throw new Error("ListProjectsUseCase could not be initialized.");
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
