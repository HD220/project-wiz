import { IProjectStack } from "@/main/modules/code-analysis/application/queries/analyze-project-stack.query";
import { CqrsDispatcher, ICommand } from "@/main/kernel/cqrs-dispatcher";
import { AnalyzeProjectStackQuery } from "@/main/modules/code-analysis/application/queries/analyze-project-stack.query";
import {
  CreatePersonaCommand,
  ICreatePersonaCommandPayload,
} from "@/main/modules/persona-management/application/commands/create-persona.command";
import { LlmConfig } from "@/main/modules/llm-integration/domain/llm-config.entity";
import { GetLlmConfigQuery } from "@/main/modules/llm-integration/application/queries/get-llm-config.query";

export interface HirePersonasAutomaticallyCommandPayload {
  projectId: string;
  projectPath: string;
}

export class HirePersonasAutomaticallyCommand
  implements ICommand<HirePersonasAutomaticallyCommandPayload>
{
  readonly type = "HirePersonasAutomaticallyCommand";
  constructor(public payload: HirePersonasAutomaticallyCommandPayload) {}
}

export class HirePersonasAutomaticallyCommandHandler {
  constructor(private cqrsDispatcher: CqrsDispatcher) {}

  async handle(command: HirePersonasAutomaticallyCommand): Promise<boolean> {
    const { projectPath } = command.payload;

    try {
      const projectStack = await this.analyzeProjectStack(projectPath);
      const llmConfig = await this.getLlmConfig();
      const suggestedPersonas = this.suggestPersonas(projectStack, llmConfig);
      await this.createSuggestedPersonas(suggestedPersonas);

      return true;
    } catch (error) {
      console.error(
        `Failed to hire personas automatically: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  private async analyzeProjectStack(
    projectPath: string,
  ): Promise<IProjectStack> {
    return this.cqrsDispatcher.dispatchQuery<
      AnalyzeProjectStackQuery,
      IProjectStack
    >(new AnalyzeProjectStackQuery({ projectPath }));
  }

  private async getLlmConfig(): Promise<LlmConfig> {
    const llmConfig = await this.cqrsDispatcher.dispatchQuery<
      GetLlmConfigQuery,
      LlmConfig | undefined
    >(new GetLlmConfigQuery({ provider: "openai", model: "gpt-4" }));

    if (!llmConfig) {
      throw new Error("Failed to get LLM config for persona suggestion.");
    }
    return llmConfig;
  }

  private suggestPersonas(
    projectStack: IProjectStack,
    llmConfig: LlmConfig,
  ): ICreatePersonaCommandPayload[] {
    const suggestedPersonas: ICreatePersonaCommandPayload[] = [];

    if (projectStack.frameworks.includes("React")) {
      suggestedPersonas.push({
        name: "Frontend React Developer",
        description: "Expert in React, Redux, and modern frontend development.",
        llmModel: llmConfig.model,
        llmTemperature: llmConfig.temperature,
        tools: ["react-dev-tool", "css-tool"],
      });
    }
    if (projectStack.frameworks.includes("Express.js")) {
      suggestedPersonas.push({
        name: "Backend Node.js Developer",
        description:
          "Proficient in Node.js, Express.js, and database interactions.",
        llmModel: llmConfig.model,
        llmTemperature: llmConfig.temperature,
        tools: ["node-dev-tool", "db-tool"],
      });
    }
    return suggestedPersonas;
  }

  private async createSuggestedPersonas(
    suggestedPersonas: ICreatePersonaCommandPayload[],
  ): Promise<void> {
    for (const personaPayload of suggestedPersonas) {
      try {
        const createPersonaCommand = new CreatePersonaCommand(personaPayload);
        await this.cqrsDispatcher.dispatchCommand(createPersonaCommand);
      } catch (error) {
        console.warn(
          `Failed to create suggested persona ${personaPayload.name}: ${(error as Error).message}`,
        );
      }
    }
  }
}
