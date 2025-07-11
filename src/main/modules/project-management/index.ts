import type { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { createIpcHandler } from "@/main/kernel/ipc-handler-utility";
import { IpcChannel } from "@/shared/ipc-types/ipc-channels";
import type {
  IpcProjectCreatePayload,
  IpcProjectListResponse,
  IpcProjectRemovePayload,
} from "@/shared/ipc-types/ipc-payloads";
import { CreateProjectCommand, CreateProjectCommandHandler } from "./application/commands/create-project.command";
import { ListProjectsQuery, ListProjectsQueryHandler } from "./application/queries/list-projects.query";
import { RemoveProjectCommand, RemoveProjectCommandHandler } from "./application/commands/remove-project.command";
import type { Project } from "./domain/project.entity";
import { GitIntegrationService } from "@/main/modules/git-integration/domain/git-integration.service";
import { FilesystemService } from "@/main/modules/filesystem-tools/domain/filesystem.service";
import { IpcResponse } from "@/shared/ipc-types/ipc-contracts";
import { DrizzleProjectRepository } from "./persistence/drizzle-project.repository";
import { db } from "@/main/persistence/db";

export function registerProjectManagementModule(
  cqrsDispatcher: CqrsDispatcher,
) {
  const projectRepository = new DrizzleProjectRepository(db);
  const filesystemService = new FilesystemService();
  const gitIntegrationService = new GitIntegrationService();
  const createProjectCommandHandler = new CreateProjectCommandHandler(
    projectRepository,
    filesystemService,
    gitIntegrationService,
  );
  const listProjectsQueryHandler = new ListProjectsQueryHandler(
    projectRepository,
  );
  const removeProjectCommandHandler = new RemoveProjectCommandHandler(
    projectRepository,
  );

  cqrsDispatcher.registerCommandHandler<CreateProjectCommand, Project>(
    CreateProjectCommand.name,
    createProjectCommandHandler.handle.bind(createProjectCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListProjectsQuery, Project[]>(
    ListProjectsQuery.name,
    listProjectsQueryHandler.handle.bind(listProjectsQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler<RemoveProjectCommand, boolean>(
    RemoveProjectCommand.name,
    removeProjectCommandHandler.handle.bind(removeProjectCommandHandler),
  );

  createIpcHandler<IpcProjectCreatePayload, IpcProjectCreateResponse>(
    IpcChannel.PROJECT_CREATE,
    cqrsDispatcher,
    async (payload) => {
      const command = new CreateProjectCommand(payload);
      const project = (await cqrsDispatcher.dispatchCommand(command)) as Project;
      return { success: true, data: project };
    },
  );

  createIpcHandler<undefined, IpcProjectListResponse>(
    IpcChannel.PROJECT_LIST,
    cqrsDispatcher,
    async () => {
      const query = new ListProjectsQuery();
      const projects = (await cqrsDispatcher.dispatchQuery(query)) as Project[];
      return { success: true, data: projects };
    },
  );

  createIpcHandler<IpcProjectRemovePayload, IpcProjectRemoveResponse>(
    IpcChannel.PROJECT_REMOVE,
    cqrsDispatcher,
    async (payload) => {
      const command = new RemoveProjectCommand(payload);
      const success = (await cqrsDispatcher.dispatchCommand(command)) as boolean;
      return { success: success };
    },
  );
}
