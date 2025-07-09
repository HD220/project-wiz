
import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { DrizzleProjectRepository } from "@/main/modules/project-management/persistence/drizzle-project.repository";

import { CreateProjectCommandHandler } from "./application/commands/create-project.command";
import { RemoveProjectCommandHandler } from "./application/commands/remove-project.command";
import { ListProjectsQueryHandler } from "./application/queries/list-projects.query";

export function registerProjectManagementModule(cqrsDispatcher: CqrsDispatcher) {
  const projectRepository = new DrizzleProjectRepository();

  const createProjectCommandHandler = new CreateProjectCommandHandler(projectRepository);
  const listProjectsQueryHandler = new ListProjectsQueryHandler(projectRepository);
  const removeProjectCommandHandler = new RemoveProjectCommandHandler(projectRepository);

  cqrsDispatcher.registerCommandHandler("CreateProjectCommand", createProjectCommandHandler.handle.bind(createProjectCommandHandler));
  cqrsDispatcher.registerQueryHandler("ListProjectsQuery", listProjectsQueryHandler.handle.bind(listProjectsQueryHandler));
  cqrsDispatcher.registerCommandHandler("RemoveProjectCommand", removeProjectCommandHandler.handle.bind(removeProjectCommandHandler));
}