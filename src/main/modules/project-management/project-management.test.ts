import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { CreateProjectCommand } from "@/main/modules/project-management/application/commands/create-project.command";
import { CreateProjectCommandHandler } from "@/main/modules/project-management/application/commands/create-project.command";
import { RemoveProjectCommand } from "@/main/modules/project-management/application/commands/remove-project.command";
import { RemoveProjectCommandHandler } from "@/main/modules/project-management/application/commands/remove-project.command";
import { ListProjectsQuery } from "@/main/modules/project-management/application/queries/list-projects.query";
import { ListProjectsQueryHandler } from "@/main/modules/project-management/application/queries/list-projects.query";
import { Project } from "@/main/modules/project-management/domain/project.entity";
import { DrizzleProjectRepository } from "@/main/modules/project-management/persistence/drizzle-project.repository";

describe("Project Management Module", () => {
  let cqrsDispatcher: CqrsDispatcher;
  let projectRepository: DrizzleProjectRepository;

  beforeAll(() => {
    cqrsDispatcher = new CqrsDispatcher();
    projectRepository = new DrizzleProjectRepository();

    const createProjectCommandHandler = new CreateProjectCommandHandler(
      projectRepository,
    );
    const listProjectsQueryHandler = new ListProjectsQueryHandler(
      projectRepository,
    );
    const removeProjectCommandHandler = new RemoveProjectCommandHandler(
      projectRepository,
    );

    cqrsDispatcher.registerCommandHandler(
      "CreateProjectCommand",
      createProjectCommandHandler.handle.bind(createProjectCommandHandler),
    );
    cqrsDispatcher.registerQueryHandler(
      "ListProjects",
      listProjectsQueryHandler.handle.bind(listProjectsQueryHandler),
    );
    cqrsDispatcher.registerCommandHandler(
      "RemoveProjectCommand",
      removeProjectCommandHandler.handle.bind(removeProjectCommandHandler),
    );
  });

  beforeEach(async () => {
    // Clear the database before each test
    const allProjects = await projectRepository.findAll();
    for (const project of allProjects) {
      await projectRepository.delete(project.id);
    }
  });

  it("should create a new project", async () => {
    const command = new CreateProjectCommand({ name: "Test Project" });
    const createdProject = await cqrsDispatcher.dispatchCommand<
      CreateProjectCommand,
      Project
    >(command);

    expect(createdProject).toBeInstanceOf(Project);
    expect(createdProject.name).toBe("Test Project");

    const listedProjects = await cqrsDispatcher.dispatchQuery<
      ListProjectsQuery,
      Project[]
    >(new ListProjectsQuery());
    expect(listedProjects.length).toBe(1);
    expect(listedProjects[0].name).toBe("Test Project");
  });

  it("should list all projects", async () => {
    await cqrsDispatcher.dispatchCommand(
      new CreateProjectCommand({ name: "Project 1" }),
    );
    await cqrsDispatcher.dispatchCommand(
      new CreateProjectCommand({ name: "Project 2" }),
    );

    const listedProjects = await cqrsDispatcher.dispatchQuery<
      ListProjectsQuery,
      Project[]
    >(new ListProjectsQuery());

    expect(listedProjects.length).toBe(2);
    expect(listedProjects[0].name).toBe("Project 1");
    expect(listedProjects[1].name).toBe("Project 2");
  });

  it("should remove a project", async () => {
    const createdProject = await cqrsDispatcher.dispatchCommand<
      CreateProjectCommand,
      Project
    >(new CreateProjectCommand({ name: "Project to Remove" }));
    expect(createdProject).toBeInstanceOf(Project);

    const projectId = createdProject.id;
    const removeCommand = new RemoveProjectCommand({ id: projectId });
    const removeResult = await cqrsDispatcher.dispatchCommand<
      RemoveProjectCommand,
      boolean
    >(removeCommand);

    expect(removeResult).toBe(true);

    const listedProjects = await cqrsDispatcher.dispatchQuery<
      ListProjectsQuery,
      Project[]
    >(new ListProjectsQuery());
    expect(listedProjects.length).toBe(0);
  });

  it("should return false if project to remove does not exist", async () => {
    const removeCommand = new RemoveProjectCommand({ id: "non-existent-id" });
    const removeResult = await cqrsDispatcher.dispatchCommand<
      RemoveProjectCommand,
      boolean
    >(removeCommand);

    expect(removeResult).toBe(false);
  });
});
