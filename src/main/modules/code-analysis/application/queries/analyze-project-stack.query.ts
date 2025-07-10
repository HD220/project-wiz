import { IQuery } from "@/main/kernel/cqrs-dispatcher";

export interface ProjectStack {
  languages: { [key: string]: number };
  frameworks: string[];
  libraries: string[];
}

export interface AnalyzeProjectStackQueryPayload {
  projectPath: string;
}

export class AnalyzeProjectStackQuery
  implements IQuery<AnalyzeProjectStackQueryPayload>
{
  readonly type = "AnalyzeProjectStackQuery";
  constructor(public payload: AnalyzeProjectStackQueryPayload) {}
}

export class AnalyzeProjectStackQueryHandler {
  async handle(query: AnalyzeProjectStackQuery): Promise<ProjectStack> {
    const { projectPath } = query.payload;
    const stack: ProjectStack = {
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
