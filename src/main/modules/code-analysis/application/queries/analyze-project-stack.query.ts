import { IQuery } from "@/main/kernel/cqrs-dispatcher";

export interface IProjectStack {
  languages: { [key: string]: number };
  frameworks: string[];
  libraries: string[];
}

export interface IAnalyzeProjectStackQueryPayload {
  projectPath: string;
}

export class AnalyzeProjectStackQuery
  implements IQuery<IAnalyzeProjectStackQueryPayload>
{
  readonly type = "AnalyzeProjectStackQuery";
  constructor(public payload: IAnalyzeProjectStackQueryPayload) {}
}

export class AnalyzeProjectStackQueryHandler {
  async handle(query: AnalyzeProjectStackQuery): Promise<IProjectStack> {
    const { projectPath } = query.payload;
    const stack: IProjectStack = {
      languages: {},
      frameworks: [],
      libraries: [],
    };

    try {
      // Simulate analysis for now
      if (projectPath.includes("react")) {
        stack.languages["TypeScript"] = 0.8;
        stack.languages["JavaScript"] = 0.2;
        stack.frameworks.push("React");
        stack.libraries.push("Redux");
      } else if (projectPath.includes("node")) {
        stack.languages["JavaScript"] = 1.0;
        stack.frameworks.push("Express.js");
        stack.libraries.push("Mongoose");
      } else {
        stack.languages["Unknown"] = 1.0;
      }

      return stack;
    } catch (error) {
      console.error(
        `Failed to analyze project stack for path ${projectPath}:`,
        error,
      );
      throw new Error(
        `Failed to analyze project stack: ${(error as Error).message}`,
      );
    }
  }
}
