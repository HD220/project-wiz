import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import {
  CreateProjectCommand,
  CreateProjectCommandHandler,
} from "@/main/modules/project-management/application/commands/create-project.command";
import {
  RemoveProjectCommand,
  RemoveProjectCommandHandler,
} from "@/main/modules/project-management/application/commands/remove-project.command";
import {
  ListProjectsQuery,
  ListProjectsQueryHandler,
} from "@/main/modules/project-management/application/queries/list-projects.query";
import { Project } from "@/main/modules/project-management/domain/project.entity";
import { DrizzleProjectRepository } from "@/main/modules/project-management/persistence/drizzle-project.repository";

function registerProjectHandlers(
  cqrsDispatcher: CqrsDispatcher,
  projectRepository: DrizzleProjectRepository,
  createProjectCommandHandler: CreateProjectCommandHandler,
  listProjectsQueryHandler: ListProjectsQueryHandler,
  removeProjectCommandHandler: RemoveProjectCommandHandler,
) {
  cqrsDispatcher.registerCommandHandler<CreateProjectCommand, Project>(
    "CreateProjectCommand",
    createProjectCommandHandler.handle.bind(createProjectCommandHandler),
  );
  cqrsDispatcher.registerQueryHandler<ListProjectsQuery, Project[]>(
    "ListProjectsQuery",
    listProjectsQueryHandler.handle.bind(listProjectsQueryHandler),
  );
  cqrsDispatcher.registerCommandHandler<RemoveProjectCommand, boolean>(
    "RemoveProjectCommand",
    removeProjectCommandHandler.handle.bind(removeProjectCommandHandler),
  );
}

export function initializeProjectManagement(cqrsDispatcher: CqrsDispatcher) {
  const projectRepository = new DrizzleProjectRepository();
  const createProjectCommandHandler = new CreateProjectCommandHandler(
    projectRepository,
  );
  const listProjectsQueryHandler = new ListProjectsQueryHandler(
    projectRepository,
  );
  const removeProjectCommandHandler = new RemoveProjectCommandHandler(
    projectRepository,
  );

  registerProjectHandlers(
    cqrsDispatcher,
    projectRepository,
    createProjectCommandHandler,
    listProjectsQueryHandler,
    removeProjectCommandHandler,
  );
}
