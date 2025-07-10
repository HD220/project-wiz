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
import { DrizzleProjectRepository } from "./persistence/drizzle-project.repository";
import { db } from "@/main/persistence/db";

export function registerProjectManagementModule(
  cqrsDispatcher: CqrsDispatcher,
) {
  const projectRepository = new DrizzleProjectRepository(db);
  const createProjectCommandHandler = new CreateProjectCommandHandler(
    projectRepository,
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

  createIpcHandler<IpcProjectCreatePayload, Project>(
    IpcChannel.PROJECT_CREATE,
    cqrsDispatcher,
    async (payload) => {
      const command = new CreateProjectCommand(payload);
      return (await cqrsDispatcher.dispatchCommand(command)) as Project;
    },
  );

  createIpcHandler<undefined, IpcProjectListResponse>(
    IpcChannel.PROJECT_LIST,
    cqrsDispatcher,
    async () => {
      const query = new ListProjectsQuery();
      return (await cqrsDispatcher.dispatchQuery(query)) as Project[];
    },
  );

  createIpcHandler<IpcProjectRemovePayload, void>(
    IpcChannel.PROJECT_REMOVE,
    cqrsDispatcher,
    async (payload) => {
      const command = new RemoveProjectCommand(payload);
      await cqrsDispatcher.dispatchCommand(command);
    },
  );
}
