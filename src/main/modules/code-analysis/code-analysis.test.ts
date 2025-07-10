import { CqrsDispatcher } from "@/main/kernel/cqrs-dispatcher";
import { AnalyzeProjectStackQuery } from "@/main/modules/code-analysis/application/queries/analyze-project-stack.query";
import { IProjectStack } from "@/main/modules/code-analysis/application/queries/analyze-project-stack.query";
import { AnalyzeProjectStackQueryHandler } from "@/main/modules/code-analysis/application/queries/analyze-project-stack.query";

describe("Code Analysis Module", () => {
  let cqrsDispatcher: CqrsDispatcher;

  beforeAll(() => {
    cqrsDispatcher = new CqrsDispatcher();

    const analyzeProjectStackQueryHandler =
      new AnalyzeProjectStackQueryHandler();

    cqrsDispatcher.registerQueryHandler(
      "AnalyzeProjectStackQuery",
      analyzeProjectStackQueryHandler.handle.bind(
        analyzeProjectStackQueryHandler,
      ),
    );
  });

  it("should analyze project stack for a react project", async () => {
    const query = new AnalyzeProjectStackQuery({
      projectPath: "/path/to/react-project",
    });
    const projectStack = await cqrsDispatcher.dispatchQuery<
      AnalyzeProjectStackQuery,
      IProjectStack
    >(query);

    expect(projectStack.languages).toEqual({
      TypeScript: 0.8,
      JavaScript: 0.2,
    });
    expect(projectStack.frameworks).toEqual(["React"]);
    expect(projectStack.libraries).toEqual(["Redux"]);
  });

  it("should analyze project stack for a node project", async () => {
    const query = new AnalyzeProjectStackQuery({
      projectPath: "/path/to/node-project",
    });
    const projectStack = await cqrsDispatcher.dispatchQuery<
      AnalyzeProjectStackQuery,
      IProjectStack
    >(query);

    expect(projectStack.languages).toEqual({ JavaScript: 1.0 });
    expect(projectStack.frameworks).toEqual(["Express.js"]);
    expect(projectStack.libraries).toEqual(["Mongoose"]);
  });

  it("should return unknown for unhandled project types", async () => {
    const query = new AnalyzeProjectStackQuery({
      projectPath: "/path/to/unknown-project",
    });
    const projectStack = await cqrsDispatcher.dispatchQuery<
      AnalyzeProjectStackQuery,
      IProjectStack
    >(query);

    expect(projectStack.languages).toEqual({ Unknown: 1.0 });
    expect(projectStack.frameworks).toEqual([]);
    expect(projectStack.libraries).toEqual([]);
  });
});
